import { useState } from "react";
import { api } from "@/lib/axios";

interface RevealDto {
  totpCode?: string;
  loginPassword?: string;
}

export function useRevealPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reveal = async (id: string, dto: RevealDto) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post<{
        password: string;
        hideAfterSeconds: number;
      }>(`/password-vault/reveal/${id}`, dto, { skip401Redirect: true });
      return data;
    } catch (e: any) {
      const message =
        e?.response?.data?.error ?? "No fue posible revelar la credencial";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const logCopy = async (id: string, field: "USERNAME" | "PASSWORD") => {
    await api.post(
      `/api/password-vault/log-copy/${id}`,
      { field },
      { skip401Redirect: true },
    );
  };

  return { isSubmitting, error, reveal, logCopy };
}
