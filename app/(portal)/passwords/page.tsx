"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VaultDetails } from "@/components/vault/vault-details";
import { VaultFormModal } from "@/components/vault/vault-form-modal";
import { VaultHeader } from "@/components/vault/vault-header";
import { VaultList } from "@/components/vault/vault-list";
import {
  VaultFilterSelection,
  VaultSidebar,
} from "@/components/vault/vault-sidebar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePasswordVaultSocket } from "@/hooks/usePasswordVaultSocket";
import { useVaultCategories } from "@/hooks/useVaultCategories";
import { useVaultList } from "@/hooks/useVaultList";
import { useVaultTags } from "@/hooks/useVaultTags";
import { VaultItem } from "@/types/password-vault.types";
import { useMemo, useState } from "react";

export default function VaultPage() {
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<VaultFilterSelection>({
    type: "all",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [revealedPassword, setRevealedPassword] = useState<{
    password: string;
    itemId: string;
  } | null>(null);
  const debouncedSearch = useDebouncedValue(search, 350);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formTarget, setFormTarget] = useState<VaultItem | null>(null);
  const [scope, setScope] = useState<"own" | "shared">("own");

  const { categories } = useVaultCategories();
  const { tags } = useVaultTags();

  const filters = useMemo(() => {
    const base = { search: debouncedSearch, scope };
    if (selection.type === "favorites") return { ...base, favorite: true };
    if (selection.type === "category")
      return { ...base, categoryId: selection.id };
    if (selection.type === "tag") return { ...base, tagId: selection.id };
    return base;
  }, [selection, debouncedSearch, scope]);

  const { items, isLoading, reload } = useVaultList(filters);

  usePasswordVaultSocket();

  const selectedItem =
    items.find((i) => i.passwordVaultId === selectedId) ?? null;

  function handleSelect(item: VaultItem) {
    setSelectedId(item.passwordVaultId);
    setRevealedPassword(null);
  }

  function handleCreateNew() {
    setFormMode("create");
    setFormTarget(null);
    setFormOpen(true);
  }

  function handleEdit(item: VaultItem) {
    setFormMode("edit");
    setFormTarget(item);
    setFormOpen(true);
  }

  return (
    // <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <VaultHeader
        onCreateNew={handleCreateNew}
        scope={scope}
        onScopeChange={setScope}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="hidden xl:block">
          <VaultSidebar
            search={search}
            onSearchChange={setSearch}
            categories={categories}
            tags={tags}
            selection={selection}
            onSelectionChange={setSelection}
          />
        </div>

        {/* Columna de la lista */}
        <div
          className={`flex min-h-0 w-full flex-col border-r lg:w-80 ${selectedItem ? "hidden lg:flex" : "flex"}`}
        >
          <div className="border-b p-3 xl:hidden">
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="min-h-0 flex-1">
            <VaultList
              items={items}
              isLoading={isLoading}
              selectedId={selectedId}
              onSelect={handleSelect}
              onCreateNew={handleCreateNew}
            />
          </div>
        </div>

        <div
          className={`min-h-0 min-w-0 flex-1 flex-col ${selectedItem ? "flex" : "hidden lg:flex"}`}
        >
          {selectedItem ? (
            <>
              <div className="shrink-0 border-b p-2 lg:hidden">
                <Button
                  onClick={() => setSelectedId(null)}
                  className="text-sm text-muted-foreground"
                >
                  ← Volver
                </Button>
              </div>
              <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                <VaultDetails
                  item={selectedItem}
                  revealedPassword={revealedPassword}
                  onRevealed={(password) => {
                    setRevealedPassword({
                      password,
                      itemId: selectedItem.passwordVaultId,
                    });
                    setTimeout(() => setRevealedPassword(null), 15000);
                  }}
                  onEdit={handleEdit}
                  onDeleted={() => {
                    setSelectedId(null);
                    setRevealedPassword(null);
                    reload();
                  }}
                  onFavoriteToggled={reload}
                />
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Selecciona una credencial para ver sus detalles
            </div>
          )}
        </div>

        <VaultFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          mode={formMode}
          item={formTarget}
          categories={categories}
          tags={tags}
          onSaved={reload}
        />
      </div>
    </div>
  );
}
