"use client";

import { ACCESS_KEY } from "@/utils/constants";
import { useCallback, useEffect, useRef, useState } from "react";

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

function getConversationKey(token: string | null) {
  // JWT identity is used only to partition browser storage; identity/permissions
  // are always supplied by the backend from the bearer token.
  try {
    const payload = token?.split(".")[1];
    if (payload) {
      const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
      const subject = claims.sub ?? claims.userId;
      if (subject) return `assistant-chat:${String(subject)}`;
    }
  } catch { /* malformed or opaque token */ }
  let hash = 0;
  for (const char of token ?? "anonymous") hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return `assistant-chat:session-${Math.abs(hash)}`;
}

export type AssistantChatRole = "user" | "assistant";
export interface AssistantChatMessage { id: string; role: AssistantChatRole; content: string }
export interface AssistantContext { page?: string; [key: string]: unknown }
export interface PendingAssistantAction { actionId: string; summary: string; expiresAt: string; status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "ERROR"; result?: unknown }
export type AssistantSseEvent =
  | { type: "token"; content: string }
  | { type: "done"; threadId: string; pendingActions: PendingAssistantAction[] }
  | { type: "error"; message: string; threadId: string; pendingActions?: PendingAssistantAction[] };
export interface AssistantChatResponse { response: string; threadId: string; pendingActions: PendingAssistantAction[] }
export interface ConfirmAssistantActionResponse { confirmed: boolean; cancelled?: boolean; result?: unknown }

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/assistant/stream`;
const CONFIRM_URL = `${process.env.NEXT_PUBLIC_API_URL}/assistant/actions/confirm`;
const makeId = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
const errorText = (status: number, payload?: any) => status === 401 || status === 403
  ? "No tienes autorización o permisos para realizar esta solicitud."
  : payload?.message || payload?.detail || payload?.error || `Error ${status}`;

export function useAssistantChat() {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [pendingActions, setPendingActions] = useState<PendingAssistantAction[]>([]);
  const [context, setContext] = useState<AssistantContext>({});
  const [storageKey, setStorageKey] = useState("assistant-chat:anonymous");
  const threadIdRef = useRef<string | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const key = getConversationKey(getAuthToken());
    setStorageKey(key);
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (saved?.messages && Array.isArray(saved.messages)) setMessages(saved.messages);
      if (typeof saved?.threadId === "string") threadIdRef.current = saved.threadId;
      if (Array.isArray(saved?.pendingActions)) setPendingActions(saved.pendingActions);
    } catch { /* discard invalid saved state */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ messages, threadId: threadIdRef.current, pendingActions }));
  }, [messages, pendingActions, storageKey]);

  const stop = useCallback(() => { abortRef.current?.abort(); abortRef.current = null; setIsStreaming(false); }, []);
  const reset = useCallback(() => {
    stop(); threadIdRef.current = undefined; setMessages([]); setPendingActions([]);
    localStorage.removeItem(storageKey);
  }, [stop, storageKey]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    const token = getAuthToken();
    const activeStorageKey = getConversationKey(token);
    if (activeStorageKey !== storageKey) {
      threadIdRef.current = undefined;
      setMessages([]);
      setPendingActions([]);
      setStorageKey(activeStorageKey);
    }
    const assistantId = makeId();
    setMessages((prev) => [...prev, { id: makeId(), role: "user", content: trimmed }, { id: assistantId, role: "assistant", content: "" }]);
    setIsStreaming(true);
    const controller = new AbortController(); abortRef.current = controller;
    const patchAssistant = (updater: (content: string) => string) => setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: updater(m.content) } : m));
    try {
      const res = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json", Accept: "text/event-stream", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ message: trimmed, ...(threadIdRef.current ? { threadId: threadIdRef.current } : {}) }), signal: controller.signal });
      if (!res.ok || !res.body) {
        let payload; try { payload = await res.json(); } catch { /* ignore */ }
        patchAssistant((content) => content || `⚠️ ${errorText(res.status, payload)}`); return;
      }
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let buffer = "";
      const processEvent = (raw: string) => {
        const lines = raw.split(/\r?\n/); const data = lines.filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n");
        if (!data) return;
        try {
          const event = JSON.parse(data) as AssistantSseEvent;
          if (event.type === "token") patchAssistant((content) => content + event.content);
          else if (event.type === "done") { threadIdRef.current = event.threadId; setPendingActions(event.pendingActions ?? []); }
          else if (event.type === "error") { if (event.threadId) threadIdRef.current = event.threadId; if (event.pendingActions) setPendingActions(event.pendingActions); patchAssistant((content) => content || `⚠️ ${event.message || "No se pudo procesar el mensaje."}`); }
        } catch { /* ignore malformed SSE frame */ }
      };
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/); buffer = events.pop() ?? ""; events.forEach(processEvent);
      }
      buffer += decoder.decode(); if (buffer.trim()) processEvent(buffer);
    } catch (err) {
      if ((err as Error).name !== "AbortError") patchAssistant((content) => content || "⚠️ No pude conectar con el asistente. Inténtalo de nuevo.");
    } finally { setIsStreaming(false); abortRef.current = null; }
  }, [isStreaming, storageKey]);

  const confirmAction = useCallback(async (actionId: string, confirmed: boolean) => {
    if (isActionLoading) return;
    setIsActionLoading(actionId);
    try {
      const token = getAuthToken();
      const response = await fetch(CONFIRM_URL, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ actionId, confirmed }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(errorText(response.status, payload));
      setPendingActions((actions) => actions.map((action) => action.actionId === actionId ? { ...action, status: confirmed ? "CONFIRMED" : "CANCELLED", result: payload } : action));
      setMessages((prev) => [...prev, { id: makeId(), role: "assistant", content: confirmed ? "✅ Acción confirmada y procesada por el servidor." : "Acción cancelada." }]);
    } catch (err) {
      setPendingActions((actions) => actions.map((action) => action.actionId === actionId ? { ...action, status: "ERROR" } : action));
      setMessages((prev) => [...prev, { id: makeId(), role: "assistant", content: `⚠️ ${(err as Error).message || "No fue posible actualizar la acción."}` }]);
    } finally { setIsActionLoading(null); }
  }, [isActionLoading]);

  return { messages, isStreaming, isActionLoading, pendingActions, context, setContext, send, stop, reset, confirmAction };
}

export type AssistantChatApi = ReturnType<typeof useAssistantChat>;
