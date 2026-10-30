"use client";

import {
  Copy,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KIND_META } from "../constants";
import type { CommercialResource } from "@/types/commercial.types";

interface ResourceCardProps {
  resource: CommercialResource;
  canUpdate: boolean;
  canDelete: boolean;
  onView: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ResourceCard({
  resource,
  canUpdate,
  canDelete,
  onView,
  onCopy,
  onEdit,
  onDelete,
}: ResourceCardProps) {
  const meta = KIND_META[resource.kind];
  const Icon = meta.icon;

  return (
    <article className="group flex flex-col rounded-lg border border-border bg-card transition-colors hover:border-border/80">
      <div className="flex items-start justify-between gap-2 border-b border-border/50 p-4">
        <div className="flex items-start gap-3">
          <span className="rounded-md bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {meta.label}
              {resource.example && (
                <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold normal-case text-amber-800">
                  Ejemplo
                </span>
              )}
            </p>
            <h3 className="mt-1 truncate text-base font-semibold">
              {resource.title}
            </h3>
            {resource.origin && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {resource.origin}
              </p>
            )}
          </div>
        </div>

        {!resource.example && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canUpdate && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex-1 p-4">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {resource.text || "Sin descripción."}
        </p>
        {resource.category && (
          <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {resource.category}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border/50 p-3">
        <Button variant="ghost" size="sm" onClick={onView}>
          Ver detalle
        </Button>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onCopy}
            aria-label="Copiar"
          >
            <Copy className="h-4 w-4" />
          </Button>
          {resource.url && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              asChild
              aria-label="Abrir fuente"
            >
              <a href={resource.url} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}