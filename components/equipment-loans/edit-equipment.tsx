"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EquipmentCategory,
  EquipmentStatus,
} from "@/types/equipment-loan.types";

const categoryLabels: Record<EquipmentCategory, string> = {
  [EquipmentCategory.LAPTOP]: "Laptop",
  [EquipmentCategory.CELLPHONE]: "Teléfono",
  [EquipmentCategory.KEYBOARD]: "Teclado",
  [EquipmentCategory.MOUSE]: "Mouse",
  [EquipmentCategory.HEADPHONES]: "Audífonos",
  [EquipmentCategory.MONITOR]: "Monitor",
  [EquipmentCategory.PRINTER]: "Impresora",
  [EquipmentCategory.PROJECTOR]: "Proyector",
  [EquipmentCategory.PC]: "PC de escritorio",
  [EquipmentCategory.OTHER]: "Otro",
};

const statusLabels: Record<EquipmentStatus, string> = {
  [EquipmentStatus.AVAILABLE]: "Disponible",
  [EquipmentStatus.LOANED]: "En préstamo",
  [EquipmentStatus.MAINTENANCE]: "Mantenimiento",
  [EquipmentStatus.DAMAGED]: "Dañado",
};

interface EditEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: any | null;
  locations: any[];
  onSubmit: (data: any) => void;
  isPending: boolean;
}

export function EditEquipmentDialog({
  open,
  onOpenChange,
  equipment,
  locations,
  onSubmit,
  isPending,
}: EditEquipmentDialogProps) {
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [category, setCategory] = useState<EquipmentCategory | "">("");
  const [status, setStatus] = useState<EquipmentStatus | "">("");
  const [locationId, setLocationId] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (equipment && open) {
      setName(equipment.name || "");
      setSerialNumber(equipment.serialNumber || "");
      setCategory(equipment.category || "");
      setStatus(equipment.status || "");
      setLocationId(equipment.locationId || "");
      setDescription(equipment.description || "");
    }
  }, [equipment, open]);

  const handleSubmit = () => {
    if (!name.trim() || !category) return;

    const payload: any = {
      name: name.trim(),
      category,
      status,
    };

    if (serialNumber.trim()) payload.serialNumber = serialNumber.trim();
    if (locationId) payload.locationId = locationId;
    if (description.trim()) payload.description = description.trim();

    onSubmit(payload);
  };

  const isFormValid = name.trim().length > 0 && category !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Equipo</DialogTitle>
          <DialogDescription>
            Modifica los datos del equipo seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre del Equipo *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Laptop HP"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-serialNumber">Número de Serie</Label>
            <Input
              id="edit-serialNumber"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Número de serie del equipo"
            />
          </div>

          <div className="space-y-2 min-w-0">
            <Label htmlFor="edit-category">Categoría *</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as EquipmentCategory)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)]">
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 min-w-0">
            <Label htmlFor="edit-status">Estado *</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as EquipmentStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)]">
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 min-w-0">
            <Label htmlFor="edit-location">Ubicación</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una ubicación" />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)]">
                {locations?.map((location: any) => (
                  <SelectItem
                    key={location.locationId}
                    value={location.locationId}
                  >
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción adicional del equipo"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !isFormValid}
          >
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}