import { api } from "@/lib/axios";
import { VaultItem } from "@/types/password-vault.types";
import { useCallback, useEffect, useState } from "react";

interface TrashItem extends VaultItem {
  daysRemainig: number;
}

export function useVaultTrash() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<TrashItem[]>("/password-vault/trash", {
        skip401Redirect: true,
      });
      setItems(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, isLoading, reload };
}

export function useRestoreVault(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const restore = async (id: string) => {
    setIsSubmitting(true);
    try {
      await api.patch(`/password-vault/restore/${id}`, {
        skip401Redirect: true,
      });
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, restore };
}

export function usePermanentDeleteVault(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const permanentDelete = async (id: string) => {
    setIsSubmitting(true);
    try {
      await api.delete(`/password-vault/permanent/${id}`, {
        skip401Redirect: true,
      });
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, permanentDelete };
}
