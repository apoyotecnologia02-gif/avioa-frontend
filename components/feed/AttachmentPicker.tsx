"use client";

import { PendingAttachment } from "@/hooks/useAttachmentUpload";
import { FILE_MIME, formatBytes, IMAGE_MIME } from "@/lib/feed-attachments";
import { useRef } from "react";
import { Button } from "../ui/button";
import { FileIcon, ImagePlus, Loader2, Paperclip, X } from "lucide-react";

interface Props {
  items: PendingAttachment[];
  onAdd: (files: FileList | File[]) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function AttachmentPicker({ items, onAdd, onRemove, disabled }: Props) {
  const imageInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-1">
        <input
          ref={imageInput}
          type="file"
          accept={IMAGE_MIME.join(",")}
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) onAdd(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={fileInput}
          type="file"
          accept={FILE_MIME.join(",")}
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) onAdd(e.target.files);
            e.target.value = "";
          }}
        />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => imageInput.current?.click()}
          className="h-9 gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
          title="Agregar imagen"
        >
          <ImagePlus className="h-4 w-4" />
          <span className="hidden sm:inline">Imagen</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => fileInput.current?.click()}
          className="h-9 gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
          title="Adjuntar archivo"
        >
          <Paperclip className="h-4 w-4" />
          <span className="hidden sm:inline">Archivo</span>
        </Button>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.id}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-muted/30"
            >
              {it.type === "IMAGE" && it.previewUrl ? (
                <img
                  src={it.previewUrl}
                  alt={it.file.name}
                  className="h-24 w-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-full flex-col items-center justify-center gap-1 p-2 text-center">
                  <FileIcon className="h-6 w-6 text-muted-foreground" />
                  <p className="line-clamp-2 text-[11px] font-medium leading-tight">
                    {it.file.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatBytes(it.file.size)}
                  </p>
                </div>
              )}

              {it.status === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/70 backdrop-blur-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-[10px] font-medium">
                    {it.progress}%
                  </span>
                </div>
              )}

              {it.status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 p-2 text-center text-[10px] font-medium text-destructive">
                  {it.error ?? "Error"}
                </div>
              )}

              <button
                type="button"
                onClick={() => onRemove(it.id)}
                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
                title="Quitar"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
