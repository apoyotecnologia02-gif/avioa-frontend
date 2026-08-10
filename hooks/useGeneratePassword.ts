import { useState } from "react";
import { api } from "@/lib/axios";

interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
}

export function useGeneratePassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generate = async (options: GeneratorOptions) => {
    setIsSubmitting(true);
    try {
      const { data } = await api.post<{ password: string }>(
        "/password-vault/generate-password",
        options,
        { skip401Redirect: true },
      );
      return data.password;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, generate };
}
