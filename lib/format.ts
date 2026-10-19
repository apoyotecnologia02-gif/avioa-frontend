import { FiltrosVuelos, OfertaVuelo } from "@/types/vuelos.types";
import { api } from "./axios";

export const fmtFecha = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });

export const fmtPrecio = (n: number, moneda: string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: 0,
  }).format(n);

function buildParams(filters: FiltrosVuelos): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.origen) params.origen = filters.origen;
  if (filters.destino) params.destino = filters.destino;
  if (filters.aerolinea) params.aerolinea = filters.aerolinea;
  if (filters.solo_gangas === true) params.solo_gangas = "true";
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.horas !== undefined) params.horas = String(filters.horas);
  if (filters.precio_min !== undefined)
    params.precio_min = String(filters.precio_min);
  if (filters.precio_max !== undefined)
    params.precio_max = String(filters.precio_max);
  if (filters.max_escalas !== undefined)
    params.max_escalas = String(filters.max_escalas);
  if (filters.fecha_ida_desde) params.fecha_ida_desde = filters.fecha_ida_desde;
  if (filters.fecha_ida_hasta) params.fecha_ida_hasta = filters.fecha_ida_hasta;

  return params;
}

export async function fetchOfertas(
  filters: FiltrosVuelos,
  signal?: AbortSignal,
) {
  const qs = new URLSearchParams(buildParams(filters)).toString();

  const res = await api.get(`/vuelos/ofertas${qs ? `?${qs}` : ""}`, { signal });

  if (res.status !== 200)
    throw new Error(`Error ${res.status}: ${res.statusText}`);

  return extractItems(await res.data);
}

function extractItems(json: any): OfertaVuelo[] {
  const d = json?.data ?? json;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.ofertas)) return d.ofertas;
  if (Array.isArray(d?.data)) return d.data;
  return [];
}
