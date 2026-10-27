"use client";

import { Copy, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KIND_META } from "../constants";
import type { CommercialResource } from "@/types/commercial.types";

interface ResourceDetailModalProps {
  resource: CommercialResource | null;
  onOpenChange: (open: boolean) => void;
  onCopy: (text: string) => void;
}

export function ResourceDetailModal({
  resource,
  onOpenChange,
  onCopy,
}: ResourceDetailModalProps) {
  if (!resource) return null;
  const meta = KIND_META[resource.kind];
  const Icon = meta.icon;

  const fullText = `${resource.title}\n\n${resource.text}${
    resource.url ? `\n\n${resource.url}` : ""
  }`;

  return (
    <Dialog open={!!resource} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Icon className="h-4 w-4" />
            {meta.label}
            {resource.example && " · Ejemplo"}
          </div>
          <DialogTitle className="text-xl">{resource.title}</DialogTitle>
        </DialogHeader>

        {resource.category && (
          <span className="inline-block w-fit rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            {resource.category}
          </span>
        )}

        <div className="whitespace-pre-wrap break-words text-sm text-foreground">
          {resource.text || "Sin contenido."}
        </div>

        {resource.url && (
          <Button variant="outline" asChild className="w-fit">
            <a href={resource.url} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir fuente
            </a>
          </Button>
        )}

        <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          {resource.example
            ? "Contenido ilustrativo. No representa disponibilidad ni condiciones verificadas."
            : "Revisa vigencia y condiciones en la fuente antes de compartir."}
        </div>

        <Button onClick={() => onCopy(fullText)}>
          <Copy className="mr-2 h-4 w-4" />
          Copiar texto
        </Button>
      </DialogContent>
    </Dialog>
  );
}