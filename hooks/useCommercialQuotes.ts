"use client";

import { useMutation } from "@tanstack/react-query";
import { commercialRequest } from "@/lib/commercial/request";
import {
  BackendQuoteResponse,
  buildSourcesList,
  buildWarnings,
  toPresentedOffers,
} from "@/lib/commercial/quote-adapter";

export interface SendQuotePayload {
  requestId: string;
  message: string;
  history?: Array<{ question: string; answer: string }>;
}

export interface SendQuoteResult {
  answer: string;
  options: ReturnType<typeof toPresentedOffers>;
  sources: Array<{ id: string; title: string; url: string }>;
  warnings: string[];
  raw: BackendQuoteResponse;
}

/**
 * Hook que envía una consulta al cotizador IA y normaliza la respuesta
 * al formato que espera AssistantChat / OfferCard.
 */
export function useCommercialQuotes() {
  return useMutation<SendQuoteResult, Error, SendQuotePayload>({
    mutationFn: async (payload) => {
      const res = await commercialRequest("/api/commercial/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as BackendQuoteResponse;

      if (!res.ok) {
        throw new Error(data.error || "No se pudo consultar el asistente.");
      }

      return {
        answer: data.answer ?? "",
        options: toPresentedOffers(data.options),
        sources: buildSourcesList(data),
        warnings: buildWarnings(data),
        raw: data,
      };
    },
  });
}

/**
 * Hook para el asistente de correos (aún no implementado en backend).
 */

export function useCommercialEmailAssistant() {
  return useMutation<SendQuoteResult, Error, SendQuotePayload>({
    mutationFn: async (payload) => {
      const res = await commercialRequest("/api/commercial/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // AQUI CAMBIA: El backend de correos devolverá algo distinto
      const data = (await res.json()) as any; 

      if (!res.ok) {
        throw new Error(data.error || "No se pudo consultar el asistente.");
      }

      // Devolvemos la data cruda para que el componente la maneje
      return {
        answer: data.answer || "",
        options: [], // No aplica para correos
        sources: [],
        warnings: [],
        raw: data, 
      };
    },
  });
}