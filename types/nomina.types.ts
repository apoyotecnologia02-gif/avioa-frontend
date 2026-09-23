export type LeaveType =
  | "VACACIONES"
  | "INCAPACIDAD_EPS"
  | "INCAPACIDAD_ARL"
  | "LICENCIA_MATERNIDAD"
  | "LICENCIA_PATERNIDAD"
  | "LICENCIA_LUTO"
  | "LICENCIA_MATRIMONIO"
  | "PERMISO_REMUNERADO"
  | "PERMISO_NO_REMUNERADO"
  | "CALAMIDAD_DOMESTICA"
  | "DILIGENCIA_PERSONAL"
  | "OBLIGACION_COMO_ACUDIENTE"
  | "CITA_MEDICA_PARTICULAR"
  | "OTRO";

export type TipoNovedad = LeaveType | "HORAS_EXTRA";

export interface NovedadConsolidada {
  id: string;
  origen: "LEAVE" | "OVERTIME";
  tipo: TipoNovedad;
  tipoLabel: string;
  unidad: "DIAS" | "HORAS";
  esRemunerada: boolean;
  afectaNomina: "SUMA" | "RESTA";
  esCompensada?: boolean;

  userId: string;
  nombreColaborador: string;
  documentNumber: string | null;
  position: string | null;
  area: string | null;
  department: string | null;
  legalEntity: string | null;
  office: string | null;

  fechaInicio: string;
  fechaFin: string;
  fechaInicioEnPeriodo: string;
  fechaFinEnPeriodo: string;
  cantidadEnPeriodo: number;
  cantidadTotal: number;
  cruzaPeriodoAnterior: boolean;
  cruzaPeriodoSiguiente: boolean;

  horaInicio: string | null;
  horaFin: string | null;

  motivo: string;
  attachmentUrl: string | null;
  comentarioAprobador: string | null;
  aprobadorId: string;
  nombreAprobador: string;
  fechaRegistro: string;
  fechaAprobacion: string | null;

  createdAt: string | null;
}

export interface ResumenColaborador {
  userId: string;
  nombreColaborador: string;
  documentNumber: string | null;
  position: string | null;
  area: string | null;
  legalEntity: string | null;
  totalDiasAusencia: number;
  totalDiasVacaciones: number;
  totalHorasExtra: number;
  diasNoRemunerados: number;
  novedades: NovedadConsolidada[];
}

export interface TotalesNomina {
  totalNovedades: number;
  colaboradoresAfectados: number;
  totalHorasExtra: number;
  totalDiasVacaciones: number;
  totalDiasAusencia: number;
  totalDiasNoRemunerados: number;
  novedadesQueCruzanPeriodo: number;
  sinSoporte: number;
}

export interface FiltrosNomina {
  desde: string;
  hasta: string;
  userId?: string;
  tipos?: string[];
  area?: string;
  legalEntity?: string;
  soloRemuneradas?: boolean;
}
