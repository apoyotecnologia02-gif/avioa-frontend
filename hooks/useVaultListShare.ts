import { useCallback, useEffect, useState } from "react";
import { VaultPermission } from "./useVaultSharing";
import { api } from "@/lib/axios";

export function useVaultListShares(vaultId: string) {
  const [isSubmitting, setIsSubmitting] = useState(true);
  const [shares, setShares] = useState<VaultPermission[]>([]);

  const vaultShares = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const { data } = await api.get<VaultPermission[]>(
        `/password-vault/list-shared/${vaultId}`,
        {
          skip401Redirect: true,
        },
      );
      setShares(data);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  useEffect(() => {
    vaultShares();
  }, [vaultShares]);

  return { isSubmitting, shares };
}
