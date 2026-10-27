export type NiltzeCell = { text: string; colSpan?: number; rowSpan?: number };
export type NiltzeBlock =
  | { type: "text"; text: string }
  | { type: "table"; rows: NiltzeCell[][] };
export type NiltzeItem = {
  id: string;
  title: string;
  category: string;
  theme: string;
  source: string;
  sourceSha256: string;
  sourceSection: string;
  blocks: NiltzeBlock[];
  nights: number | null;
  days: number | null;
  modality: string;
  currency: string | null;
  adultPrice: number | null;
  priceBasis: string | null;
  itinerary: string[];
  includes: string[];
  warnings: string[];
  historical: boolean;
  searchText: string;
};
export type NiltzeSummary = Omit<
  NiltzeItem,
  "blocks" | "itinerary" | "includes" | "sourceSha256"
> & { highlights: string[] };
export type NiltzeIndex = {
  operator: string;
  importedAt: string;
  sourceUrl: string;
  edition: string;
  sourceCount: number;
  emptyFolders: string[];
  items: NiltzeSummary[];
};
export const normalizeNiltze = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
export function filterNiltze(
  items: NiltzeSummary[],
  p: {
    query: string;
    category: string;
    theme: string;
    nights: string;
    modality: string;
    history: boolean;
  },
) {
  const words = normalizeNiltze(p.query).trim().split(/\s+/).filter(Boolean);
  return items.filter(
    (i) =>
      (p.history || !i.historical) &&
      (!p.category || i.category === p.category) &&
      (!p.theme || i.theme === p.theme) &&
      (!p.nights || String(i.nights) === p.nights) &&
      (!p.modality || i.modality === p.modality) &&
      words.every((w) => normalizeNiltze(i.searchText).includes(w)),
  );
}