"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateForm } from "@/hooks/useForms";
import { api } from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { Link2, Upload } from "lucide-react";
import { useState } from "react";

type FormCategory = "General";
type SourceType = "embedded" | "upload";

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GOOGLE_FORMS_VIEWFORM =
  /^https:\/\/docs\.google\.com\/forms\/d\/e\/[a-zA-Z0-9_-]+\/viewform/;
const GOOGLE_FORMS_EDIT =
  /^https:\/\/docs\.google\.com\/forms\/d\/[a-zA-Z0-9_-]+\/edit/;

export default function CreateFormModal({
  isOpen,
  onClose,
}: CreateFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [sourceType, setSourceType] = useState<SourceType>("embedded");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FormCategory>("General");
  const [embedUrl, setEmbedUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  // const [isSaving, setIsSaving] = useState(false);

  const { mutateAsync: createForm, isPending: isSaving } = useCreateForm();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("General");
    setEmbedUrl("");
    setUrlError(null);
    setSourceType("embedded");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateUrl = (url: string): string | null => {
    const trimmed = url.trim();
    if (!trimmed) return "La URL es obligatoria.";
    if (GOOGLE_FORMS_EDIT.test(trimmed)) {
      return "Ese es el link de edición. Usa el botón «Enviar» → ícono de link en Google Forms para obtener el link de compartir.";
    }

    if (!GOOGLE_FORMS_VIEWFORM.test(trimmed)) {
      return "Debe ser un link válido de Google Forms (docs.google.com/forms/d/e/.../viewform).";
    }

    return null;
  };

  const buildEmbedUrl = (url: string) => {
    const trimmed = url.trim();
    if (trimmed.includes("embedded=true")) return trimmed;
    const separator = trimmed.includes("?") ? "&" : "?";
    return `${trimmed}${separator}embedded=true`;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Error de validación",
        description: "Ingresa un título para el formulario.",
        variant: "destructive",
      });

      return;
    }

    const error = validateUrl(embedUrl);
    if (error) {
      setUrlError(error);
      return;
    }

    setUrlError(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        type: "GOOGLE_FORM",
        embedUrl: buildEmbedUrl(embedUrl),
      };

      await createForm(payload);

      toast({
        title: "Formulario creado",
        description: "El formulario se agregó correctamente.",
      });
      handleClose();
    } catch (err: any) {
      toast({
        title: "Error al guardar",
        description:
          err?.message ||
          "Ocurrió un error inesperado al guardar el formulario.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo formulario</DialogTitle>
          <DialogDescription>
            Embebe un formulario de Google Forms, o sube un archivo
            (próximamente).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Selector de origen */}
          <RadioGroup
            value={sourceType}
            onValueChange={(v) => setSourceType(v as SourceType)}
            className="grid grid-cols-2 gap-3"
          >
            <label
              htmlFor="source-embedded"
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                sourceType === "embedded"
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <RadioGroupItem value="embedded" id="source-embedded" />
              <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
              Google Forms
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

          {/* Título */}
          <div className="space-y-1.5">
            <Label htmlFor="form-title">Título</Label>
            <Input
              id="form-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Encuesta de clima laboral"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="form-description">Descripción</Label>
            <Textarea
              id="form-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción del formulario"
              className="min-h-[70px] resize-none"
            />
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <Label htmlFor="form-category">Categoría</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as FormCategory)}
            >
              <SelectTrigger id="form-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Link de Google Forms */}
          {sourceType === "embedded" && (
            <div className="space-y-1.5">
              <Label htmlFor="form-url">Link de Google Forms</Label>
              <Input
                id="form-url"
                value={embedUrl}
                onChange={(e) => {
                  setEmbedUrl(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                placeholder="https://docs.google.com/forms/d/e/.../viewform"
              />
              {urlError && (
                <p className="text-xs text-destructive">{urlError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Usa el link para compartir (Enviar → ícono de link), no el de
                edición.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Crear formulario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
