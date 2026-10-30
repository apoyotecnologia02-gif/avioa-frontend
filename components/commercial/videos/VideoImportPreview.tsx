"use client";

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
import type { HotelVideo } from "@/lib/commercial-videos";

interface ImportPreview {
  entries: HotelVideo[];
  issues: string[];
  duplicates: number;
}

interface VideoImportPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: ImportPreview | null;
  busy: boolean;
  onConfirm: () => Promise<void>;
}

export function VideoImportPreview({
  open,
  onOpenChange,
  preview,
  busy,
  onConfirm,
}: VideoImportPreviewProps) {
  if (!preview) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Revisar importación · {preview.entries.length} videos
          </DialogTitle>
          <DialogDescription>
            {preview.duplicates > 0 &&
              `${preview.duplicates} duplicados del archivo omitidos. `}
            Si un hotel tiene varios enlaces, se conserva un registro por
            enlace.
          </DialogDescription>
        </DialogHeader>

        {preview.issues.length > 0 && (
          <details className="rounded-md bg-amber-50 p-3 text-sm dark:bg-amber-900/20">
            <summary className="cursor-pointer font-medium text-amber-800 dark:text-amber-300">
              {preview.issues.length} filas por revisar
            </summary>
            <ul className="mt-2 list-inside list-disc space-y-1 text-amber-700 dark:text-amber-400">
              {preview.issues.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </details>
        )}

        <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border border-border p-3">
          {preview.entries.map((e, i) => (
            <details
              key={i}
              className="rounded-md border border-border/50 p-2"
            >
              <summary className="cursor-pointer text-sm font-medium">
                {e.title}
              </summary>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p className="whitespace-pre-wrap">{e.description}</p>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Revisar enlace ↗
                </a>
              </div>
            </details>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button onClick={() => void onConfirm()} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar importación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}