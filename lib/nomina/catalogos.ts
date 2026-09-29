import { type TipoNovedad } from "@/types/nomina.types";

export const CATALOGO_TIPO_NOVEDAD: { value: TipoNovedad; label: string }[] = [
  { value: "VACACIONES", label: "Vacaciones" },
  { value: "INCAPACIDAD_EPS", label: "Incapacidad EPS" },
  { value: "INCAPACIDAD_ARL", label: "Incapacidad ARL" },
  { value: "LICENCIA_MATERNIDAD", label: "Licencia de maternidad" },
  { value: "LICENCIA_PATERNIDAD", label: "Licencia de paternidad" },
  { value: "LICENCIA_LUTO", label: "Licencia de luto" },
  // { value: "LICENCIA_MATRIMONIO", label: "Licencia de matrimonio" },
  { value: "PERMISO_REMUNERADO", label: "Licencia remunerada" },
  { value: "PERMISO_NO_REMUNERADO", label: "Licencia no remunerada" },
  { value: "CALAMIDAD_DOMESTICA", label: "Calamidad doméstica" },
  { value: "DILIGENCIA_PERSONAL", label: "Diligencia personal" },
  { value: "OBLIGACION_COMO_ACUDIENTE", label: "Obligación como acudiente" },
  { value: "CITA_MEDICA_PARTICULAR", label: "Cita médica particular" },
  {
    value: "CITA_MEDICA_CON_ESPECIALISTA_EPS",
    label: "Cita médica con especialista EPS",
  },
  { value: "OTRO", label: "Otro" },
  { value: "HORAS_EXTRA", label: "Horas extra" },
];

export function labelDeTipo(tipo: TipoNovedad, esCompensada?: boolean): string {
  if (tipo === "VACACIONES") {
    return esCompensada
      ? "Vacaciones compensadas (dinero)"
      : "Vacaciones disfrutadas (tiempo)";
  }

  return CATALOGO_TIPO_NOVEDAD.find((t) => t.value === tipo)?.label ?? tipo;
}

export function colorPorAfectacion(afecta: "SUMA" | "RESTA"): string {
  return afecta === "SUMA"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-red-100 text-red-700";
}

export const CATALOGO_ESTADO_SOLICITUD: {
  value: string;
  label: string;
  className: string;
}[] = [
  {
    value: "PENDING_HR_VALIDATION",
    label: "Pendiente validación GH",
    className:
      "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400",
  },
  {
    value: "PENDING",
    label: "Pendiente",
    className:
      "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400",
  },
  {
    value: "APPROVED",
    label: "Aprobada",
    className:
      "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400",
  },
  {
    value: "REJECTED",
    label: "Rechazada",
    className:
      "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400",
  },
  {
    value: "CANCELLED",
    label: "Cancelada",
    className:
      "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700",
  },
];

export function claseEstado(status: string): string {
  return (
    CATALOGO_ESTADO_SOLICITUD.find((s) => s.value === status)?.className ?? ""
  );
}
