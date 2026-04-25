"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { toast } from "sonner";

export function useRequestPoints(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestPoints = async (reason: string, amount: number) => {
    try {
      setIsSubmitting(true);
      const res = await api.post("/points/request", { reason, amount });

      if (res.data.success) {
        toast.success(res.data.message);
        onSuccess?.(); // 👈 para cerrar el modal desde afuera
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Error al enviar la solicitud",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleRequestPoints,
  };
}
