"use client";

import { useCreateFile } from "@/hooks/useKnowledge";
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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Link2, Upload } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type SourceType = "drive" | "upload";

interface AddFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId?: string;
}

const GOOGLE_DRIVE_URL =
  /^https:\/\/drive\.google\.com\/(file\/d\/|drive\/folders\/|open\?id=)/;

export function AddFileModal({ isOpen, onClose, folderId }: AddFileModalProps) {
  const { toast } = useToast();
  const { mutateAsync: createFile, isPending } = useCreateFile();

  const [sourceType, setSourceType] = useState<SourceType>("drive");
  const [title, setTitle] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDriveUrl("");
    setUrlError(null);
    setSourceType("drive");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateUrl = (url: string): string | null => {
    const trimmed = url.trim();
    if (!trimmed) return "El link de Google Drive es obligatorio.";
    if (!GOOGLE_DRIVE_URL.test(trimmed))
      return "Debe ser un link válido de Google Drive (drive.google.com/file/d/... o /open?id=...).";
    return null;
  };

  const handleSave = async () => {
    if (!folderId) return;

    if (!title.trim()) {
      toast({
        title: "Error de validación",
        description: "Ingresa un nombre para el archivo.",
        variant: "destructive",
      });
      return;
    }

    const error = validateUrl(driveUrl);
    if (error) {
      setUrlError(error);
      return;
    }

    setUrlError(null);

    try {
      await createFile({
        title: title.trim(),
        driveUrl: driveUrl.trim(),
        folderId,
      });
      toast({
        title: "Archivo agregado",
        description: "El archivo se agregó correctamente.",
      });
      handleClose();
    } catch (err: any) {
      toast({
        title: "Error al agregar el archivo",
        description: err?.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar archivo</DialogTitle>
          <DialogDescription>
            Enlaza un archivo alojado en Google Drive a esta carpeta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <RadioGroup
            value={sourceType}
            onValueChange={(v) => setSourceType(v as SourceType)}
            className="grid grid-cols-2 gap-3"
          >
            <label
              htmlFor="source-drive"
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                sourceType === "drive"
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <RadioGroupItem value="drive" id="source-drive" />
              <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
              Link de Drive
            </label>

            <label
              htmlFor="source-upload"
              className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-border p-3 text-sm text-muted-foreground opacity-50"
            >
              <RadioGroupItem value="upload" id="source-upload" disabled />
              <Upload className="h-4 w-4 shrink-0" />
              <span className="truncate">Subir archivo</span>
              <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wide">
                Pronto
              </span>
            </label>
          </RadioGroup>

          <div className="space-y-1.5">
            <Label htmlFor="file-title">Nombre del archivo</Label>
            <Input
              id="file-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Política de seguridad y salud en el trabajo"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="file-url">Link de Google Drive</Label>
            <Input
              id="file-url"
              value={driveUrl}
              onChange={(e) => {
                setDriveUrl(e.target.value);
                if (urlError) setUrlError(null);
              }}
              placeholder="https://drive.google.com/file/d/..."
            />
            {urlError && <p className="text-xs text-destructive">{urlError}</p>}
            <p className="text-xs text-muted-foreground">
              Asegúrate de que el archivo tenga permisos de "Cualquiera con el
              enlace puede ver".
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Agregando..." : "Agregar archivo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
