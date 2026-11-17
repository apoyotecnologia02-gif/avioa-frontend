// components/commercial/drive-tables/CreateTableModal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { commercialRequest } from "@/lib/commercial/request";
import { toast } from "sonner";

// Las columnas fijas que nos confirmaron
const DEFAULT_COLUMNS = [
  "DESTINO", "HOTEL", "FECHA", "ALIMENTACIÓN", "SENCILLA", 
  "DOBLE · TARIFA ADULTO", "TARIFA NIÑOS (DOBLE)", 
  "MULTIPLE · TARIFA ADULTO", "TARIFA NIÑOS (MULTIPLE)", "EDAD NIÑOS"
];

export function CreateTableModal({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!title.trim()) return toast.error("El título es obligatorio");
    
    // Generamos el slug automáticamente (ej: "ALTA 2027" -> "alta-2027")
    const slug = title.toLowerCase().trim().replace(/\s+/g, '-');
    
    // Extraemos el año (si lo hay) o usamos el actual
    const yearMatch = title.match(/\d{4}/);
    const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
    
    // Extraemos el tipo (ALTA o BAJA)
    const type = title.toUpperCase().includes("BAJA") ? "BAJA" : "ALTA";

    setSaving(true);
    try {
      const res = await commercialRequest('/api/commercial/rates?path=create', {
        method: 'POST',
        body: JSON.stringify({ 
          title, 
          slug, 
          year, 
          type,
          // Enviamos las columnas fijas por si acaso el backend las necesita
          headers: DEFAULT_COLUMNS 
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Error al crear");
      }
      
      toast.success("Tabla creada correctamente");
      setOpen(false);
      setTitle("");
      onCreated(); 
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Nueva Tabla
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nueva Tabla de Tarifas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label>Nombre de la tabla</Label>
            <Input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Ej: ALTA 2027" 
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              El sistema detectará automáticamente el año y el tipo (Alta/Baja).
            </p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-md border border-border">
            <p className="text-xs font-medium mb-2">Columnas por defecto:</p>
            <div className="flex flex-wrap gap-1">
              {DEFAULT_COLUMNS.map(c => (
                <span key={c} className="text-[9px] bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                  {c}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Estas columnas se crearán automáticamente. Si necesitas agregar o quitar columnas, avísale al equipo de desarrollo.
            </p>
          </div>

          <Button onClick={handleCreate} className="w-full" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Crear Tabla
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}