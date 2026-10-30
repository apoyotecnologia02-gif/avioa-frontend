"use client";

import { useState, type FormEvent } from "react";
import {
  Send,
  Sparkles,
  Copy,
  Plus,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { commercialRequest } from "@/lib/commercial/request";
import { copyCommercialText } from "@/lib/commercial/clipboard";
import {
  OfferCard,
  offerClientText,
  type PresentedOffer,
} from "./OfferCard";

/**
 * Si false → el chat muestra "próximamente" (modo mantenimiento).
 * Se activa cuando el proveedor de IA esté configurado en el backend.
 */
const AI_ENABLED = process.env.NEXT_PUBLIC_AI_ENABLED === "true";

type Turn = {
  question: string;
  answer: string;
  options: PresentedOffer[];
  sources: { id: string; title: string; url: string }[];
};

interface AssistantChatProps {
  mode?: "quotes" | "email";
}

export function AssistantChat({ mode = "quotes" }: AssistantChatProps) {
  const isEmail = mode === "email";

  const [message, setMessage] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copiedText, setCopiedText] = useState("");

  if (!AI_ENABLED) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
        <Sparkles className="h-10 w-10 text-primary" />
        <h3 className="text-lg font-semibold">
          {isEmail
            ? "El asistente de correos estará disponible próximamente"
            : "El consultor de tarifario estará disponible próximamente"}
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">
          {isEmail
            ? "Estamos conectando el proveedor de IA. Mientras tanto, usa la pestaña “Plantilla manual”."
            : "Estamos conectando el proveedor de IA. Mientras tanto, usa la pestaña “Preparar propuesta”."}
        </p>
      </div>
    );
  }

  async function send(e: FormEvent) {
    e.preventDefault();
    if (busy || !message.trim()) return;

    setBusy(true);
    setError("");
    const question = message.trim();

    try {
      const r = await commercialRequest(
        "/api/commercial/" + (isEmail ? "email" : "quotes"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: crypto.randomUUID(),
            message: question,
            history: turns
              .slice(-5)
              .map((t) => ({ question: t.question, answer: t.answer })),
          }),
        },
      );
      const data = (await r.json()) as Turn & { error?: string };
      if (!r.ok)
        throw new Error(data.error || "No se pudo consultar el asistente.");
      setTurns((old) => [...old, { ...data, question }]);
      setMessage("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy(text: string) {
    try {
      await copyCommercialText(text);
      setCopiedText(text);
      toast.success("Copiado");
      setTimeout(() => setCopiedText(""), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  }

  function reset() {
    setTurns([]);
    setError("");
    setMessage("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            {isEmail ? "Asistente de correos" : "Consultor de tarifario"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEmail
              ? "Redacta un borrador para revisar y enviar desde tu correo."
              : "Consulta las ofertas y cierres del tarifario con referencias de origen."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reset} disabled={busy}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo chat
        </Button>
      </div>

      <div
        role="log"
        aria-live="polite"
        className="flex max-h-[600px] min-h-[300px] flex-col gap-4 overflow-y-auto rounded-lg border border-border bg-card p-4"
      >
        {!turns.length && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
            <h3 className="text-base font-semibold">
              {isEmail
                ? "¿Qué correo necesitas preparar?"
                : "¿Qué viaje necesitas cotizar?"}
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              {isEmail
                ? "Indica el objetivo, el destinatario y los datos que debe incluir el mensaje."
                : "Por ejemplo: San Andrés desde Medellín para dos adultos en noviembre."}
            </p>
          </div>
        )}

        {turns.map((t, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 border-t border-border/50 pt-4 first:border-t-0 first:pt-0"
          >
            <div className="ml-auto max-w-[80%] rounded-lg bg-primary/10 px-4 py-2.5 text-sm text-foreground">
              {t.question}
            </div>

            <div className="max-w-[90%] whitespace-pre-wrap break-words text-sm leading-relaxed">
              {t.answer}
            </div>

            {t.options.length > 0 && (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {t.options.map((o, j) => (
                  <OfferCard
                    key={j}
                    offer={o}
                    onCopy={handleCopy}
                    copiedText={copiedText}
                    copyKey={`turn-${i}-opt-${j}-`}
                  />
                ))}
              </div>
            )}

            {t.sources?.length > 0 && (
              <details className="rounded-md bg-muted/50 p-3 text-xs">
                <summary className="cursor-pointer font-medium">
                  Fuentes consultadas ({t.sources.length})
                </summary>
                <ul className="mt-2 space-y-1">
                  {t.sources.map((s) => (
                    <li key={s.id}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {s.title} <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() =>
                void handleCopy(
                  [t.answer, ...t.options.map(offerClientText)].join("\n\n"),
                )
              }
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar respuesta
            </Button>
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Revisando tu solicitud…
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={send} className="space-y-2">
        <Label htmlFor="chat-message">Tu solicitud</Label>
        <Textarea
          id="chat-message"
          rows={3}
          maxLength={4000}
          required
          disabled={busy}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            isEmail
              ? "Necesito redactar un correo para…"
              : "Escribe aquí lo que necesitas cotizar…"
          }
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {isEmail
              ? "Solo prepara borradores. No envía correos."
              : "Precios, cierres y disponibilidad sujetos a reconfirmación."}
          </p>
          <Button type="submit" disabled={busy || !message.trim()}>
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Consultar
          </Button>
        </div>
      </form>
    </div>
  );
}