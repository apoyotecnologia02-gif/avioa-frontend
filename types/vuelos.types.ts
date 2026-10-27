export interface OfertaVuelo {
  id?: number | string;
  origen: string;
  destino: string;
  hoja: string;
  ida: string; // YYYY-MM-DD
  regreso: string; // YYYY-MM-DD
  noches: number;
  precio: number;
  moneda: string;
  aerolinea_ida: string;
  vuelo_ida?: string;
  salida_ida?: string;
  llegada_ida?: string;
  escalas_ida: number;
  duracion_ida: string;
  aerolinea_regreso?: string;
  escalas_regreso?: number;
  duracion_regreso?: string;
  vendedor: string;
  precio_vendedor?: number;
  equipaje?: string;
  link: string;
  ganga: boolean;
  veredicto: string;
  pct_vs_piso?: number;
  rango?: [number, number] | null;
  visto_en: string;
  nivel: string | null;
  piso: string | null;
  techo: number | null;
  vuelo_regreso: string | null;
  salida_regreso: string | null;
  llegada_regreso: string | null;
  separate_tickets: boolean;
}

export interface FiltrosVuelos {
  origen?: string;
  destino?: string;
  aerolinea?: string;
  solo_gangas?: boolean;
  limit?: number;
  horas?: number;
  precio_min?: number;
  precio_max?: number;
  max_escalas?: number;
  fecha_ida_desde?: string;
  fecha_ida_hasta?: string;
}

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
