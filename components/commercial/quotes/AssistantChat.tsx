"use client";

import { useState, type FormEvent } from "react";
import {
  Send,
  Sparkles,
  Copy,
  Plus,
  Loader2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { copyCommercialText } from "@/lib/commercial/clipboard";
import { useCommercialQuotes } from "@/hooks/useCommercialQuotes";
import {
  OfferCard,
  offerClientText,
  type PresentedOffer,
} from "./OfferCard";

const AI_ENABLED = process.env.NEXT_PUBLIC_AI_ENABLED === "true";

type Turn = {
  question: string;
  answer: string;
  options: PresentedOffer[];
  sources: { id: string; title: string; url: string }[];
  warnings: string[];
};

export function AssistantChat() {
  const [message, setMessage] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState("");
  const [copiedText, setCopiedText] = useState("");

  const mutation = useCommercialQuotes();
  const busy = mutation.isPending;

  if (!AI_ENABLED) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
        <Sparkles className="h-10 w-10 text-primary" />
        <h3 className="text-lg font-semibold">
          El consultor de tarifario estará disponible próximamente
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Estamos conectando el proveedor de IA. Mientras tanto, usa la pestaña “Preparar propuesta”.
        </p>
      </div>
    );
  }

  async function send(e: FormEvent) {
    e.preventDefault();
    if (busy || !message.trim()) return;

    setError("");
    const question = message.trim();

    try {
      const data = await mutation.mutateAsync({
        requestId: crypto.randomUUID(),
        message: question,
        history: turns
          .slice(-5)
          .map((t) => ({ question: t.question, answer: t.answer })),
      });

      setTurns((old) => [
        ...old,
        {
          question,
          answer: data.answer,
          options: data.options,
          sources: data.sources,
          warnings: data.warnings,
        },
      ]);
      setMessage("");
    } catch (e) {
      setError((e as Error).message);
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
            Consultor de tarifario
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulta las ofertas y cierres del tarifario con referencias de origen.
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
              ¿Qué viaje necesitas cotizar?
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Por ejemplo: San Andrés desde Medellín para dos adultos en noviembre.
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

            {t.warnings.length > 0 && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                <div className="mb-1 flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Avisos
                </div>
                <ul className="list-inside list-disc space-y-0.5">
                  {t.warnings.map((w, k) => (
                    <li key={k}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

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
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          {s.title} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">{s.title}</span>
                      )}
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
            Revisando tu solicitud… (puede tardar 15–30s)
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
          placeholder="Escribe aquí lo que necesitas cotizar…"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Precios, cierres y disponibilidad sujetos a reconfirmación.
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