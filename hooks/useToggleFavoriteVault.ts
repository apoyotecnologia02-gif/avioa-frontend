import { useState } from "react";
import { api } from "@/lib/axios";
import { VaultItem } from "@/types/password-vault.types";

export function useToggleFavoriteVault(onSuccess?: (item: VaultItem) => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFavorite = async (id: string) => {
    setIsSubmitting(true);
    try {
      const { data } = await api.patch<VaultItem>(
        `/password-vault/toggle-favorite/${id}`,
        { skip401Redirect: true },
      );
      onSuccess?.(data);
      return data;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, toggleFavorite };
}
