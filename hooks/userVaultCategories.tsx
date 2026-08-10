import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/axios";

export interface VaultCategory {
  passwordCategoryId: string;
  name: string;
  icon?: string;
  color?: string;
  _count?: { vaults: number };
}

export function useVaultCategories() {
  const [categories, setCategories] = useState<VaultCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<VaultCategory[]>(
        "/password-vault/categories",
        {
          skip401Redirect: true,
        },
      );
      setCategories(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { categories, isLoading, reload };
}
