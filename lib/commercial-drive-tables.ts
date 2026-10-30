export const commercialTables = {
  baja2026: { title: "Baja 2026", gid: "1340216287", range: "A1:AA1038" },
  alta2026: { title: "Alta 2026", gid: "1746999998", range: "A1:Z1024" },
  baja2027: { title: "Baja 2027", gid: "2044920053", range: "A1:AA989" },
  navidad: {
    title: "Planes Navidad y Fin de Año",
    gid: "1080181037",
    range: "A1:AB999",
  },
  jetsmart: { title: "Bloqueos JetSMART", gid: "985693555", range: "A1:V981" },
  naio: { title: "Villas Naio", gid: "1730499314", range: "A1:Z999" },
  operadores: {
    title: "Links de operadores",
    gid: "1744977722",
    range: "A1:D1014",
  },
} as const;
export type CommercialTable = keyof typeof commercialTables;
export function rateTable(rows: string[][]) {
  if (!rows[2]?.some((c) => c.trim().toUpperCase() === "HOTEL"))
    throw Error("Encabezados no reconocidos");
  const width = Math.max(...rows.map((r) => r.length));
  let group = "";
  const headers = Array.from({ length: width }, (_, i) => {
    const a = rows[2]?.[i]?.trim() || "",
      b = rows[3]?.[i]?.trim() || "";
    if (a) group = a;
    return b ? `${a || group} · ${b}` : a || `Columna ${i + 1}`;
  });
  return {
    headers,
    notes: rows
      .slice(0, 2)
      .map((r) => r.filter((x) => x.trim()).join(" · "))
      .filter(Boolean),
    rows: rows
      .slice(4)
      .flatMap((cells, i) =>
        cells.some((c) => c.trim()) ? [{ id: String(i + 5), cells }] : [],
      ),
  };
}

// Preserve original row numbers, headings and formatted values for heterogeneous sheets.
export function specialRateTable(rows: string[][]) {
  const columns = Array.from(
    { length: Math.max(0, ...rows.map((r) => r.length)) },
    (_, i) => i,
  ).filter((i) => rows.some((r) => r[i]?.trim()));
  const letter = (index: number) => {
    let result = "";
    for (let n = index + 1; n; n = Math.floor((n - 1) / 26))
      result = String.fromCharCode(65 + ((n - 1) % 26)) + result;
    return result;
  };
  return {
    headers: columns.map((i) => "Columna " + letter(i)),
    notes: [],
    rows: rows.flatMap((cells, i) =>
      cells.some((c) => c.trim())
        ? [{ id: String(i + 1), cells: columns.map((c) => cells[c] || "") }]
        : [],
    ),
  };
}
