// TableSource.tsx
"use client";

import { useCallback, useState } from "react";
import {
  AlertCircle,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { commercialRequest } from "@/lib/commercial/request";
import { copyCommercialText } from "@/lib/commercial/clipboard";
import { useRefreshableEffect } from "@/lib/commercial/refresh";
import { offersSheetUrl, normalizeOfferText } from "@/lib/travel-offers";
import {
  commercialTables,
  type CommercialTable,
} from "@/lib/commercial-drive-tables";

interface TableRow {
  id: string;
  cells: string[];
}

interface TableEntry {
  id: string;
  category: string;
  destination: string;
  operator: string;
  raw: string;
}

interface TableData {
  headers?: string[];
  notes?: string[];
  rows?: TableRow[];
  entries?: TableEntry[];
  checkedAt?: string;
  warning?: string;
  error?: string;
}



function link(value: string): string {
  try {
    const u = new URL(value);
    return ["https:", "http:"].includes(u.protocol) &&
      !u.username &&
      !u.password
      ? u.href
      : "";
  } catch {
    return "";
  }
}

interface TableSourceProps {
  sourceKey: CommercialTable;
}

export function TableSource({ sourceKey }: TableSourceProps) {
  const source = commercialTables[sourceKey];

  const [data, setData] = useState<TableData>({});
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (signal?: AbortSignal, force = false) => {
      setBusy(true);
      setError("");
      try {
        const r = await commercialRequest(
          "/api/commercial/drive-tables?source=" +
            sourceKey +
            (force ? "&refresh=1" : ""),
          { cache: "no-store", signal },
        );
        const d = (await r.json()) as TableData;
        if (!r.ok) throw new Error(d.error || "No se pudo cargar la tabla.");
        setError(d.warning || "");
        setData(d);
      } catch (e) {
        if (!signal?.aborted) setError((e as Error).message);
      } finally {
        if (!signal?.aborted) setBusy(false);
      }
    },
    [sourceKey],
  );

  useRefreshableEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);

  async function copy(text: string) {
    try {
      await copyCommercialText(text);
      toast.success("Copiado");
    } catch {
      toast.error("No se pudo copiar. Selecciona el texto manualmente.");
    }
  }

  const terms = normalizeOfferText(query).split(" ").filter(Boolean);
  const match = (s: string) =>
    terms.every((t) => normalizeOfferText(s).includes(t));

  const rows = (data.rows || []).filter((r) => match(r.cells.join(" ")));
  const entries = (data.entries || []).filter((e) =>
    match([e.destination, e.operator, e.category, e.raw].join(" ")),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Acciones */}
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild>
          <a
            href={offersSheetUrl + "#gid=" + source.gid}
            target="_blank"
            rel="noopener noreferrer"
          >
            Cargar o editar en Drive
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => void load(undefined, true)}
        >
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {busy ? "Consultando…" : "Actualizar desde Drive"}
        </Button>
      </div>

      {/* Estado de la fuente */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <span>
          {data.checkedAt
            ? `Última consulta: ${new Date(data.checkedAt).toLocaleString("es-CO")}`
            : busy
              ? "Consultando Drive…"
              : "Se muestra la última copia guardada."}
        </span>
        {error && (
          <span className="flex items-center gap-1 text-destructive">
            <AlertCircle className="h-3 w-3" />
            {error}
            {data.checkedAt ? " — se conserva la consulta anterior." : ""}
          </span>
        )}
      </div>

      {/* Buscador */}
      <div className="space-y-1.5">
        <Label>
          Buscar{" "}
          {sourceKey === "operadores"
            ? "destino u operador"
            : "hotel, destino, fecha, código o palabra clave"}
        </Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe para filtrar…"
            className="pl-9"
          />
        </div>
      </div>

      {/* Vista operadores vs tarifas */}
      {sourceKey === "operadores" ? (
        <OperatorsView entries={entries} source={source} onCopy={copy} />
      ) : (
        <RatesView data={data} rows={rows} source={source} onCopy={copy} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Vista de operadores (cards con links)
   ───────────────────────────────────────────── */
function OperatorsView({
  entries,
  source,
  onCopy,
}: {
  entries: TableEntry[];
  source: (typeof commercialTables)[CommercialTable];
  onCopy: (text: string) => Promise<void>;
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
        <Search className="h-8 w-8 text-muted-foreground" />
        <h3 className="text-sm font-semibold">No hay operadores</h3>
        <p className="max-w-sm text-xs text-muted-foreground">
          Ajusta la búsqueda o revisa la hoja en Drive.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-xs text-muted-foreground">
        {entries.length} enlaces y registros
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((e) => {
          const safe = link(e.raw);
          return (
            <article
              key={e.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
            >
              <span className="w-fit rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {e.category || "General"}
              </span>
              <h3 className="font-semibold">
                {e.destination || e.operator}
              </h3>
              {e.destination && e.operator && (
                <p className="text-xs text-muted-foreground">{e.operator}</p>
              )}
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                {safe ? (
                  <>
                    <Button size="sm" asChild>
                      <a
                        href={safe}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir enlace
                        <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void onCopy(e.raw)}
                    >
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copiar enlace
                    </Button>
                  </>
                ) : (
                  <p className="whitespace-pre-wrap break-words text-xs text-muted-foreground">
                    {e.raw || "Sin enlace en Drive"}
                  </p>
                )}
                <Button size="sm" variant="link" asChild>
                  <a
                    href={
                      offersSheetUrl +
                      "#gid=" +
                      source.gid +
                      "&range=B" +
                      e.id +
                      ":D" +
                      e.id
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver fila en Drive{" "}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function RatesView({
  data,
  rows,
  source,
  onCopy,
}: {
  data: TableData;
  rows: TableRow[];
  source: (typeof commercialTables)[CommercialTable];
  onCopy: (text: string) => Promise<void>;
}) {
  if (rows.length === 0 && (!data.headers || data.headers.length === 0)) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
        <Search className="h-8 w-8 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Sin filas</h3>
        <p className="max-w-sm text-xs text-muted-foreground">
          Ajusta la búsqueda o revisa la hoja en Drive.
        </p>
      </div>
    );
  }

  if (source.title.includes("Navidad")) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-xs text-muted-foreground">
          Valores y condiciones tal como aparecen en Drive, sin recalcular.
        </p>
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.headers?.map((h, i) => {
              const val = r.cells[i];
              if (!val) return null;
              return (
                <div key={i} className="rounded-lg border border-border bg-background p-3 shadow-sm text-foreground">
                 
                  <h4 className="mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    {h}
                  </h4>
             
                  <p className="text-xs leading-relaxed whitespace-pre-wrap text-foreground/80">
                    {val}
                  </p>
                  <Button
                    variant="ghost" 
                    size="sm" 
                    className="mt-3 h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                    onClick={() => void onCopy(`${h}: ${val}`)}
                  >
                    <Copy className="mr-1.5 h-3 w-3" /> Copiar bloque
                  </Button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  const rawHeaders = data.headers || [];
  const activeHeaders = rawHeaders
    .map((label, index) => ({ label: (label || "").trim(), index }))
    .filter((h) => {
    
      if (h.index === 0 && (h.label === "" || h.label === "FILA" || h.label === "FILA EN DRIVE")) {
        return false;
      }
      
      // Descartar si el título está vacío
      if (h.label === "" || h.label === "—") return false;
      
      // Verificar que la columna tenga al menos un dato real
      const hasData = rows.some(r => r.cells[h.index] && r.cells[h.index] !== "—" && r.cells[h.index].trim() !== "");
      return hasData;
    });

  return (
    <>
      <p className="text-xs text-muted-foreground">
        Valores y condiciones tal como aparecen en Drive, sin recalcular.
        Confirma vigencia y disponibilidad antes de cotizar.
      </p>

      {source.title === "Villas Naio" && (
        <p className="rounded-md bg-primary/10 px-3 py-2 text-xs text-primary">
          Este listado muestra los valores del calendario. Los colores y marcas
          de disponibilidad se consultan en{" "}
          <a
            href={offersSheetUrl + "#gid=" + source.gid}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Villas Naio en Drive
          </a>
          .
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        {rows.length} fila{rows.length === 1 ? "" : "s"}
      </p>

      <div
        role="region"
        aria-label={"Tarifas " + source.title}
        tabIndex={0}
        className="max-h-[70vh] overflow-y-auto overflow-x-auto rounded-lg border border-border bg-card relative"
      >
        <table className="w-full table-fixed border-collapse text-[13px] text-left">
          <thead className="sticky top-0 z-10 bg-blue-50/95 backdrop-blur-sm dark:bg-muted/95 text-blue-900 dark:text-blue-100 shadow-sm">
            <tr>
              <th className="w-12 border-r border-b border-border px-2 py-3 font-semibold text-[10px] tracking-wide uppercase text-center first:border-l">
                <div className="flex flex-col leading-tight">
                  <span>Fila</span>
                  <span>en</span>
                  <span>Drive</span>
                </div>
              </th>
              
              {activeHeaders.map((h, i) => (
                <th 
                  key={i} 
                  className="border-r border-b border-border px-2 py-3 font-semibold text-[10px] tracking-wide uppercase text-center whitespace-normal break-words"
                  style={{ width: `${Math.max(7, 100 / (activeHeaders.length + 2))}%` }}
                >
                  {h.label}
                </th>
              ))}
              
              <th className="w-[70px] border-b border-border px-2 py-3 font-semibold text-[10px] tracking-wide uppercase bg-blue-50/95 dark:bg-muted/95 text-center">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => {
              const getVal = (idx: number) => {
                const val = r.cells[idx];
                return val && val !== "—" ? val : "";
              };

              return (
                <tr key={r.id} className="transition-colors hover:bg-muted/30">
                  <td className="border-r border-border px-2 py-3 text-center font-medium text-muted-foreground bg-muted/20 text-xs">
                    {r.id}
                  </td>
                  
                  {activeHeaders.map((h, colIdx) => {
                    const val = getVal(h.index);
                    const isPrice = val.includes("$") || val.includes("COP") || h.label.includes("TARIFA");
                    
                    return (
                      <td 
                        key={colIdx} 
                        className={`border-r border-border px-2 py-3 whitespace-normal break-words text-center ${
                          isPrice ? "font-mono text-[11px]" : ""
                        }`}
                      >
                        {val}
                      </td>
                    );
                  })}

                  <td className="px-2 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        onClick={() => {
                           const copyText = activeHeaders
                             .map((h) => {
                               const val = r.cells[h.index];
                               return val && val !== "—" ? `${h.label}: ${val}` : "";
                             })
                             .filter(Boolean)
                             .join("\n");
                           void onCopy(copyText);
                        }}
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Copiar
                      </Button>
                      <Button variant="link" size="sm" className="h-6 p-0 text-[10px]" asChild>
                        <a
                          href={offersSheetUrl + "#gid=" + source.gid + "&range=A" + r.id}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver fuente <ExternalLink className="ml-0.5 h-2.5 w-2.5" />
                        </a>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}