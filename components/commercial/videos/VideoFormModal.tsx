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
import { safeVideoUrl, type HotelVideo } from "@/lib/commercial-videos";

export interface VideoDraft extends HotelVideo {
  id?: string;
  revision?: number;
}

interface VideoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: VideoDraft | null;
  busy: boolean;
  onSubmit: (draft: VideoDraft) => Promise<void>;
}

const emptyDraft: VideoDraft = { title: "", description: "", url: "" };

export function VideoFormModal({
  open,
  onOpenChange,
  draft,
  busy,
  onSubmit,
}: VideoFormModalProps) {
  const [form, setForm] = useState<VideoDraft>(emptyDraft);

  useEffect(() => {
    if (open && draft) {
      setForm({ ...draft });
    } else if (open) {
      setForm(emptyDraft);
    }
  }, [open, draft]);

  const isEditing = Boolean(form.id);
  const urlValid = Boolean(safeVideoUrl(form.url));
  const canSubmit = form.title.trim().length > 0 && urlValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await onSubmit(form);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar video" : "Agregar video"}
          </DialogTitle>
          <DialogDescription>
            Completa la información del video del hotel. Se compartirá con
            clientes vía el enlace y la descripción.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="v-title">
              Nombre del hotel y destino{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="v-title"
              required
              maxLength={250}
              placeholder="Ej.: Sirenis · San Andrés"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="v-url">
              Enlace del video <span className="text-destructive">*</span>
            </Label>
            <Input
              id="v-url"
              type="url"
              maxLength={2000}
              placeholder="https://…"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
            {form.url.length > 0 && !urlValid && (
              <p className="text-xs text-destructive">
                Usa un enlace HTTPS válido.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="v-description">Descripción para compartir</Label>
            <Textarea
              id="v-description"
              rows={6}
              maxLength={20000}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe el hotel y el video para que el cliente sepa qué verá."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={busy || !canSubmit}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Guardar video"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}