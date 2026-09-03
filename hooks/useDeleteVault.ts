import { useState } from "react";
import { api } from "@/lib/axios";

export function useDeleteVault(onSuccess?: () => void | Promise<void>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deleteVault = async (id: string) => {
    setIsSubmitting(true);
    try {
      await api.patch(`/password-vault/soft-delete/${id}`, {
        skip401Redirect: true,
      });
      await onSuccess?.();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, deleteVault };
}
