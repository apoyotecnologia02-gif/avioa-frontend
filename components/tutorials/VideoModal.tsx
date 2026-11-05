"use client";

import { getDriveEmbedUrl, Tutorial } from "@/lib/tutorials/drive";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface Props {
  tutorial: Tutorial | null;
  onClose: () => void;
}

export function VideoModal({ tutorial, onClose }: Props) {
  if (!tutorial) return null;

  return (
    <Dialog open={!!tutorial} onOpenChange={(open) => !open && onClose()}>
      {/* [&>button]:hidden oculta la X por defecto de shadcn que se superpone al iframe */}
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-background border-border/50 gap-0 sm:rounded-2xl shadow-2xl [&>button]:hidden">
        <DialogTitle className="sr-only">{tutorial.title}</DialogTitle>

        {/* Reproductor */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9.5] bg-black flex items-center justify-center overflow-hidden">
          <iframe
            src={getDriveEmbedUrl(tutorial.driveUrl)}
            className="absolute inset-0 w-full h-full border-0 z-0"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          />
        </div>

        {/* Información y botón de cierre */}
        <div className="p-6 md:p-8 flex items-start justify-between gap-6">
          <div className="flex-1">
            <Badge variant="secondary" className="mb-3">
              {tutorial.category}
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {tutorial.title}
            </h2>
            {tutorial.description && (
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {tutorial.description}
              </p>
            )}
          </div>

          {/* Botón de cerrar en la zona segura */}
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground mt-1"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
