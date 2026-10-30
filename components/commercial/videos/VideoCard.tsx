"use client";

import { ExternalLink, Copy, Video, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface VideoEntry {
  id: string;
  revision: number;
  source?: string;
  title: string;
  description: string;
  url: string;
}

interface VideoCardProps {
  entry: VideoEntry;
  canEdit: boolean;
  busy: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onCopyUrl: () => void;
  onCopyMessage: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function VideoCard({
  entry,
  canEdit,
  busy,
  expanded,
  onToggleExpand,
  onCopyUrl,
  onCopyMessage,
  onEdit,
  onDelete,
}: VideoCardProps) {
  let hostname = "";
  try {
    hostname = new URL(entry.url).hostname.replace(/^www\./, "");
  } catch {
    hostname = "Enlace";
  }

  const isFromDrive = entry.source === "drive";

  return (
    <article className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <Badge variant="secondary" className="w-fit gap-1">
        <Video className="h-3 w-3" />
        {hostname}
      </Badge>

      <h3 className="font-semibold leading-tight">{entry.title}</h3>

      <p
        className={`whitespace-pre-wrap break-words text-sm text-muted-foreground ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {entry.description || "Sin descripción."}
      </p>

      {entry.description.length > 150 && (
        <Button
          variant="link"
          size="sm"
          onClick={onToggleExpand}
          className="h-auto w-fit p-0 text-xs"
        >
          {expanded ? "Ver menos" : "Ver descripción completa"}
          <ChevronDown
            className={`ml-1 h-3 w-3 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </Button>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <Button size="sm" asChild>
          <a href={entry.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            Abrir video
          </a>
        </Button>
        <Button size="sm" variant="outline" onClick={onCopyUrl}>
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          Enlace
        </Button>
        <Button size="sm" variant="outline" onClick={onCopyMessage}>
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          Mensaje
        </Button>

        {canEdit && !isFromDrive && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              disabled={busy}
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              disabled={busy}
              className="text-destructive hover:text-destructive"
            >
              Eliminar
            </Button>
          </>
        )}
      </div>
    </article>
  );
}