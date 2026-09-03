import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/axios";
import { VaultItem } from "@/types/password-vault.types";

export interface VaultListFilters {
  search?: string;
  categoryId?: string;
  favorite?: boolean;
  tagId?: string;
  scope?: "own" | "shared";
}

export function useVaultList(filters: VaultListFilters) {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.categoryId) params.set("categoryId", filters.categoryId);
      if (filters.favorite !== undefined)
        params.set("favorite", String(filters.favorite));
      if (filters.tagId) params.set("tagId", filters.tagId);
      if (filters.scope) params.set("scope", filters.scope);

      const { data } = await api.get(
        `/password-vault/find-all${params ? `?${params.toString()}` : ""}`,
        { skip401Redirect: true },
      );
      setItems(data.items);
      setTotal(data.total);
    } catch {
      setError("No fue posible cargar las credenciales");
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.search,
    filters.categoryId,
    filters.favorite,
    filters.tagId,
    filters.scope,
  ]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, total, isLoading, error, reload };
}
