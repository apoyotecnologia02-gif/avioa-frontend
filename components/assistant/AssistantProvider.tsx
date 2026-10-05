"use client";

import { AssistantChatApi, useAssistantChat } from "@/hooks/useAssistantChat";
import { createContext, ReactNode, useContext } from "react";

const AssistantContext = createContext<AssistantChatApi | null>(null);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const chat = useAssistantChat();

  return (
    <AssistantContext.Provider value={chat}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant(): AssistantChatApi {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error("useAssistant debe usarse dentro de <AssistantProvider>");
  }

  return ctx;
}
