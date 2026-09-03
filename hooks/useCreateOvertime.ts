"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import type { CreateOvertimeDto, OvertimeRecord } from "@/types/overtime.types";

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "object" && err !== null) {
    const maybeErr = err as {
      response?: { data?: { message?: unknown } };
      message?: unknown;
    };
    const responseMessage = maybeErr.response?.data?.message;
    if (
      typeof responseMessage === "string" &&
      responseMessage.trim().length > 0
    ) {
      return responseMessage;
    }
    if (
      typeof maybeErr.message === "string" &&
      maybeErr.message.trim().length > 0
    ) {
      return maybeErr.message;
    }
  }
  return fallback;
}

export function useCreateOvertime(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOvertime = async (dto: CreateOvertimeDto) => {
    try {
      setIsSubmitting(true);
      await api.post<OvertimeRecord>("/overtime", dto, {
        skip401Redirect: true,
      });
      toast.success("Horas extra registradas correctamente");
      onSuccess?.();
    } catch (err) {
      const msg = getErrorMessage(err, "Error al registrar las horas extra");
      toast.error(msg);
      // Re-throw so the form can display the error inline
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, createOvertime };
}
