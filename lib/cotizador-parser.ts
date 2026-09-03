function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extraerValorMarkdown(texto: string, campo: string): string {
  const patron = new RegExp(`\\*\\*${escapeRegExp(campo)}:\\*\\*\\s*(.+)`, "i");
  const m = texto.match(patron);
  return m ? m[1].trim() : "";
}

function extraerBloqueMarkdown(texto: string, titulo: string): string {
  const patron = new RegExp(
    `###\\s*${escapeRegExp(titulo)}([\\s\\S]*?)(?=\\n###|\\n##|$)`,
    "i",
  );
  const m = texto.match(patron);
  return m ? m[1].trim() : "";
}

export function extraerPrecioNumero(textoPrecio?: string): number {
  if (!textoPrecio) return 0;
  const m = textoPrecio.match(/([\d]{1,3}(?:[.,]\d{3})+|\d+)/);
  if (!m) return 0;
  const raw = m[1].replace(/\./g, "").replace(/,/g, "");
  const valor = parseFloat(raw);
  return isNaN(valor) ? 0 : valor;
}

export function formatoCOP(valor: number): string {
  try {
    return "$" + Math.round(valor).toLocaleString("es-CO");
  } catch {
    return "$0";
  }
}

interface InfoVuelo {
  aerolinea: string;
  fecha: string;
  hora_salida: string;
  hora_llegada: string;
  paradas: string;
  duracion: string;
  precio_texto: string;
}

function extraerInfoVueloDesdeBloque(bloque: string): InfoVuelo {
  return {
    aerolinea: extraerValorMarkdown(bloque, "Aerolínea"),
    fecha: extraerValorMarkdown(bloque, "Fecha"),
    hora_salida: extraerValorMarkdown(bloque, "Hora de salida"),
    hora_llegada: extraerValorMarkdown(bloque, "Hora de llegada"),
    paradas: extraerValorMarkdown(bloque, "Paradas"),
    duracion: extraerValorMarkdown(bloque, "Duración"),
    precio_texto: extraerValorMarkdown(bloque, "Precio"),
  };
}

export interface ResumenVuelosFechaExacta {
  ida: InfoVuelo;
  regreso: InfoVuelo;
  precioIda: number;
  precioRegreso: number;
  totalVuelos: number;
}

export function extraerResumenVuelosFechaExacta(
  recomendacion: string,
): ResumenVuelosFechaExacta {
  const texto = recomendacion || "";

  const mFecha = texto.match(
    /##\s*Opción\s*\d+:\s*fecha exacta([\s\S]*?)(?=\n##\s*Opción|$)/i,
  );
  const bloqueFecha = mFecha ? mFecha[1] : texto;

  let bloqueIda = extraerBloqueMarkdown(bloqueFecha, "Mejor ida según pesos");
  let bloqueRegreso = extraerBloqueMarkdown(
    bloqueFecha,
    "Mejor regreso según pesos",
  );

  if (!bloqueIda) {
    bloqueIda = extraerBloqueMarkdown(bloqueFecha, "Opción económica de ida");
  }
  if (!bloqueRegreso) {
    bloqueRegreso = extraerBloqueMarkdown(
      bloqueFecha,
      "Opción económica de regreso",
    );
  }

  const ida = extraerInfoVueloDesdeBloque(bloqueIda);
  const regreso = extraerInfoVueloDesdeBloque(bloqueRegreso);

  const precioIda = extraerPrecioNumero(ida.precio_texto);
  const precioRegreso = extraerPrecioNumero(regreso.precio_texto);

  const mTotal = bloqueFecha.match(/\*\*Precio total recomendado:\*\*\s*(.+)/i);
  const totalVuelos = mTotal
    ? extraerPrecioNumero(mTotal[1])
    : precioIda + precioRegreso;

  return { ida, regreso, precioIda, precioRegreso, totalVuelos };
}

export function generarTextoVuelosFechaExacta(recomendacion: string): string {
  const r = extraerResumenVuelosFechaExacta(recomendacion);

  return [
    "✈️ Vuelos fecha exacta",
    "",
    "Ida:",
    `• Aerolínea: ${r.ida.aerolinea || "—"}`,
    `• Fecha: ${r.ida.fecha || "—"}`,
    `• Horario: ${r.ida.hora_salida || "—"} - ${r.ida.hora_llegada || "—"}`,
    `• Duración: ${r.ida.duracion || "—"}`,
    `• Escalas: ${r.ida.paradas || "—"}`,
    `• Valor ida: ${formatoCOP(r.precioIda)}`,
    "",
    "Regreso:",
    `• Aerolínea: ${r.regreso.aerolinea || "—"}`,
    `• Fecha: ${r.regreso.fecha || "—"}`,
    `• Horario: ${r.regreso.hora_salida || "—"} - ${r.regreso.hora_llegada || "—"}`,
    `• Duración: ${r.regreso.duracion || "—"}`,
    `• Escalas: ${r.regreso.paradas || "—"}`,
    `• Valor regreso: ${formatoCOP(r.precioRegreso)}`,
    "",
    `Valor total vuelos recomendados: ${formatoCOP(r.totalVuelos)}`,
  ].join("\n");
}

export function generarTextoCombinadoComercial(
  recomendacionVuelos: string,
  textoHoteles: string,
): string {
  const textoVuelos = generarTextoVuelosFechaExacta(recomendacionVuelos);

  return `${textoVuelos}

---

🏨 Opciones de alojamiento

${textoHoteles}

---

*Tarifas sujetas a cambios y disponibilidad al momento de reservar.*`;
}
