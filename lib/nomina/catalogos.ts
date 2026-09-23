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
