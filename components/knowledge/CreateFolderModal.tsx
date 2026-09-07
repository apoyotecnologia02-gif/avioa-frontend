"use client";

import { useCreateFolder } from "@/hooks/useKnowledge";
import { useToast } from "../ui/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string;
}

export function CreateFolderModal({
  isOpen,
  onClose,
  parentId,
}: CreateFolderModalProps) {
  const { toast } = useToast();
  const { mutateAsync: createFolder, isPending } = useCreateFolder();
  const [name, setName] = useState("");

  const handleClose = () => {
    setName("");
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error de validación",
        description: "Ingresa un nombre para la carpeta.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createFolder({ name: name.trim(), parentId });
      toast({
        title: "Carpeta creada",
        description: "La carpeta se creó correctamente.",
      });
      handleClose();
    } catch (err: any) {
      toast({
        title: "Error al crear la carpeta",
        description: err?.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nueva carpeta</DialogTitle>
          <DialogDescription>
            {parentId
              ? "Se creará dentro de la carpeta actual."
              : "Se creará en la raíz de la biblioteca."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5 py-2">
          <Label htmlFor="folder-name">Nombre</Label>
          <Input
            id="folder-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Manual de convivencia"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Creando..." : "Crear carpeta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
