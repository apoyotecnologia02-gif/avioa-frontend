export const commercialProtocolSource = {
  title: "PROTOCOLO DE ATENCIÓN BITRIX24",
  gid: "216144764",
  range: "A1:C1034",
} as const;
export type ProtocolStep = {
  id: string;
  row: number;
  label: string;
  text: string;
};
export type ProtocolSection = {
  id: string;
  title: string;
  row: number;
  steps: ProtocolStep[];
};
/** Merged cells export blanks. Keep source order, row numbers and exact messages. */
export function parseCommercialProtocol(rows: string[][]): ProtocolSection[] {
  const sections: ProtocolSection[] = [];
  let current: ProtocolSection | undefined,
    objection = "";
  rows.forEach((cells, index) => {
    const values = cells.slice(0, 3).map((v) => (v || "").trim()),
      [a, b, c] = values;
    if (!values.some(Boolean)) return;
    if (/^escenario\s*\d+/i.test(a) || /^manejo de objeciones$/i.test(a)) {
      current = {
        id: String(index + 1),
        title: values.filter(Boolean).join(" · "),
        row: index + 1,
        steps: [],
      };
      sections.push(current);
      objection = "";
      return;
    }
    if (!current) return;
    if (/^manejo de objeciones/i.test(current.title) && a) objection = a;
    const text = c || b || "";
    const label = c
      ? [a || objection, b].filter(Boolean).join(" · ")
      : a || objection;
    current.steps.push({ id: String(index + 1), row: index + 1, label, text });
  });
  if (!sections.length)
    throw Error(
      "No se reconocen los escenarios del protocolo. Revisa la hoja de origen.",
    );
  return sections;
}
