"use client";

import { useEffect, useRef, useState } from "react";
import { commercialRequest } from "@/lib/commercial/request";
import { TableSource } from "./TableSource";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {NotebookText,Users, Plus, AlertCircle, UploadCloud, Loader2 } from "lucide-react";
import { CreateTableModal } from "./CreateTableModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function DriveTables() {
  const [tables, setTables] = useState<{ slug: string; title: string }[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  // Estados para el modal de importar
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importTarget, setImportTarget] = useState("");
  const [fileToImport, setFileToImport] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTables = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await commercialRequest("/api/commercial/rates?path=list");
      if (!res.ok) throw new Error("Error al cargar las tablas");
      const data = await res.json();
      setTables(data);
      if (data.length > 0 && !activeTab) setActiveTab(data[0].slug);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTables();
  }, []);

  // 1. Seleccionar archivo
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileToImport(file);
    setImportTarget(activeTab || ""); // Por defecto la tabla que está abierta
    setIsImportOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // 2. Procesar importación
  async function processImport() {
    if (!fileToImport || !importTarget) {
      return toast.error("Selecciona un archivo y una tabla de destino.");
    }
    setImporting(true);
    const toastId = toast.loading(`Importando a ${importTarget}...`);

    try {
      const formData = new FormData();
      
      formData.append("file", fileToImport);
      const res = await commercialRequest(
        `/api/commercial/rates?path=import&source=${importTarget}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) throw new Error("Error al importar el archivo");

      toast.success("Tabla importada correctamente", { id: toastId });
      setIsImportOpen(false);
      setFileToImport(null);
      void loadTables();
    } catch (err: any) {
      toast.error(err.message || "No se pudo importar", { id: toastId });
    } finally {
      setImporting(false);
    }
  }

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Cargando tablas...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-destructive border border-destructive/20 bg-destructive/10 rounded-lg m-4">
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        <p>{error}</p>
        <Button variant="outline" onClick={() => loadTables()} className="mt-4">
          Reintentar
        </Button>
      </div>
    );

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <NotebookText className="h-6 w-6 text-white" />
            Tarifas y Planes
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las tablas cargadas en la base de datos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
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
            )}
            Importar Excel
          </Button>

          <CreateTableModal onCreated={loadTables} />
        </div>
      </div>

      {/* Modal de Importación (Reemplaza el prompt) */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar archivo Excel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label>Archivo seleccionado</Label>
              <div className="p-2 border rounded-md bg-muted/50 text-sm">
                {fileToImport?.name}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>¿A qué tabla quieres importar los datos?</Label>
              <select
                value={importTarget}
                onChange={(e) => setImportTarget(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  Selecciona la tabla de destino
                </option>
                {tables.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.title} ({t.slug})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground">
                Ojo: Los datos actuales de esa tabla serán reemplazados por el
                contenido del Excel.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsImportOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={processImport}
                disabled={importing || !importTarget}
              >
                {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
                Importar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {tables.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 border border-dashed rounded-lg">
          <h3 className="text-lg font-medium">No hay tablas creadas</h3>
          <p className="text-sm text-muted-foreground">
            Crea una nueva tabla o importa un Excel.
          </p>
        </div>
      ) : (
        <>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4 flex-wrap h-auto">
              {tables.map((t) => (
                <TabsTrigger key={t.slug} value={t.slug}>
                  {t.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {activeTab && <TableSource sourceKey={activeTab} />}
        </>
      )}
    </div>
  );
}
