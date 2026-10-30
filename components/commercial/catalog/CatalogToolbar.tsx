"use client";

import { Plus, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KIND_META } from "../constants";
import type { ResourceKind } from "@/types/commercial.types";

interface CatalogToolbarProps {
  kind: ResourceKind;
  query: string;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onCreate: () => void;
  canCreate: boolean;
  isRefreshing: boolean;
}

export function CatalogToolbar({
  kind,
  query,
  onQueryChange,
  onRefresh,
  onCreate,
  canCreate,
  isRefreshing,
}: CatalogToolbarProps) {
  const meta = KIND_META[kind];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={meta.searchPlaceholder}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
        {canCreate && (
          <Button size="sm" onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo recurso
          </Button>
        )}
      </div>
    </div>
  );
}