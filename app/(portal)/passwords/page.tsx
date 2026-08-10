"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RevealPasswordDialog } from "@/components/vault/reveal-password-dialog";
import { VaultDetails } from "@/components/vault/vault-details";
import { VaultFormModal } from "@/components/vault/vault-form-modal";
import { VaultHeader } from "@/components/vault/vault-header";
import { VaultList } from "@/components/vault/vault-list";
import {
  VaultFilterSelection,
  VaultSidebar,
} from "@/components/vault/vault-sidebar";
import { VaultTable } from "@/components/vault/vault-table";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDeleteVault } from "@/hooks/useDeleteVault";
import { useRevealPassword } from "@/hooks/useRevealPasswordVault";
import { useVaultCategories } from "@/hooks/userVaultCategories";
import { useToggleFavoriteVault } from "@/hooks/useToggleFavoriteVault";
import { useVaultList } from "@/hooks/useVaultList";
import { useVaultTags } from "@/hooks/useVaultTags";
import { VaultItem } from "@/types/password-vault.types";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

export default function VaultPage() {
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<VaultFilterSelection>({
    type: "all",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 350);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formTarget, setFormTarget] = useState<VaultItem | null>(null);

  const { categories } = useVaultCategories();
  const { tags } = useVaultTags();

  const filters = useMemo(() => {
    if (selection.type === "favorites")
      return { search: debouncedSearch, favorite: true };
    if (selection.type === "category")
      return { search: debouncedSearch, categoryId: selection.id };
    if (selection.type === "tag")
      return { search: debouncedSearch, tagId: selection.id };
    return { search: debouncedSearch };
  }, [selection, debouncedSearch]);

  const { items, isLoading, reload } = useVaultList(filters);

  const selectedItem =
    items.find((i) => i.passwordVaultId === selectedId) ?? null;

  function handleSelect(item: VaultItem) {
    setSelectedId(item.passwordVaultId);
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
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      <VaultHeader onCreateNew={handleCreateNew} />

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <VaultSidebar
            search={search}
            onSearchChange={setSearch}
            categories={categories}
            tags={tags}
            selection={selection}
            onSelectionChange={setSelection}
          />
        </div>

        <div
          className={`w-full border-r md:w-80 ${selectedItem ? "hidden md:block" : "block"}`}
        >
          <VaultList
            items={items}
            isLoading={isLoading}
            selectedId={selectedId}
            onSelect={handleSelect}
            onCreateNew={handleCreateNew}
          />
        </div>

        <div className={`flex-1 ${selectedItem ? "block" : "hidden md:block"}`}>
          {selectedItem ? (
            <>
              <div className="border-b p-2 md:hidden">
                <Button
                  onClick={() => setSelectedId(null)}
                  className="text-sm text-muted-foreground"
                >
                  ← Volver
                </Button>
              </div>
              <VaultDetails
                item={selectedItem}
                onEdit={handleEdit}
                onDeleted={() => {
                  setSelectedId(null);
                  reload();
                }}
                onFavoriteToggled={reload}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Selecciona una credencial para ver sus detalles
            </div>
          )}
        </div>
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
  );
}
