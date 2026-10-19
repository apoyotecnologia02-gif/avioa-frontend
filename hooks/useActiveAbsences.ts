"use client";

import { api } from "@/lib/axios";
import type { ActiveLeaveRequest } from "@/types/leaves.types";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "object" && err !== null) {
    const maybe = err as {
      response?: { data?: { message?: unknown } };
      message?: unknown;
    };

    const m = maybe.response?.data?.message;
    if (typeof m === "string" && m.trim()) return m;
    if (typeof maybe.message === "string" && maybe.message.trim())
      return maybe.message;
  }
  return fallback;
}

export function useActiveAbsences(onSuccess?: () => void) {
  const [absences, setAbsences] = useState<ActiveLeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<ActiveLeaveRequest[]>("/leaves/active", {
        skip401Redirect: true,
      });
      setAbsences(Array.isArray(res.data) ? res.data : []);
      onSuccess?.();
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Error al cargar las ausencias activas"),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { absences, isLoading, reload: load };
}