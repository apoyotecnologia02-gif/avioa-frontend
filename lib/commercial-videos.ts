export type HotelVideo = { title: string; description: string; url: string };

export const videoNormalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export function safeVideoUrl(value: unknown): string {
  if (typeof value !== "string" || value.length > 2000) return "";
  try {
    const u = new URL(value.trim());
    if (
      !["https:", "http:"].includes(u.protocol) ||
      u.username ||
      u.password ||
      !u.hostname.includes(".")
    )
      return "";
    return u.href;
  } catch {
    return "";
  }
}

export function validVideo(v: unknown): v is HotelVideo {
  if (!v || typeof v !== "object") return false;
  const e = v as HotelVideo;
  return (
    typeof e.title === "string" &&
    !!e.title.trim() &&
    e.title.length <= 250 &&
    typeof e.description === "string" &&
    e.description.length <= 20000 &&
    !!safeVideoUrl(e.url)
  );
}

export const videoIdentity = (e: HotelVideo) =>
  JSON.stringify([videoNormalize(e.title), safeVideoUrl(e.url)]);

function text(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v).trim();
  if (typeof v === "object") {
    const x = v as Record<string, unknown>;
    if ("formula" in x || "sharedFormula" in x)
      throw Error("Pega las fórmulas como valores antes de importar.");
    if (Array.isArray(x.richText))
      return x.richText
        .map((t) => t.text || "")
        .join("")
        .trim();
    if (typeof x.text === "string") return x.text.trim();
  }
  throw Error("Celda no compatible. Usa texto.");
}

function links(v: unknown) {
  const s = text(v),
    found: string[] = s.match(/https?:\/\/[^\s<>"']+/g) || [];
  if (v && typeof v === "object" && "hyperlink" in v)
    found.push(String(v.hyperlink));
  return [
    ...new Set(
      found
        .map((u) => safeVideoUrl(u.replace(/[.,;!?)]+$/, "")))
        .filter(Boolean),
    ),
  ];
}

export function parseHotelVideos(grid: unknown[][]) {
  const h = grid.findIndex(
    (r) =>
      r.some((v) =>
        ["nombre hotel", "hotel", "titulo"].includes(videoNormalize(text(v))),
      ) &&
      r.some((v) =>
        ["descripcion", "enlace", "url", "video"].includes(
          videoNormalize(text(v)),
        ),
      ),
  );
  if (h < 0)
    throw Error(
      "No se encontró el encabezado Nombre hotel y Descripción, o Hotel y Enlace.",
    );
  const headers = grid[h].map((v) => videoNormalize(text(v))),
    ti = headers.findIndex((v) =>
      ["nombre hotel", "hotel", "titulo"].includes(v),
    ),
    di = headers.indexOf("descripcion"),
    ui = headers.findIndex((v) => ["enlace", "url", "video"].includes(v)),
    entries: HotelVideo[] = [],
    issues: string[] = [],
    seen = new Set<string>();
  let duplicates = 0;
  grid.slice(h + 1).forEach((r, i) => {
    if (!r.some((v) => v != null && v !== "")) return;
    const title = text(r[ti]),
      description = di >= 0 ? text(r[di]) : "",
      urls = [...new Set([...links(r[ui]), ...links(r[di])])];
    if (!title || !urls.length) {
      issues.push(
        `Fila ${h + i + 2}: falta el nombre del hotel o un enlace válido.`,
      );
      return;
    }
    for (const url of urls) {
      const e = { title, description, url };
      if (!validVideo(e)) {
        issues.push(`Fila ${h + i + 2}: texto demasiado largo.`);
        continue;
      }
      const key = videoIdentity(e);
      if (seen.has(key)) {
        duplicates++;
        continue;
      }
      seen.add(key);
      entries.push(e);
    }
  });
  if (!entries.length) throw Error("No se encontraron videos válidos.");
  if (entries.length > 500)
    throw Error("Importa hasta 500 videos por archivo.");
  return { entries, issues, duplicates };
}