"use client";

import { useCallback, useState, useRef } from "react";
import {
  BookOpen,
  ChevronDown,
  Copy,
  Loader2,
  Search,
  Plus,
  Trash2,
  UploadCloud,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useModulePermission } from "@/hooks/useModulePermission";
import { normalizeOfferText } from "@/lib/travel-offers";

export interface ProtocolStep {
  id: string;
  row: number;
  label: string;
  text: string;
}

export interface ProtocolSection {
  id: string;
  title: string;
  row: number;
  steps: ProtocolStep[];
}

interface ProtocolResponse {
  sections: ProtocolSection[];
  checkedAt: string;
  warning?: string;
  error?: string;
}

export function AttentionProtocol() {
  const permissions = useModulePermission("COMMERCIAL");

  const [sections, setSections] = useState<ProtocolSection[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("all");

  // Estados para CRUD
  const [isNewSectionOpen, setIsNewSectionOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const [isNewStepOpen, setIsNewStepOpen] = useState(false);
  const [newStepData, setNewStepData] = useState({ sectionId: "", label: "", text: "" });

  const [isEditSectionOpen, setIsEditSectionOpen] = useState(false);
  const [editSectionData, setEditSectionData] = useState({ id: "", title: "" });


  const [deleteData, setDeleteData] = useState<{ type: "section" | "step"; id: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setBusy(true);
    setError("");
    try {
      const r = await commercialRequest("/api/commercial/protocol", { cache: "no-store", signal });
      const d = (await r.json()) as ProtocolResponse;
      if (!r.ok) throw new Error(d.error || "No se pudo cargar el protocolo.");
      if (signal?.aborted) return;
      setSections(d.sections || []);
    } catch (e) {
      if (!signal?.aborted) setError((e as Error).message);
    } finally {
      if (!signal?.aborted) setBusy(false);
    }
  }, []);

  useRefreshableEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function copy(text: string) {
    try {
      await copyCommercialText(text);
      toast.success("Mensaje copiado. Revísalo antes de enviar.");
    } catch {
      toast.error("No se pudo copiar. Selecciona el texto para copiarlo manualmente.");
    }
  }


  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const toastId = toast.loading("Importando protocolo...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await commercialRequest("/api/commercial/protocol/import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al importar el archivo");

      toast.success("Protocolo importado correctamente", { id: toastId });
      void load();
    } catch (err: any) {
      toast.error(err.message || "No se pudo importar", { id: toastId });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

 
  async function handleCreateSection() {
    if (!newSectionTitle.trim()) return;
    try {
      const res = await commercialRequest("/api/commercial/protocol/sections", {
        method: "POST",
        body: JSON.stringify({ title: newSectionTitle }),
      });
      if (!res.ok) throw new Error("Error al crear la sección");
      toast.success("Sección creada");
      setIsNewSectionOpen(false);
      setNewSectionTitle("");
      void load();
    } catch (e: any) { toast.error(e.message); }
  }

  async function handleUpdateSection() {
    if (!editSectionData.title.trim()) return;
    try {
      const res = await commercialRequest(`/api/commercial/protocol/sections/${editSectionData.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: editSectionData.title }),
      });
      if (!res.ok) throw new Error("Error al actualizar la sección");
      toast.success("Sección actualizada");
      setIsEditSectionOpen(false);
      void load();
    } catch (e: any) { toast.error(e.message); }
  }

 
  async function handleCreateStep() {
    if (!newStepData.label.trim() || !newStepData.text.trim()) {
      return toast.error("La etiqueta y el mensaje son obligatorios");
    }
    try {
      const res = await commercialRequest(`/api/commercial/protocol/sections/${newStepData.sectionId}/steps`, {
        method: "POST",
        body: JSON.stringify({ label: newStepData.label, text: newStepData.text }),
      });
      if (!res.ok) throw new Error("Error al crear el paso");
      toast.success("Paso agregado");
      setIsNewStepOpen(false);
      setNewStepData({ sectionId: "", label: "", text: "" });
      void load();
    } catch (e: any) { toast.error(e.message); }
  }

  // --- ELIMINAR (Confirmación vía Modal) ---
  async function confirmDelete() {
    if (!deleteData) return;
    setIsDeleting(true);
    try {
      const endpoint = deleteData.type === "section" 
        ? `/api/commercial/protocol/sections/${deleteData.id}`
        : `/api/commercial/protocol/steps/${deleteData.id}`;

      const res = await commercialRequest(endpoint, { method: "DELETE" });
      
      if (!res.ok) throw new Error("Error al eliminar");
      
      toast.success(deleteData.type === "section" ? "Sección eliminada" : "Paso eliminado");
      setDeleteData(null);
      void load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsDeleting(false);
    }
  }

  if (!permissions.canAccess) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground">No tienes acceso al módulo Comercial.</p>
      </div>
    );
  }

  const terms = normalizeOfferText(query).split(" ").filter(Boolean);
  const visible = sections
    .filter((s) => selected === "all" || s.id === selected)
    .map((s) => ({
      ...s,
      steps: s.steps.filter((step) =>
        terms.every((t) =>
          normalizeOfferText(s.title + " " + step.label + " " + step.text).includes(t)
        )
      ),
    }))
    .filter((s) => s.steps.length > 0 || (selected !== "all" && !query));

  return (
    <div className="flex w-full flex-col gap-4">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <BookOpen className="h-5 w-5" /> Protocolo de atención
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Guía de atención comercial: escenarios, seguimientos y manejo de objeciones.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="file" accept=".xlsx,.xls,.csv" className="hidden" ref={fileInputRef} onChange={handleImport} />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Importar Excel
          </Button>
          <Button onClick={() => setIsNewSectionOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Sección
          </Button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Escenario o sección</Label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los escenarios</SelectItem>
              {sections.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Buscar en el protocolo</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Saludo, seguimiento, objeciones…" className="pl-9" />
          </div>
        </div>
      </div>

      {busy && !sections.length && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando protocolo...
        </div>
      )}
      {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      {/* SECCIONES */}
      <div className="space-y-3">
        {visible.map((s) => (
          <details key={s.id} className="group rounded-lg border border-border bg-card" open={query || selected !== "all" ? true : undefined}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted/30 [&::-webkit-details-marker]:hidden">
              
              <div className="flex items-center gap-2">
                <span>{s.title}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={(e) => { e.preventDefault(); setEditSectionData({ id: s.id, title: s.title }); setIsEditSectionOpen(true); }}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={(e) => { e.preventDefault(); setDeleteData({ type: "section", id: s.id }); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={(e) => { e.preventDefault(); setNewStepData({ ...newStepData, sectionId: s.id }); setIsNewStepOpen(true); }}>
                  <Plus className="mr-1 h-3 w-3" /> Paso
                </Button>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </div>
            </summary>
            
            <ol className="space-y-4 border-t border-border/50 p-4">
              {s.steps.map((step) => (
                <li key={step.id} className="border-b border-border/40 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <strong className="block whitespace-pre-wrap text-sm">{step.label || "Mensaje"}</strong>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => setDeleteData({ type: "step", id: step.id })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {step.text && (
                    <>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{step.text}</p>
                      <Button variant="outline" size="sm" className="mt-3 h-8" onClick={() => void copy(step.text)}>
                        <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar mensaje
                      </Button>
                    </>
                  )}
                </li>
              ))}
              {s.steps.length === 0 && <p className="text-sm text-muted-foreground">No hay pasos en esta sección.</p>}
            </ol>
          </details>
        ))}
      </div>

      {/* SIN RESULTADOS */}
      {!busy && !visible.length && !error && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <Search className="h-8 w-8 text-muted-foreground" />
          <h3 className="text-sm font-semibold">No encontramos pasos con esa búsqueda</h3>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINACIÓN */}
      <Dialog open={!!deleteData} onOpenChange={(open) => !open && setDeleteData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar {deleteData?.type === "section" ? "Sección" : "Paso"}?</DialogTitle>
            <DialogDescription>
              {deleteData?.type === "section" 
                ? "Se eliminarán también todos los pasos asociados a esta sección."
                : "Este mensaje se eliminará permanentemente del protocolo."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteData(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODALES CRUD */}
      <Dialog open={isNewSectionOpen} onOpenChange={setIsNewSectionOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva Sección</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Label>Título de la sección</Label>
            <Input value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} placeholder="Ej: Escenario 4" />
            <Button onClick={handleCreateSection} className="w-full">Crear Sección</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditSectionOpen} onOpenChange={setIsEditSectionOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Sección</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Label>Título de la sección</Label>
            <Input value={editSectionData.title} onChange={(e) => setEditSectionData({ ...editSectionData, title: e.target.value })} />
            <Button onClick={handleUpdateSection} className="w-full">Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewStepOpen} onOpenChange={setIsNewStepOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Agregar Paso</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Label>Etiqueta</Label>
            <Input value={newStepData.label} onChange={(e) => setNewStepData({ ...newStepData, label: e.target.value })} placeholder="Ej: Saludo" />
            <Label>Mensaje a copiar</Label>
            <textarea className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newStepData.text} onChange={(e) => setNewStepData({ ...newStepData, text: e.target.value })} />
            <Button onClick={handleCreateStep} className="w-full">Guardar Paso</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}