"use client";

import { useCallback, useRef, useState } from "react";
import {
  AlertCircle,
  Copy,
  Loader2,
  Search,
  UploadCloud,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { commercialRequest } from "@/lib/commercial/request";
import { copyCommercialText } from "@/lib/commercial/clipboard";
import { useRefreshableEffect } from "@/lib/commercial/refresh";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const COLUMNS = [
  { key: "destination", label: "DESTINO" },
  { key: "hotel", label: "HOTEL" },
  { key: "date", label: "FECHA" },
  { key: "mealPlan", label: "ALIMENTACIÓN" },
  { key: "singleRate", label: "SENCILLA" },
  { key: "doubleAdult", label: "DOBLE · TARIFA ADULTO" },
  { key: "doubleChild", label: "TARIFA NIÑOS (DOBLE)" },
  { key: "multipleAdult", label: "MULTIPLE · TARIFA ADULTO" },
  { key: "multipleChild", label: "TARIFA NIÑOS (MULTIPLE)" },
  { key: "childAge", label: "EDAD NIÑOS" },
];

export function TableSource({ sourceKey }: { sourceKey: string }) {
  const [data, setData] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  
  const [isAddRowOpen, setIsAddRowOpen] = useState(false);
  const [newRow, setNewRow] = useState<Record<string, string>>({});
  const [savingRow, setSavingRow] = useState(false);
  
  // Estado para el modal de eliminar
  const [rowToDelete, setRowToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setBusy(true);
    setError("");
    try {
      const r = await commercialRequest(`/api/commercial/rates?path=${sourceKey}`, { cache: "no-store", signal });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Error al cargar");
      setData(d);
    } catch (e) {
      if (!signal?.aborted) setError((e as Error).message);
    } finally {
      if (!signal?.aborted) setBusy(false);
    }
  }, [sourceKey]);

  useRefreshableEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);

  async function handleSaveRow() {
    if (!data?.id) return;
    setSavingRow(true);
    try {
      const res = await commercialRequest(`/api/commercial/rates?path=${data.id}/rows`, {
        method: "POST",
        body: JSON.stringify(newRow),
      });
      if (!res.ok) throw new Error("Error al guardar");
      toast.success("Fila agregada");
      setIsAddRowOpen(false);
      setNewRow({});
      void load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingRow(false);
    }
  }

  async function confirmDeleteRow() {
    if (!data?.id || rowToDelete === null) return;
    setDeleting(true);
    try {
      const res = await commercialRequest(`/api/commercial/rates?path=${data.id}/rows/${rowToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      toast.success("Fila eliminada");
      setRowToDelete(null);
      void load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  // Función para copiar toda la fila
  async function copyRow(row: any) {
    const text = COLUMNS.map(c => `${c.label}: ${row[c.key] || ""}`).join("\n");
    try {
      await copyCommercialText(text);
      toast.success("Fila copiada al portapapeles");
    } catch {
      toast.error("No se pudo copiar");
    }
  }

  const filteredRows = (data?.rows || []).filter((row: any) => {
    if (!query) return true;
    const text = Object.values(row).join(" ").toLowerCase();
    return text.includes(query.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button onClick={() => setIsAddRowOpen(true)} disabled={!data?.id}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Fila
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label>Buscar...</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filtrar..." className="pl-9" />
        </div>
      </div>

      {/* Modal Agregar Fila */}
      <Dialog open={isAddRowOpen} onOpenChange={setIsAddRowOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Agregar nueva tarifa</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 pt-4 max-h-[60vh] overflow-y-auto pr-2">
            {COLUMNS.map(col => (
              <div key={col.key} className="space-y-1">
                <Label className="text-xs uppercase">{col.label}</Label>
                <Input 
                  value={newRow[col.key] || ""} 
                  onChange={e => setNewRow({ ...newRow, [col.key]: e.target.value })} 
                  placeholder={col.label}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddRowOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveRow} disabled={savingRow}>
              {savingRow && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar Fila */}
      <Dialog open={rowToDelete !== null} onOpenChange={(open) => !open && setRowToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar esta fila?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer y eliminará la tarifa de la base de datos.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setRowToDelete(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDeleteRow} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-2 py-3 text-[10px] uppercase text-center w-[5%]">Fila</th>
              {COLUMNS.map(c => <th key={c.key} className="px-2 py-3 text-[10px] uppercase text-center w-auto">{c.label}</th>)}
              <th className="px-2 py-3 text-[10px] uppercase text-center w-[100px]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRows.map((r: any) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-2 py-2 text-center text-xs text-muted-foreground">{r.rowIndex}</td>
                {COLUMNS.map(c => <td key={c.key} className="px-2 py-2 text-center text-xs whitespace-normal break-words">{r[c.key]}</td>)}
                <td className="px-2 py-2">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyRow(r)} title="Copiar fila">
                      <Copy className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRowToDelete(r.rowIndex)} title="Eliminar fila">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}