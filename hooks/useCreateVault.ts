import { useState } from "react";
import { api } from "@/lib/axios";
import { CreateVaultDto } from "@/types/password-vault.types";

export function useCreateVault(onSuccess?: () => void | Promise<void>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVault = async (dto: CreateVaultDto) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data } = await api.post("/password-vault/create", dto, {
        skip401Redirect: true,
      });
      await onSuccess?.();
      return data;
    } catch (e: any) {
      const message =
        e?.response?.data?.error ?? "No fue posible crear la credencial";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, error, createVault };
}
