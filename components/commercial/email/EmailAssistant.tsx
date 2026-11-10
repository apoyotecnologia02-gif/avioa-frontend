"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Sparkles, Mail, Send, Copy, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { copyCommercialText } from "@/lib/commercial/clipboard";
import { useCommercialEmailAssistant } from "@/hooks/useCommercialQuotes";

type Turn = {
  id: string;
  question: string;
  answer: {
    answer: string;
    subject: string;
    body: string;
  };
};

export function EmailAssistant() {
  const [message, setMessage] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState({ subject: "", body: "" });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const mutation = useCommercialEmailAssistant();
  const busy = mutation.isPending;
  const tailRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final del chat
  useEffect(() => {
    if (turns.length > 0) {
      tailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [turns.length]);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (busy || !message.trim()) return;

    setError("");
    const question = message.trim();
    const requestId = crypto.randomUUID();

    try {
      const data = await mutation.mutateAsync({
        requestId,
        message: question,
        history: turns.slice(-5).map((t) => ({
          question: t.question,
          answer: t.answer.answer,
        })),
      });

      // El hook ya devuelve answer, subject y body mapeados directamente
      const structuredAnswer = {
        answer: data.answer || "El asistente no generó una explicación.",
        subject: data.subject || "",
        body: data.body || "",
      };

      // Si la IA devolvió todo vacío, mostramos un aviso
      if (!structuredAnswer.answer && !structuredAnswer.subject && !structuredAnswer.body) {
        structuredAnswer.answer = "No se pudo generar el borrador. Intenta dar más detalles o cambiar la solicitud.";
      }

      setTurns((old) => [
        ...old,
        { id: requestId, question, answer: structuredAnswer },
      ]);

      // Actualizamos el editor de la derecha si hay contenido nuevo
      if (structuredAnswer.subject || structuredAnswer.body) {
        setDraft({
          subject: structuredAnswer.subject,
          body: structuredAnswer.body,
        });
      }

      setMessage("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function copyEmail() {
    try {
      await copyCommercialText(`Asunto: ${draft.subject}\n\n${draft.body}`);
      setCopied(true);
      toast.success("Correo copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  }

  function reset() {
    setTurns([]);
    setDraft({ subject: "", body: "" });
    setMessage("");
    setError("");
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* PANEL IZQUIERDO: Chat */}
      <section className="flex-1 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 lg:max-w-[50%]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Conversa con el asistente</h2>
          <Button variant="outline" size="sm" onClick={reset} disabled={busy}>
            Nueva conversación
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md w-fit">
          IA configurada
        </p>

        <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-h-[300px] max-h-[500px] pr-2">
          {turns.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Sparkles className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm max-w-xs">
                Ejemplo: «Responde amablemente este correo del cliente y solicita
                las fechas del viaje para preparar la cotización».
              </p>
            </div>
          )}

          {turns.map((t) => (
            <div key={t.id} className="flex flex-col gap-2">
              <div className="bg-primary/10 p-3 rounded-lg rounded-tr-none self-end max-w-[90%]">
                <span className="text-xs font-bold text-primary/70 block mb-1">Tú</span>
                <p className="text-sm whitespace-pre-wrap">{t.question}</p>
              </div>
              <div className="bg-muted p-3 rounded-lg rounded-tl-none self-start max-w-[90%]">
                <span className="text-xs font-bold text-muted-foreground block mb-1">Asistente aVioa</span>
                <p className="text-sm whitespace-pre-wrap">{t.answer.answer}</p>
              </div>
              {t.answer.body && (
                <span className="text-xs text-muted-foreground ml-2">
                  El borrador de esa respuesta se muestra en el editor.
                </span>
              )}
            </div>
          ))}
          <div ref={tailRef} />
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 inline mr-1" />
            {error}
          </div>
        )}

        <form onSubmit={send} className="flex flex-col gap-2 mt-auto">
          <Label htmlFor="email-message">¿Qué necesitas redactar o ajustar?</Label>
          <Textarea
            id="email-message"
            rows={4}
            required
            maxLength={6000}
            value={message}
            disabled={busy}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe la solicitud y los datos exactos que debe incluir el correo…"
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground max-w-[60%]">
              Las consultas consumen el límite compartido de IA del portal.
            </p>
            <Button type="submit" disabled={busy || !message.trim()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {busy ? "Redactando…" : "Enviar solicitud"}
            </Button>
          </div>
        </form>
      </section>

      {/* PANEL DERECHO: Editor */}
      <section className="flex-1 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 lg:max-w-[50%]">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Mail className="h-5 w-5" /> Borrador del correo
        </h2>

        {draft.subject || draft.body ? (
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="draft-subject">Asunto</Label>
              <Input
                id="draft-subject"
                maxLength={500}
                value={draft.subject}
                disabled={busy}
                onChange={(e) => setDraft((v) => ({ ...v, subject: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="draft-body">Mensaje</Label>
              <Textarea
                id="draft-body"
                className="flex-1 min-h-[300px] resize-none"
                maxLength={12000}
                value={draft.body}
                disabled={busy}
                onChange={(e) => setDraft((v) => ({ ...v, body: e.target.value }))}
              />
            </div>
            <Button variant="outline" onClick={copyEmail} disabled={busy}>
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Copiado" : "Copiar correo"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Revisa los datos antes de enviarlo. Tus cambios en el editor se
              incluyen en la siguiente solicitud.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
            <Mail className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm text-center">
              El asunto y el mensaje aparecerán aquí cuando el asistente prepare el correo.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}