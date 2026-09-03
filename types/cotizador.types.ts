export interface CotizadorRequest {
  texto_usuario: string;
  plan_hoteles: "TODOS" | "FULL" | "DESAYUNO" | "D-A-C" | "D-C";
  max_hoteles: number;
  solo_fecha_exacta: boolean;
}

export interface ConfigIA {
  origen: string;
  destino: string;
  fecha_salida: string;
  fecha_regreso: string;
  adultos: number;
  edades_menores: number[];
}

export interface HotelResultado {
  hotel: string;
  destino: string;
  plan: string;
  pp: number;
  rate: number;
  charged: number;
  backend_total: number;
  child_prices: number[];
  conditions: string;
}

export interface HotelesData {
  resultados: HotelResultado[];
  texto: string;
}

export interface VueloItem {
  tipo: "ida" | "regreso";
  aerolinea: string;
  fecha: string;
  hora_salida: string;
  hora_llegada: string;
  numero_vuelo: string;
  paradas: string;
  duracion: string;
  precio: string;
  moneda: string;
  texto_fuente?: string;
}

export interface TablaVuelos {
  label: string;
  config: {
    origen: string;
    destino: string;
    fecha_salida: string;
    fecha_regreso: string;
    adultos: number;
    edades_menores: number[];
  };
  ida: VueloItem[];
  regreso: VueloItem[];
  observaciones?: string[];
}

export interface ResultadoIA {
  json_estructurado: {
    busquedas: TablaVuelos[];
  };
  tablas: TablaVuelos[];
  recomendacion: string;
  modo: "fecha_exacta" | "multiples_fechas";
}

export interface VuelosData {
  resultados: {
    label: string;
    offset: number;
    resultado: { ok: boolean; etiqueta: string };
  }[];
  resultado_ia: ResultadoIA;
}

export interface CotizadorResult {
  config_ia: ConfigIA;
  hoteles: HotelesData;
  vuelos: VuelosData;
  errores: string[];
}

export type JobStatus = "waiting" | "active" | "completed" | "failed";

export interface CotizadorJobResponse {
  jobId: string;
  status: JobStatus;
  progress: {
    percentage: number;
    message: string;
  } | null;
  result: CotizadorResult | null;
  error: string | null;
}
