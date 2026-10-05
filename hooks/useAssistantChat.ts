"use client";

import { ACCESS_KEY } from "@/utils/constants";
import { useCallback, useRef, useState } from "react";

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export type AssistantChatRole = "user" | "assistant";

export interface AssistantChatMessage {
  id: string;
  role: AssistantChatRole;
  content: string;
}

export interface AssistantContext {
  page?: string;
  [key: string]: unknown;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/assistant/stream`;

export function useAssistantChat() {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [context, setContext] = useState<AssistantContext>({});
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setMessages([]);
  }, [stop]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const assistantId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      const userId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      setMessages((prev) => [
        ...prev,
        { id: userId, role: "user", content: trimmed },
        { id: assistantId, role: "assistant", content: "" },
      ]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const patchAssistant = (updater: (prev: string) => string) =>
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: updater(m.content) } : m,
          ),
        );

      try {
        const token = getAuthToken();

        const res = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ message: trimmed, context }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          let detail = `Error ${res.status}`;
          try {
            const errJson = await res.json();
            detail = errJson?.detail || errJson?.error || detail;
          } catch {
            /* ignore */
          }
          patchAssistant((c) => c || `⚠️ ${detail}`);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const evt of events) {
            const dataLines = evt
              .split("\n")
              .filter((l) => l.startsWith("data:"))
              .map((l) => l.slice(5).trimStart());

            if (dataLines.length === 0) continue;

            const payload = dataLines.join("\n");
            try {
              const parsed = JSON.parse(payload) as
                | { type: "token"; content: string }
                | { type: "done" }
                | { type: "error"; message: string };

              if (parsed.type === "token") {
                patchAssistant((c) => c + parsed.content);
              } else if (parsed.type === "error") {
                patchAssistant(
                  (c) => c || `⚠️ ${parsed.message ?? "Error desconocido"}`,
                );
              }
            } catch {
              /* ignore */
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          patchAssistant(
            (c) => c || "No pude obtener respuesta del asistente.",
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, context],
  );

  return {
    messages,
    isStreaming,
    context,
    setContext,
    send,
    stop,
    reset,
  };
}

export type AssistantChatApi = ReturnType<typeof useAssistantChat>;
