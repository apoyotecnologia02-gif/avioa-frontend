import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/axios";

export interface VaultTag {
  passwordTagId: string;
  name: string;
}

export function useVaultTags() {
  const [tags, setTags] = useState<VaultTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<VaultTag[]>("/password-vault/tag", {
        skip401Redirect: true,
      });
      setTags(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { tags, isLoading, reload };
}
