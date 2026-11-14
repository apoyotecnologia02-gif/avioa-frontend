import type { PresentedOffer } from "@/components/commercial/quotes/OfferCard";

// ─────────────────────────────────────────────────────
// Tipos de la respuesta del backend (POST /commercial/quotes)
// ─────────────────────────────────────────────────────

export interface BackendQuoteHotel {
  name: string;
  rateText: string;
  excerpt: string;
  sourceId: string;
  closureNote: string;
}

export interface BackendQuoteOption {
  title: string;
  detail: string;
  presentation: {
    duration: string;
    origin: string;
    accommodation: string;
    dates: string[];
    includes: string[];
    excludes: string[];
    paymentTerms: string[];
    conditions: string[];
  };
  hotels: BackendQuoteHotel[];
  priceCOP: number | null;
  priceExcerpt: string;
  priceSourceId: string;
  sourceIds: string[];
  closureNote: string;
  closureStatus: "possible_conflict" | "not_verified";
}

export interface BackendIntent {
  origin: "MED" | "BOG" | "CALI" | null;
  destination: string | null;
  travelRequest: string;
  question: string;
}

export interface BackendSourceSummary {
  tab: string;
  ok: boolean;
  error?: string;
}

export interface BackendQuoteResponse {
  requestId: string;
  cached: boolean;
  answer: string;
  missingData: string[];
  options: BackendQuoteOption[];
  intent?: BackendIntent;
  sources?: BackendSourceSummary[];
  omitted?: number;
  error?: string;
}

// ─────────────────────────────────────────────────────
// Mapeo backend → frontend
// ─────────────────────────────────────────────────────

const ORIGIN_LABEL: Record<string, string> = {
  MED: "Medellín",
  BOG: "Bogotá",
  CALI: "Cali",
};

/**
 * Convierte una QuoteOption del backend al modelo PresentedOffer
 * que renderiza OfferCard.
 */
export function toPresentedOffer(
  backend: BackendQuoteOption,
  index: number,
): PresentedOffer {
  return {
    title: backend.title || `Propuesta ${index + 1}`,
    detail: backend.detail || "",
    hotels: (backend.hotels ?? []).map((h) => ({
      name: h.name || "",
      rateText: h.rateText || "",
      closureNote: h.closureNote || "",
    })),
    sourceIds: backend.sourceIds ?? [],
    closureNote: backend.closureNote || "",
    presentation: {
      origin: ORIGIN_LABEL[backend.presentation?.origin ?? ""] ??
        backend.presentation?.origin ?? "",
      duration: backend.presentation?.duration || "",
      accommodation: backend.presentation?.accommodation || "",
      dates: backend.presentation?.dates ?? [],
      includes: backend.presentation?.includes ?? [],
      excludes: backend.presentation?.excludes ?? [],
      paymentTerms: backend.presentation?.paymentTerms ?? [],
      conditions: backend.presentation?.conditions ?? [],
    },
  };
}

/**
 * Convierte el array completo.
 */
export function toPresentedOffers(
  backend: BackendQuoteOption[],
): PresentedOffer[] {
  return (backend ?? []).map(toPresentedOffer);
}

/**
 * Construye un listado de "fuentes consultadas" a partir del resumen
 * que devuelve el backend + los sourceIds citados en las opciones.
 *
 * Formato esperado por AssistantChat:
 *   { id: string, title: string, url: string }[]
 */
export function buildSourcesList(
  response: BackendQuoteResponse,
): Array<{ id: string; title: string; url: string }> {
  const result: Array<{ id: string; title: string; url: string }> = [];

  // 1. Resumen de descargas (OFERTAS MED, CIERRES, etc.)
  for (const s of response.sources ?? []) {
    result.push({
      id: `summary:${s.tab}`,
      title: s.ok ? `${s.tab} (ok)` : `${s.tab} (error: ${s.error ?? "desconocido"})`,
      url: "", // resumen, sin URL específica
    });
  }

  // 2. Los sourceIds reales de cada opción (ej: "med:D", "cierre:37")
  const seen = new Set<string>();
  for (const option of response.options ?? []) {
    for (const id of option.sourceIds ?? []) {
      if (seen.has(id)) continue;
      seen.add(id);
      result.push({
        id,
        title: formatSourceId(id),
        url: sourceIdToSheetUrl(id),
      });
    }
  }

  return result;
}

/**
 * "med:D" → "OFERTAS MED · columna D"
 * "cierre:37" → "CIERRES · fila 37"
 */
function formatSourceId(id: string): string {
  const [prefix, ref] = id.split(":");
  if (prefix === "med") return `OFERTAS MED · col ${ref}`;
  if (prefix === "bog") return `OFERTAS BOG · col ${ref}`;
  if (prefix === "cali") return `OFERTAS CALI · col ${ref}`;
  if (prefix === "cierre") return `CIERRES · fila ${ref}`;
  return id;
}

/**
 * Genera un enlace directo a la celda del sheet según el sourceId.
 * Se basa en la estructura conocida del tarifario.
 */
function sourceIdToSheetUrl(id: string): string {
  const SHEET_BASE =
    "https://docs.google.com/spreadsheets/d/1NEyuaFSPM0gymMETM_fxMHI8VWDIVoRmvPT73tdOpWU/edit";

  const [prefix, ref] = id.split(":");
  if (!ref) return SHEET_BASE;

  if (prefix === "med") return `${SHEET_BASE}#gid=915260279&range=${ref}1:${ref}7`;
  if (prefix === "bog") return `${SHEET_BASE}#gid=1717217639&range=${ref}1:${ref}7`;
  if (prefix === "cali") return `${SHEET_BASE}#gid=1822486735&range=${ref}1:${ref}8`;
  if (prefix === "cierre") return `${SHEET_BASE}#gid=0&range=B${ref}:H${ref}`;

  return SHEET_BASE;
}

/**
 * Extrae mensajes de advertencia útiles para mostrar al usuario
 * (fuentes que fallaron, datos faltantes, ofertas omitidas).
 */
export function buildWarnings(response: BackendQuoteResponse): string[] {
  const warnings: string[] = [];

  for (const s of response.sources ?? []) {
    if (!s.ok) {
      warnings.push(`No se pudo consultar ${s.tab}${s.error ? ` (${s.error})` : ""}.`);
    }
  }

  for (const m of response.missingData ?? []) {
    if (m) warnings.push(m);
  }

  if (typeof response.omitted === "number" && response.omitted > 0) {
    warnings.push(
      `${response.omitted} oferta(s) del tarifario no se incluyeron por límite de contexto.`,
    );
  }

  return warnings;
}