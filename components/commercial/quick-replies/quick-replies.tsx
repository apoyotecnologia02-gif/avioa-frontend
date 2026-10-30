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

interface Reply {
  id: string;
  title: string;
  text: string;
}

interface QuickRepliesData {
  entries: Reply[];
  checkedAt?: string;
  warning?: string;
  error?: string;
}

const PAGE_SIZE = 24;

export function QuickReplies() {
  const [entries, setEntries] = useState<Reply[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [checkedAt, setCheckedAt] = useState<string>("");
  const [page, setPage] = useState(1);

  const load = useCallback(
    async (signal?: AbortSignal, force = false) => {
      setBusy(true);
      setError("");
      try {
        const r = await commercialRequest(
          "/api/commercial/quick-replies" + (force ? "?refresh=1" : ""),
          { cache: "no-store", signal },
        );
        const d = (await r.json()) as QuickRepliesData;
        if (!r.ok) throw new Error(d.error || "No se pudo cargar.");
        setError(d.warning || "");
        setEntries(d.entries ?? []);
        setCheckedAt(d.checkedAt ?? "");
      } catch (e) {
        if (!signal?.aborted) setError((e as Error).message);
      } finally {
        if (!signal?.aborted) setBusy(false);
      }
    },
    [],
  );

  useRefreshableEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);

  async function copy(text: string) {
    try {
      await copyCommercialText(text);
      toast.success("Respuesta copiada");
    } catch {
      toast.error(
        "No se pudo copiar. Abre el texto completo y selecciónalo.",
      );
    }
  }

  const terms = normalizeOfferText(query).split(" ").filter(Boolean);
  const filtered = entries.filter((e) =>
    terms.every((t) =>
      normalizeOfferText(`${e.title} ${e.text}`).includes(t),
    ),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Copy className="h-5 w-5" />
          Respuestas rápidas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Busca el mensaje y cópialo para atender a tu cliente.
        </p>
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild>
          <a
            href={offersSheetUrl + "#gid=23297697"}
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
          {checkedAt
            ? `Última consulta: ${new Date(checkedAt).toLocaleString("es-CO")}`
            : busy
              ? "Consultando Drive…"
              : "Se muestra la última copia guardada."}
        </span>
        {error && (
          <span className="flex items-center gap-1 text-destructive">
            <AlertCircle className="h-3 w-3" />
            {error}
            {checkedAt ? " — se conserva la consulta anterior." : ""}
          </span>
        )}
      </div>

      {/* Buscador */}
      <div className="space-y-1.5">
        <Label>Buscar respuesta</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Saludo, seguimiento, reserva, documentación…"
            className="pl-9"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} de {entries.length} respuestas
      </p>

      {/* Grid de respuestas */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((e) => (
            <article
              key={e.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
            >
              <h3 className="font-semibold">{e.title || "Sin título"}</h3>
              <p className="line-clamp-4 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                {e.text}
              </p>
              <details className="group">
                <summary className="cursor-pointer text-xs font-medium text-primary">
                  Ver texto completo
                </summary>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                  {e.text}
                </p>
              </details>
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                <Button size="sm" onClick={() => void copy(e.text)}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copiar respuesta
                </Button>
                <Button size="sm" variant="link" asChild>
                  <a
                    href={
                      offersSheetUrl +
                      "#gid=23297697&range=A" +
                      e.id +
                      ":B" +
                      e.id
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver en Drive
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        !busy &&
        !error && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground" />
            <h3 className="text-sm font-semibold">
              No hay respuestas para esta búsqueda
            </h3>
            <p className="max-w-sm text-xs text-muted-foreground">
              Ajusta la búsqueda o revisa la hoja en Drive.
            </p>
          </div>
        )
      )}

      {/* Paginación */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
          >
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground">
            Página {current} de {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={current >= pages}
            onClick={() => setPage(current + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}