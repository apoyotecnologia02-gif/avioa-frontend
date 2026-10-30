"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Video,
  Plus,
  Upload,
  RefreshCw,
  Search,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useModulePermission } from "@/hooks/useModulePermission";
import { copyCommercialText } from "@/lib/commercial/clipboard";
import { commercialRequest } from "@/lib/commercial/request";
import { readPasswordFileGrid } from "@/lib/reservation-password-import";
import { parseHotelVideos, videoNormalize } from "@/lib/commercial-videos";
import { VideoCard, type VideoEntry } from "./VideoCard";
import { VideoFormModal, type VideoDraft } from "./VideoFormModal";
import { VideoImportPreview } from "./VideoImportPreview";

interface ApiResponse {
  warning?: string;
  checkedAt?: string;
  error?: string;
  entries: VideoEntry[];
  added: number;
  skipped: number;
}

async function callVideosApi(
  body?: unknown,
  signal?: AbortSignal,
  force = false,
): Promise<ApiResponse> {
  const url = "/api/commercial/videos" + (force ? "?refresh=1" : "");
  const r = await commercialRequest(url, {
    cache: "no-store",
    signal,
    ...(body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
  const data = (await r.json()) as ApiResponse;
  if (!r.ok)
    throw new Error(data.error || "No se pudo completar la solicitud.");
  return data;
}

const DRIVE_URL =
  "https://docs.google.com/spreadsheets/d/1NEyuaFSPM0gymMETM_fxMHI8VWDIVoRmvPT73tdOpWU/edit#gid=1125647686";
const PAGE_SIZE = 24;

export function HotelVideos() {
  const permissions = useModulePermission("COMMERCIAL");
  const canEdit = permissions.canAccess;

  const [entries, setEntries] = useState<VideoEntry[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<VideoDraft | null>(null);

  const [preview, setPreview] = useState<{
    entries: VideoEntry[];
    issues: string[];
    duplicates: number;
  } | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async (signal?: AbortSignal, force = false) => {
    try {
      const d = await callVideosApi(undefined, signal, force);
      setEntries(d.entries);
      setError(d.warning || "");
      setCheckedAt(d.checkedAt || null);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function copy(text: string, label = "Texto copiado") {
    try {
      await copyCommercialText(text);
      toast.success(label);
    } catch {
      toast.error("No se pudo copiar");
    }
  }

  function openCreate() {
    setDraft(null);
    setFormOpen(true);
  }

  function openEdit(entry: VideoEntry) {
    setDraft({
      id: entry.id,
      revision: entry.revision,
      title: entry.title,
      description: entry.description,
      url: entry.url,
    });
    setFormOpen(true);
  }

  async function handleFormSubmit(d: VideoDraft) {
    await run(async () => {
      const payload = {
        action: d.id ? "edit" : "add",
        id: d.id,
        revision: d.revision,
        entry: {
          title: d.title,
          description: d.description,
          url: d.url,
        },
      };
      const res = await callVideosApi(payload);
      if (!d.id && !res.added) {
        toast.info("Este hotel y enlace ya están registrados.");
        return;
      }
      setFormOpen(false);
      await load();
      toast.success("Video guardado");
    });
  }

  async function handleDelete(entry: VideoEntry) {
    await run(async () => {
      await callVideosApi({
        action: "delete",
        id: entry.id,
        revision: entry.revision,
      });
      await load();
      toast.success("Video eliminado");
    });
  }

  async function handleFile(file: File) {
    await run(async () => {
      const grid = await readPasswordFileGrid(file, 2000);
      const parsed = parseHotelVideos(grid);
      setPreview(parsed as never);
    });
  }

  async function confirmImport() {
    if (!preview) return;
    await run(async () => {
      const res = await callVideosApi({
        action: "import",
        entries: preview.entries,
      });
      setPreview(null);
      await load();
      toast.success(
        `${res.added} videos importados · ${res.skipped} duplicados omitidos.`,
      );
    });
  }

  // Filtro + paginación en cliente
  const terms = videoNormalize(query).split(" ").filter(Boolean);
  const filtered = entries.filter((e) =>
    terms.every((t) =>
      videoNormalize(e.title + " " + e.description).includes(t),
    ),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE,
  );

  if (!permissions.canAccess) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground">
          No tienes acceso al módulo Comercial.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Video className="h-5 w-5" />
            Videos de hoteles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Encuentra el hotel, abre su video y comparte la descripción con tus
            clientes.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load(undefined, true)}
          disabled={busy || loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Actualizar
        </Button>
      </div>

      {/* Estado Drive */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <span>
          {checkedAt
            ? `Drive consultado: ${new Date(checkedAt).toLocaleString("es-CO")}`
            : "Se muestran los videos migrados y los guardados aquí."}
        </span>
        <a
          href={DRIVE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:underline"
        >
          Abrir hoja de Drive <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Botones de acción */}
      {canEdit && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={openCreate} disabled={busy}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar video
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importar Excel
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void handleFile(f);
            }}
          />
        </div>
      )}

      {/* Búsqueda */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por hotel, destino o descripción…"
          className="pl-9"
        />
      </div>

      {/* Resultado */}
      <p className="text-xs text-muted-foreground">
        {loading
          ? "Cargando videos…"
          : `${filtered.length} de ${entries.length} videos`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-lg border border-border bg-muted/30"
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <Video className="h-8 w-8 text-muted-foreground" />
          <h3 className="text-sm font-semibold">
            {entries.length
              ? "No encontramos videos para esta búsqueda"
              : "Todavía no hay videos"}
          </h3>
          <p className="max-w-sm text-xs text-muted-foreground">
            {entries.length
              ? "Prueba con otras palabras o limpia el filtro."
              : "Importa el Excel o agrega el primero."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((e) => (
            <VideoCard
              key={e.id}
              entry={e}
              canEdit={canEdit}
              busy={busy}
              expanded={expandedId === e.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === e.id ? null : e.id)
              }
              onCopyUrl={() => void copy(e.url, "Enlace copiado")}
              onCopyMessage={() =>
                void copy(
                  [
                    e.title,
                    e.description,
                    ...(e.description.includes(e.url) ? [] : [e.url]),
                  ]
                    .filter(Boolean)
                    .join("\n\n"),
                  "Mensaje copiado",
                )
              }
              onEdit={() => openEdit(e)}
              onDelete={() => {
                if (window.confirm(`¿Eliminar el video de ${e.title}?`)) {
                  void handleDelete(e);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(current - 1)}
            disabled={current <= 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {current} de {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(current + 1)}
            disabled={current >= pages}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Modales */}
      <VideoFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        draft={draft}
        busy={busy}
        onSubmit={handleFormSubmit}
      />

      <VideoImportPreview
        open={!!preview}
        onOpenChange={(open) => !open && setPreview(null)}
        preview={preview}
        busy={busy}
        onConfirm={confirmImport}
      />
    </div>
  );
}
