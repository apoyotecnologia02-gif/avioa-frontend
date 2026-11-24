"use client";

import { useCallback, useState, useRef } from "react";
import {
  AlertCircle,
  Copy,
  Loader2,
  RefreshCw,
  Search,
  UploadCloud,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { commercialRequest } from "@/lib/commercial/request";
import { copyCommercialText } from "@/lib/commercial/clipboard";
import { useRefreshableEffect } from "@/lib/commercial/refresh";
import { normalizeOfferText } from "@/lib/travel-offers";

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
  const [page, setPage] = useState(1);

  // Estados para importar
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para CRUD y confirmaciones
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ id: "", title: "", text: "" });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [replyToDelete, setReplyToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setBusy(true);
    setError("");
    try {
      const r = await commercialRequest("/api/commercial/quick-replies", {
        cache: "no-store",
        signal,
      });
      const d = (await r.json()) as QuickRepliesData;
      if (!r.ok) throw new Error(d.error || "No se pudo cargar.");
      if (signal?.aborted) return;
      setEntries(d.entries ?? []);
    } catch (e) {
      if (!signal?.aborted) setError((e as Error).message);
    } finally {
      if (!signal?.aborted) setBusy(false);
    }
  }, []);

  useRefreshableEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);

  // --- ACCIONES ---
  async function copy(text: string) {
    try {
      await copyCommercialText(text);
      toast.success("Respuesta copiada");
    } catch {
      toast.error("No se pudo copiar.");
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const toastId = toast.loading("Importando respuestas...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await commercialRequest("/api/commercial/quick-replies", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Error al importar");
      toast.success("Respuestas importadas", { id: toastId });
      void load();
    } catch (err: any) {
      toast.error(err.message || "No se pudo importar", { id: toastId });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!formData.title.trim() || !formData.text.trim())
      return toast.error("Título y texto son obligatorios.");
    setIsSaving(true);
    try {
      const isEditing = !!formData.id;
      const url = isEditing
        ? `/api/commercial/quick-replies/${formData.id}`
        : "/api/commercial/quick-replies";

      const res = await commercialRequest(url, {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify({ title: formData.title, text: formData.text }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      toast.success(isEditing ? "Respuesta actualizada" : "Respuesta creada");
      setIsFormOpen(false);
      void load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!replyToDelete) return;
    setIsSaving(true);
    try {
      const res = await commercialRequest(
        `/api/commercial/quick-replies/${replyToDelete}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Error al eliminar");
      toast.success("Respuesta eliminada");
      setIsDeleteOpen(false);
      void load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  }

  // --- FILTROS Y PAGINACIÓN ---
  const terms = normalizeOfferText(query).split(" ").filter(Boolean);
  const filtered = entries.filter((e) =>
    terms.every((t) => normalizeOfferText(`${e.title} ${e.text}`).includes(t)),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header y Acciones */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Copy className="h-5 w-5" /> Respuestas rápidas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Busca, edita o crea respuestas para atender a tus clientes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImport}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            {importing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}{" "}
            Importar Excel
          </Button>
          <Button
            onClick={() => {
              setFormData({ id: "", title: "", text: "" });
              setIsFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Nueva Respuesta
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Buscador */}
      <div className="space-y-1.5">
        <Label>Buscar respuesta</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Saludo, seguimiento..."
            className="pl-9"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} de {entries.length} respuestas
      </p>

      {/* Grid de respuestas */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((e) => (
          <article
            key={e.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold">{e.title || "Sin título"}</h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setFormData({ id: e.id, title: e.title, text: e.text });
                    setIsFormOpen(true);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => {
                    setReplyToDelete(e.id);
                    setIsDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
              {e.text}
            </p>
            <details className="group">
              <summary className="cursor-pointer text-xs font-medium text-primary">
                Ver texto completo
              </summary>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {e.text}
              </p>
            </details>
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <Button size="sm" onClick={() => void copy(e.text)}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar
              </Button>
            </div>
          </article>
        ))}
      </div>

      {/* Paginación */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
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

      {/* MODAL FORMULARIO (Crear/Editar) */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData.id ? "Editar Respuesta" : "Nueva Respuesta"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1">
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Mensaje</Label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? "Guardando..." : "Guardar Respuesta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL ELIMINAR */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar respuesta?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isSaving}
            >
              {isSaving ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
