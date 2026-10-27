"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KIND_LIST, KIND_META } from "../constants";
import { resourceInput } from "@/lib/commercial/validation";
import type {
  CommercialResource,
  ResourceInput,
  ResourceKind,
} from "@/types/commercial.types";

const emptyForm = (kind: ResourceKind): ResourceInput => ({
  kind,
  title: "",
  text: "",
  url: "",
  category: "",
  origin: "",
});

interface ResourceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: ResourceKind;
  editing: CommercialResource | null;
  onSubmit: (input: ResourceInput) => Promise<void>;
  isSubmitting: boolean;
}

export function ResourceFormModal({
  open,
  onOpenChange,
  kind,
  editing,
  onSubmit,
  isSubmitting,
}: ResourceFormModalProps) {
  const [form, setForm] = useState<ResourceInput>(emptyForm(kind));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    if (editing) {
      setForm({
        kind: editing.kind,
        title: editing.title,
        text: editing.text,
        url: editing.url,
        category: editing.category,
        origin: editing.origin,
      });
    } else {
      setForm(emptyForm(kind));
    }
  }, [open, editing, kind]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = resourceInput.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    try {
      await onSubmit(parsed.data);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar recurso" : "Nuevo recurso"}
          </DialogTitle>
          <DialogDescription>
            Completa la información. Los datos quedan disponibles para todo el
            equipo comercial.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="kind">Tipo</Label>
              <Select
                value={form.kind}
                onValueChange={(v) =>
                  setForm({ ...form, kind: v as ResourceKind })
                }
              >
                <SelectTrigger id="kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KIND_LIST.map((k) => (
                    <SelectItem key={k} value={k}>
                      {KIND_META[k].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                maxLength={120}
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                placeholder="Atención, playa…"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              required
              maxLength={250}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Un título fácil de encontrar"
            />
          </div>

          {form.kind === "offer" && (
            <div className="space-y-1.5">
              <Label htmlFor="origin">Ciudad de salida</Label>
              <Input
                id="origin"
                maxLength={80}
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                placeholder="Medellín, Bogotá…"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="text">Contenido</Label>
            <Textarea
              id="text"
              rows={6}
              maxLength={20000}
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="Incluye vigencia, condiciones y contexto útil. No guardes datos sensibles."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="url">Enlace a la fuente</Label>
            <Input
              id="url"
              type="url"
              maxLength={2000}
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://…"
            />
          </div>

          {error && (
            <p className="rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Guardar cambios" : "Crear recurso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}