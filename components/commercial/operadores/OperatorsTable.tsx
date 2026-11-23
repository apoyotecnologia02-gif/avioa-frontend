"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Copy, 
  Trash2, 
  Plus, 
  Loader2, 
  UploadCloud, 
  ExternalLink,
  Link2,
  Bus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { copyCommercialText } from "@/lib/commercial/clipboard";
import { useCommercialOperators, useCreateOperator, useDeleteOperator } from "@/hooks/useCommercialOperators";
import { commercialRequest } from "@/lib/commercial/request";

function safeLink(value: string): string {
  try {
    const u = new URL(value);
    return ["https:", "http:"].includes(u.protocol) && !u.username && !u.password ? u.href : "";
  } catch {
    return "";
  }
}

const ITEMS_PER_PAGE = 24;

export function OperatorsTable() {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newOperator, setNewOperator] = useState({ category: "", destination: "", operator: "", raw: "" });

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importCategory, setImportCategory] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const { data: entries = [], isLoading, error } = useCommercialOperators();
  const createMutation = useCreateOperator();
  const deleteMutation = useDeleteOperator();

  const filtered = entries.filter((e: any) => {
    if (!query) return true;
    const text = [e.destination, e.operator, e.category, e.raw].join(" ").toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  async function copy(text: string) {
    try {
      await copyCommercialText(text);
      toast.success("Copiado");
    } catch {
      toast.error("No se pudo copiar.");
    }
  }

  async function handleSaveManual() {
    if (!newOperator.destination.trim() || !newOperator.operator.trim()) {
      return toast.error("Destino y Operador son obligatorios.");
    }
    try {
      await createMutation.mutateAsync(newOperator);
      toast.success("Operador agregado");
      setIsAddOpen(false);
      setNewOperator({ category: "", destination: "", operator: "", raw: "" });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleImportExcel() {
    if (!importFile) return toast.error("Selecciona un archivo primero.");
    
    setIsImporting(true);
    const toastId = toast.loading("Importando operadores...");
    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const res = await commercialRequest(`/api/commercial/operators?path=import&category=${encodeURIComponent(importCategory)}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al importar");
      }

      toast.success("Operadores importados con éxito", { id: toastId });
      setIsImportOpen(false);
      setImportFile(null);
      setImportCategory("");
      window.location.reload(); 
    } catch (err: any) {
      toast.error(err.message || "No se pudo importar", { id: toastId });
    } finally {
      setIsImporting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("¿Eliminar este operador?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Operador eliminado");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando operadores...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error al cargar operadores.</div>;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bus className="h-6 w-6" />
            Directorio de Operadores
          </h1>
          <p className="text-muted-foreground mt-1">
            Consulta y gestiona los enlaces de acceso a los diferentes operadores.
          </p>
        </div>
      </div>

      {/* ACCIONES Y BUSCADOR */}
      <div className="flex flex-wrap items-end justify-between gap-4 bg-muted/30 p-3 rounded-lg border border-border">
        <div className="flex-1 min-w-[200px]">
          <Label>Buscar operador o destino</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe para filtrar…"
              className="pl-9 bg-background"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <UploadCloud className="mr-2 h-4 w-4" /> Importar Excel
          </Button>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Operador
          </Button>
        </div>
      </div>

      {/* MODALES */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Agregar Operador</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1">
              <Label>Categoría (opcional)</Label>
              <Input value={newOperator.category} onChange={e => setNewOperator({...newOperator, category: e.target.value})} placeholder="Ej: Hotel, Traslado" />
            </div>
            <div className="space-y-1">
              <Label>Destino *</Label>
              <Input value={newOperator.destination} onChange={e => setNewOperator({...newOperator, destination: e.target.value})} placeholder="Ej: Punta Cana" />
            </div>
            <div className="space-y-1">
              <Label>Operador *</Label>
              <Input value={newOperator.operator} onChange={e => setNewOperator({...newOperator, operator: e.target.value})} placeholder="Ej: Hoteldo" />
            </div>
            <div className="space-y-1">
              <Label>Enlace o texto</Label>
              <Input value={newOperator.raw} onChange={e => setNewOperator({...newOperator, raw: e.target.value})} placeholder="https://..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveManual} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Importar Operadores desde Excel</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1">
              <Label>Archivo Excel (.xlsx, .xls, .csv)</Label>
              <Input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
              <p className="text-[10px] text-muted-foreground">El archivo debe tener columnas: DESTINO, OPERADOR, LINK.</p>
            </div>
            <div className="space-y-1">
              <Label>Categoría (opcional)</Label>
              <Input value={importCategory} onChange={e => setImportCategory(e.target.value)} placeholder="Si la dejas vacía, se guardarán como 'General'" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancelar</Button>
              <Button onClick={handleImportExcel} disabled={isImporting || !importFile}>
                {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Importar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* LISTA DE OPERADORES */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 py-16 text-center">
          <Search className="h-8 w-8 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">No hay operadores</h3>
          <p className="max-w-sm text-sm text-muted-foreground">Agrega uno nuevo o ajusta la búsqueda.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentItems.map((e: any) => {
              const link = safeLink(e.raw);
              return (
                <article key={e.id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition-colors">
                  <div>
                    <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {e.category || "General"}
                    </span>
                    <h3 className="font-semibold text-lg mt-2 leading-tight line-clamp-2">{e.destination || e.operator}</h3>
                    {e.destination && e.operator && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{e.operator}</p>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-2 space-y-3">
                    {link ? (
                      <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline break-all line-clamp-2" title={link}>
                        <Link2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{link}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ) : (
                      <p className="text-xs text-muted-foreground break-words line-clamp-2">
                        {e.raw || "Sin enlace registrado"}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => void copy(e.raw)}>
                        <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar enlace
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive px-2" onClick={() => handleDelete(e.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* PAGINADOR (Abajo y centrado) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-6"
              >
                Anterior
              </Button>
              
              <span className="text-sm font-medium text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-6"
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}