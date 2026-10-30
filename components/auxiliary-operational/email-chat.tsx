"use client";
import {
  auxiliaryFetch,
  isRequestCanceled,
} from "@/lib/auxiliary-operational/client";
import { useRefreshableEffect } from "@/hooks/useAuxiliaryOperational";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { auxiliaryEmailSignature } from "@/lib/auxiliary-operational/domain/auxiliary-email";
import { Copy, Mail, Send } from "lucide-react";
type Answer = { answer: string; subject: string; body: string };
type Turn = { id: string; question: string; answer: Answer };
export default function EmailChat({
  module = "reservations",
}: {
  module?:
    | "reservations"
    | "work"
    | "auxiliary"
    | "commercial"
    | "consolidator";
}) {
  const consolidator = module === "consolidator",
    commercial = module === "commercial",
    auxiliary = module === "auxiliary",
    work = module === "work",
    endpoint = consolidator
      ? "/api/consolidator/email"
      : commercial
        ? "/api/commercial/chat"
        : auxiliary
          ? "/api/auxiliary-operational/chat"
          : work
            ? "/api/work/chat"
            : "/api/reservations/chat",
    label = consolidator
      ? "Pagos consolidador y precompras"
      : commercial
        ? "Comercial"
        : auxiliary
          ? "Auxiliares operativos"
          : work
            ? "Plan de trabajo"
            : "Reservas";
  const [canEditPrompts, setCanEditPrompts] = useState(false),
    [enabled, setEnabled] = useState(false),
    [loading, setLoading] = useState(true),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [turns, setTurns] = useState<Turn[]>([]),
    [draft, setDraft] = useState({ subject: "", body: "" });
  const [recipient, setRecipient] = useState("Operador internacional"),
    [language, setLanguage] = useState(
      "Según la solicitud o el correo recibido",
    );
  const thread = useRef(""),
    pending = useRef<{
      threadId: string;
      requestId: string;
      message: string;
    } | null>(null),
    tail = useRef<HTMLDivElement>(null);
  useRefreshableEffect(() => {
    const c = new AbortController();
    auxiliaryFetch(endpoint, { cache: "no-store", signal: c.signal })
      .then(async (r) => {
        const d = (await r.json()) as {
          error?: string;
          enabled: boolean;
          canEditPrompts?: boolean;
        };
        if (!r.ok) throw Error(d.error || "No se pudo consultar la conexión.");
        setEnabled(d.enabled);
        setCanEditPrompts(!!d.canEditPrompts);
      })
      .catch((e) => {
        if (!isRequestCanceled(e)) setError(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [endpoint]);
  useEffect(() => {
    if (turns.length)
      tail.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [turns.length]);
  async function send(e: FormEvent) {
    e.preventDefault();
    if (busy || !message.trim() || !enabled) return;
    setBusy(true);
    setError("");
    setNotice("");
    if (!thread.current) thread.current = crypto.randomUUID();
    const last = turns.at(-1)?.answer,
      edited =
        last && (draft.subject !== last.subject || draft.body !== last.body),
      question =
        (consolidator
          ? `Destinatario: ${recipient}. Idioma: ${language}.\n`
          : "") +
        message.trim() +
        (edited
          ? "\nBorrador editado por mí para esta solicitud:\n" +
            JSON.stringify(draft)
          : "");
    if (question.length > 6000) {
      setError(
        "La solicitud y el borrador editado superan 6.000 caracteres. Reduce el texto.",
      );
      setBusy(false);
      return;
    }
    if (!pending.current || pending.current.message !== question)
      pending.current = {
        threadId: thread.current,
        requestId: crypto.randomUUID(),
        message: question,
      };
    const payload = pending.current;
    try {
      const r = await auxiliaryFetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        d = (await r.json()) as {
          error?: string;
          code?: string;
          retryable?: boolean;
          answer: Answer;
        };
      if (!r.ok) {
        if (d.retryable || d.code || r.status === 429) pending.current = null;
        throw Error(d.error || "No se pudo generar la respuesta.");
      }
      const answer = d.answer as Answer;
      setTurns((v) =>
        v.some((t) => t.id === payload.requestId)
          ? v
          : [...v, { id: payload.requestId, question: message.trim(), answer }],
      );
      if (answer.subject || answer.body)
        setDraft({ subject: answer.subject, body: answer.body });
      setMessage("");
      pending.current = null;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `Asunto: ${draft.subject}\n\n${auxiliary ? auxiliaryEmailSignature(draft.body) : draft.body}`,
      );
      setNotice("Correo copiado.");
    } catch {
      setNotice("Selecciona el texto y cópialo manualmente.");
    }
  }
  function reset() {
    thread.current = "";
    pending.current = null;
    setTurns([]);
    setDraft({ subject: "", body: "" });
    setMessage("");
    setError("");
    setNotice("");
  }
  return (
    <div className="mt-5 space-y-5 text-[#203d4d]">
      <div className="rounded-xl bg-[#eef5f8] p-4 text-sm leading-relaxed text-[#557485]">
        <strong>Chat de {label}:</strong> describe lo que necesitas y aporta los
        datos que debe incluir el correo. Puedes pedir después “hazlo más
        corto”, “cambia el tono” o pegar un correo para preparar la respuesta.
        Este chat usa lo que compartes aquí; no consulta reservas ni envía
        mensajes automáticamente.
      </div>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className="flex min-w-0 flex-col gap-4 rounded-2xl border border-[#dce7ec] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 [&>h2]:m-0 [&>h2]:text-lg [&>h2]:font-bold">
            <h2>Conversa con el asistente</h2>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={reset}
            >
              Nueva conversación
            </Button>
          </div>
          <p className={`m-0 inline-flex w-fit rounded-md px-2 py-1 text-sm ${loading ? "bg-slate-100 text-slate-600" : enabled ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
            {loading
              ? "Comprobando conexión…"
              : enabled
                ? "IA configurada"
                : "IA pendiente de activar"}
          </p>
          {!loading && !enabled && (
            <p className="m-0 text-sm text-slate-600">
              La IA está pendiente de activar en el backend del portal. Solicita
              al administrador revisar la configuración de Auxiliares.
            </p>
          )}
          {canEditPrompts && (
            <p className="m-0 text-sm text-slate-600">
              <a className="font-medium text-blue-700 underline-offset-4 hover:underline" href="/gerencia/instrucciones-ia">
                Editar instrucciones del chat →
              </a>
            </p>
          )}
          <div
            className="my-2 max-h-[420px] space-y-3 overflow-y-auto overscroll-contain"
            role="log"
            aria-live="polite"
            aria-label={`Conversación de ${label}`}
          >
            {!turns.length && (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm leading-relaxed text-slate-500">
                {consolidator
                  ? "Ejemplo: «Pídele amablemente al hotel el enlace de pago de la reserva AVI-123 por USD 850. Necesitamos continuar con la confirmación»."
                  : commercial
                    ? "Ejemplo: «Responde amablemente este correo del cliente y solicita las fechas del viaje para preparar la cotización: …»."
                    : auxiliary
                      ? "Ejemplo: «Pídele amablemente a Carolina que confirme la fecha de nacimiento del pasajero de la reserva AVI-123 para poder continuar»."
                      : work
                        ? "Ejemplo: «Redacta un correo al director comercial de un operador en Turquía. Presenta aVioa y solicita condiciones para un convenio con guías en español»."
                        : "Ejemplo: «Redacta un correo al hotel solicitando el link de pago de la reserva AVI-123. Quiero un mensaje corto y amable». "}
              </p>
            )}
            {turns.map((t) => (
              <div key={t.id} className="space-y-3">
                <p className="ml-5 whitespace-pre-wrap break-words rounded-xl bg-[#eaf2ff] p-4 text-sm leading-relaxed text-[#0a3a8a] sm:ml-10">
                  <strong className="font-bold">Tú</strong>
                  <br />
                  {t.question}
                </p>
                <p className="mr-5 whitespace-pre-wrap break-words rounded-xl border border-[#e0e7f0] bg-[#f5f7fb] p-4 text-sm leading-relaxed text-slate-700 sm:mr-10">
                  <strong className="font-bold">Asistente aVioa</strong>
                  <br />
                  {t.answer.answer}
                </p>
                {t.answer.body && (
                  <small className="block text-xs text-slate-500">
                    El borrador de esa respuesta se muestra en el editor.
                  </small>
                )}
              </div>
            ))}
            <div ref={tail} />
          </div>
          {auxiliary && (
            <div className="flex flex-wrap gap-2" aria-label="Opciones rápidas">
              {[
                [
                  "Solicitar documentos",
                  "Ayúdame a solicitar documentos o datos faltantes al equipo interno. ",
                ],
                [
                  "Pedir corrección",
                  "Ayúdame a pedir una corrección de datos de forma amable. ",
                ],
                [
                  "Confirmar gestión",
                  "Ayúdame a confirmar al equipo una gestión que ya realicé. ",
                ],
                [
                  "Hacer seguimiento",
                  "Ayúdame a hacer seguimiento cordial a un pendiente. ",
                ],
                [
                  "Responder un correo",
                  "Ayúdame a responder este correo de forma cercana y concisa: ",
                ],
              ].map(([title, text]) => (
                <Button
                  key={title}
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => setMessage(text)}
                >
                  {title}
                </Button>
              ))}
            </div>
          )}
          {consolidator && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-semibold text-[#294f64]" htmlFor="payment-email-recipient">
                  ¿A quién le escribes?
                  <select
                    id="payment-email-recipient"
                    value={recipient}
                    disabled={busy}
                    className="min-h-11 w-full rounded-lg border border-[#cddce4] bg-white px-3 py-2 text-sm font-normal text-[#203d4d] outline-none focus-visible:ring-2 focus-visible:ring-[#2e8493] focus-visible:ring-offset-2 disabled:bg-slate-50"
                    onChange={(e) => setRecipient(e.target.value)}
                  >
                    {["Operador internacional", "Hotel", "Equipo interno"].map(
                      (v) => (
                        <option key={v}>{v}</option>
                      ),
                    )}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-[#294f64]" htmlFor="payment-email-language">
                  Idioma del correo
                  <select
                    id="payment-email-language"
                    value={language}
                    disabled={busy}
                    className="min-h-11 w-full rounded-lg border border-[#cddce4] bg-white px-3 py-2 text-sm font-normal text-[#203d4d] outline-none focus-visible:ring-2 focus-visible:ring-[#2e8493] focus-visible:ring-offset-2 disabled:bg-slate-50"
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {[
                      "Según la solicitud o el correo recibido",
                      "Español",
                      "Inglés",
                      "Portugués",
                    ].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div
                className="flex flex-wrap gap-2"
                aria-label="Opciones de correos de pagos"
              >
                {[
                  [
                    "Solicitar un pago",
                    "Ayúdame a solicitar amablemente un pago pendiente. Datos: ",
                  ],
                  [
                    "Pedir enlace de pago",
                    "Solicita con amabilidad el enlace o las instrucciones para pagar esta reserva. Datos: ",
                  ],
                  [
                    "Confirmar un abono",
                    "Redacta un correo cordial informando un abono que ya realizamos y pide confirmar su aplicación. Datos: ",
                  ],
                  [
                    "Pedir factura",
                    "Solicita amablemente la factura o el soporte de esta operación. Datos: ",
                  ],
                  [
                    "Hacer seguimiento",
                    "Haz seguimiento cordial a esta solicitud pendiente. Contexto: ",
                  ],
                  [
                    "Aclarar diferencias",
                    "Solicita revisar estas diferencias de valores, con tono colaborativo y sin atribuir culpas. Datos: ",
                  ],
                  [
                    "Responder un correo",
                    "Ayúdame a responder con profesionalismo y calidez este correo: ",
                  ],
                ].map(([title, text]) => (
                  <Button
                    key={title}
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setMessage(text)}
                  >
                    {title}
                  </Button>
                ))}
              </div>
              <p className="m-0 rounded-xl bg-[#eef5f8] p-4 text-sm leading-relaxed text-[#557485]">
                Comparte la reserva, el valor y la moneda cuando correspondan.
                El asistente preparará un asunto y un mensaje amable para
                revisar y copiar.
              </p>
            </>
          )}
          <form className="space-y-3" onSubmit={send}>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#294f64]" htmlFor="reservation-ai-message">
              ¿Qué necesitas redactar o ajustar?
              <textarea
                id="reservation-ai-message"
                rows={4}
                required
                maxLength={6000}
                value={message}
                disabled={busy}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe la solicitud y los datos exactos que debe incluir el correo…"
                className="min-h-28 w-full resize-y rounded-lg border border-[#cddce4] bg-white p-3 text-sm font-normal leading-relaxed text-[#203d4d] outline-none transition focus-visible:ring-2 focus-visible:ring-[#2e8493] focus-visible:ring-offset-2 disabled:bg-slate-50"
              />
            </label>
            <p className="m-0 text-xs leading-relaxed text-slate-500">
              <small>
                Las consultas se guardan para continuar el contexto y consumen
                el límite compartido de IA del portal.
              </small>
            </p>
            <Button
              type="submit"
              disabled={busy || loading || !enabled || !message.trim()}
            >
              <Send size={16} />
              {busy
                ? "Redactando…"
                : consolidator
                  ? "Redactar correo"
                  : "Enviar solicitud"}
            </Button>
          </form>
          {error && (
            <p role="alert" className="m-0 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {error}
            </p>
          )}
        </section>
        <section className="flex min-w-0 flex-col gap-4 rounded-2xl border border-[#dce7ec] bg-white p-5 shadow-sm sm:p-6 [&>h2]:m-0 [&>h2]:flex [&>h2]:items-center [&>h2]:gap-2 [&>h2]:text-lg [&>h2]:font-bold">
          <h2>
            <Mail size={22} /> Borrador del correo
          </h2>
          {auxiliary && (
            <p className="m-0 rounded-xl bg-[#eef5f8] p-4 text-sm leading-relaxed text-[#557485]">
              Firma fija: <strong>Equipo Auxiliares</strong>. Se conserva al
              generar y copiar el correo.
            </p>
          )}
          {draft.body || draft.subject ? (
            <>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#294f64]" htmlFor="reservation-ai-subject">
                Asunto
                <input
                  id="reservation-ai-subject"
                  maxLength={500}
                  value={draft.subject}
                  disabled={busy}
                  className="w-full min-w-0 rounded-lg border border-[#cddce4] bg-white p-3 text-sm font-normal text-[#203d4d] outline-none transition focus-visible:ring-2 focus-visible:ring-[#2e8493] focus-visible:ring-offset-2 disabled:bg-slate-50"
                  onChange={(e) =>
                    setDraft((v) => ({ ...v, subject: e.target.value }))
                  }
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#294f64]" htmlFor="reservation-ai-body">
                Mensaje
                <textarea
                  id="reservation-ai-body"
                  rows={16}
                  maxLength={12000}
                  value={draft.body}
                  disabled={busy}
                  className="min-h-80 w-full resize-y rounded-lg border border-[#cddce4] bg-white p-3 text-sm font-normal leading-relaxed text-[#203d4d] outline-none transition focus-visible:ring-2 focus-visible:ring-[#2e8493] focus-visible:ring-offset-2 disabled:bg-slate-50"
                  onChange={(e) =>
                    setDraft((v) => ({ ...v, body: e.target.value }))
                  }
                />
              </label>
              <Button type="button" onClick={() => void copy()}>
                <Copy size={16} /> Copiar correo
              </Button>
              <p className="m-0 text-xs leading-relaxed text-slate-500">
                <small>
                  Revisa los datos antes de enviarlo. Tus cambios en el editor
                  se incluyen en la siguiente solicitud.
                </small>
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-slate-400">
              <Mail size={36} aria-hidden="true" />
              <p className="mb-0 mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
                El asunto y el mensaje aparecerán aquí cuando el asistente
                prepare el correo.
              </p>
            </div>
          )}
          {notice && (
            <p
              className="m-0 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"
              role="status"
            >
              {notice}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
