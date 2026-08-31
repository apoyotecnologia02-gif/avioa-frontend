"use client";

import { Star, Folder, Tag, Trash2, Shield, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { VaultCategory } from "@/hooks/useVaultCategories";
import { VaultTag } from "@/hooks/useVaultTags";

export type VaultFilterSelection =
  | { type: "all" }
  | { type: "favorites" }
  | { type: "category"; id: string }
  | { type: "tag"; id: string };

interface VaultSidebarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categories: VaultCategory[];
  tags: VaultTag[];
  selection: VaultFilterSelection;
  onSelectionChange: (selection: VaultFilterSelection) => void;
}

function NavRow({
  active,
  icon: Icon,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate text-left">{label}</span>
      {count !== undefined && (
        <span className="text-xs tabular-nums text-muted-foreground">
          {count}
        </span>
      )}
    </button>
  );
}

export function VaultSidebar({
  search,
  onSearchChange,
  categories,
  tags,
  selection,
  onSelectionChange,
}: VaultSidebarProps) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r bg-card">
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-8"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 pb-3">
        <div className="space-y-0.5">
          <NavRow
            active={selection.type === "all"}
            icon={Shield}
            label="Todas"
            onClick={() => onSelectionChange({ type: "all" })}
          />
          <NavRow
            active={selection.type === "favorites"}
            icon={Star}
            label="Favoritos"
            onClick={() => onSelectionChange({ type: "favorites" })}
          />
        </div>

        {categories.length > 0 && (
          <div>
            <p className="px-2 pb-1 text-xs font-medium uppercase text-muted-foreground">
              Categorías
            </p>
            <div className="space-y-0.5">
              {categories.map((cat) => (
                <NavRow
                  key={cat.passwordCategoryId}
                  active={
                    selection.type === "category" &&
                    selection.id === cat.passwordCategoryId
                  }
                  icon={Folder}
                  label={cat.name}
                  count={cat._count?.vaults}
                  onClick={() =>
                    onSelectionChange({
                      type: "category",
                      id: cat.passwordCategoryId,
                    })
                  }
                />
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div>
            <p className="px-2 pb-1 text-xs font-medium uppercase text-muted-foreground">
              Etiquetas
            </p>
            <div className="space-y-0.5">
              {tags.map((tag) => (
                <NavRow
                  key={tag.passwordTagId}
                  active={
                    selection.type === "tag" &&
                    selection.id === tag.passwordTagId
                  }
                  icon={Tag}
                  label={tag.name}
                  onClick={() =>
                    onSelectionChange({ type: "tag", id: tag.passwordTagId })
                  }
                />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-2">
        <a
          href="/passwords/trash"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        >
          <Trash2 className="h-4 w-4" />
          Papelera
        </a>
      </div>
    </aside>
  );
}
