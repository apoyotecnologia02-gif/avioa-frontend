"use client";

import { useEffect, useRef, useState } from "react";
import { useAssistant } from "./AssistantProvider";
import { cn } from "@/lib/utils";
import { Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { Button } from "../ui/button";
import { AssistantChatMessage, PendingAssistantAction } from "@/hooks/useAssistantChat";
import { MarkdownMessage } from "./MarkdownMessage";

export function AssistantChatBubble({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isStreaming, isActionLoading, pendingActions, send, reset, confirmAction } = useAssistant();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBotton = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBotton < 80) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    void send(input);
    setInput("");
  };

  const lastMessage = messages.at(-1);
  const showThinking =
    isStreaming && lastMessage?.role === "assistant" && !lastMessage.content;

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
        className={cn(
          "fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all",
          "bg-primary text-primary-foreground hover:scale-105 active:scale-95",
          "print:hidden",
          open && "pointer-events-none scale-0 opacity-0",
          className,
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="false"
        aria-hidden={!open}
        className={cn(
          "fixed bottom-5 right-5 z-40 flex flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl transition-all duration-200",
          "w-[calc(100vw-2.5rem)] max-w-sm",
          "h-[min(600px,calc(100vh-2.5rem))]",
          "print:hidden",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Asistente</p>
              <p className="text-[11px] text-muted-foreground">
                Pregúntame lo que necesites
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={reset}
                disabled={isStreaming}
              >
                Limpiar
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mensajes */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
        >
          {messages.length === 0 && <EmptyState onPick={send} />}

          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {pendingActions.map((action) => (
            <PendingActionCard key={action.actionId} action={action} loading={isActionLoading === action.actionId} onConfirm={() => void confirmAction(action.actionId, true)} onCancel={() => void confirmAction(action.actionId, false)} />
          ))}

          {showThinking && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Pensando…
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t bg-background px-3 py-3"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta…"
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            disabled={isStreaming}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming}
            aria-label="Enviar"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </>
  );
}

/* ---------- Subcomponentes ---------- */

function MessageBubble({ message }: { message: AssistantChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm whitespace-pre-wrap"
            : "bg-muted text-foreground rounded-bl-sm",
        )}
      >
        {isUser ? (
          message.content
        ) : message.content ? (
          <MarkdownMessage content={message.content} />
        ) : (
          "…"
        )}
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  const suggestions = [
    "¿Cuántos días de vacaciones tengo?",
    "¿Cuál es mi próxima ausencia?",
    "¿Tengo solicitudes pendientes?",
    "Consulta de nómina para el período de enero de 2026",
  ];
  return (
    <div className="space-y-3 pt-2">
      <p className="text-sm text-muted-foreground">
        Hola 👋 Puedo ayudarte con tu saldo, tus solicitudes y tus ausencias.
      </p>
      <div className="flex flex-col gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-lg border bg-background px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-muted"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function PendingActionCard({ action, loading, onConfirm, onCancel }: { action: PendingAssistantAction; loading: boolean; onConfirm: () => void; onCancel: () => void }) {
  const expired = new Date(action.expiresAt).getTime() <= Date.now() || action.status === "EXPIRED";
  const status = expired ? "Vencida" : action.status === "CONFIRMED" ? "Confirmada" : action.status === "CANCELLED" ? "Cancelada" : action.status === "ERROR" ? "Error al actualizar" : "Pendiente de confirmación";
  return (
    <section className="rounded-xl border bg-background p-3 text-sm" aria-label="Acción pendiente">
      <p className="font-medium">{action.summary}</p>
      <p className="mt-1 text-xs text-muted-foreground">{status} · Vence {new Date(action.expiresAt).toLocaleString()}</p>
      {action.result !== undefined && <pre className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">{JSON.stringify(action.result, null, 2)}</pre>}
      {!expired && (!action.status || action.status === "ERROR") && <div className="mt-3 flex gap-2"><Button size="sm" onClick={onConfirm} disabled={loading}>{loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}Confirmar</Button><Button size="sm" variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button></div>}
    </section>
  );
}
