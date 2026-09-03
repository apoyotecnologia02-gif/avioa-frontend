"use client";

import { VaultItem } from "@/types/password-vault.types";
import { ScrollArea } from "../ui/scroll-area";
import { VaultCard } from "./vault-card";
import { VaultSkeleton } from "./vault-skeleton";
import { VaultEmpty } from "./vault-empty";

interface VaultListProps {
  items: VaultItem[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (item: VaultItem) => void;
  onCreateNew: () => void;
}

export function VaultList({
  items,
  isLoading,
  selectedId,
  onSelect,
  onCreateNew,
}: VaultListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <VaultSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <VaultEmpty onCreateNew={onCreateNew} />;
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-3">
        {items.map((item) => (
          <VaultCard
            key={item.passwordVaultId}
            item={item}
            selected={item.passwordVaultId === selectedId}
            onSelect={() => onSelect(item)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
