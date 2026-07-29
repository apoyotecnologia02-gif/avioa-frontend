"use client";

import { api } from "@/lib/axios";
import {
  CreateLeaveDto,
  LeaveRequest,
  ReviewLeaveDto,
  VacationBalance,
} from "@/types/leaves.types";
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

export function useVacationBalance() {
  const [balance, setBalance] = useState<VacationBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<VacationBalance>("/leaves/my/balance", {
        skip401Redirect: true,
      });
      setBalance(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Error al cargar tu saldo"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { balance, isLoading, reload: load };
}

// mis solicitudes
export function useMyLeaves(year?: number) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<LeaveRequest[]>("/leaves/my", {
        params: year ? { year } : undefined,
        skip401Redirect: true,
      });
      setLeaves(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Error al cargar tus solicitudes"));
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  return { leaves, isLoading, reload: load };
}

// solicitudes del equipo
export function useTeamLeaves(enabled: boolean) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  const load = useCallback(async () => {
    if (!enabled) return;
    try {
      setIsLoading(true);
      const res = await api.get<LeaveRequest[]>("/leaves/team", {
        skip401Redirect: true,
      });
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Error al cargar las solicitudes del equipo"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return { leaves, isLoading, reload: load };
}

// crear solicitud
export function useCreateLeave(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createLeave = async (dto: CreateLeaveDto) => {
    try {
      setIsSubmitting(true);
      await api.post("/leaves", dto);
      toast.success("Solicitud creada correctamente");
      onSuccess?.();
    } catch (err) {
      const msg = getErrorMessage(err, "Error al enviar la solicitud");
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, createLeave };
}

// revisar (aprobar / rechazar)
export function useReviewLeave(onSuccess?: () => void) {
  const [isReviewing, setIsReviewing] = useState(false);

  const reviewLeave = async (id: string, dto: ReviewLeaveDto) => {
    try {
      setIsReviewing(true);
      await api.patch(`/leaves/${id}/review`, dto);
      toast.success(
        dto.status === "APPROVED"
          ? "Solicitud aprobada"
          : "Solicitud rechazada",
      );
      onSuccess?.();
    } catch (err) {
      const msg = getErrorMessage(err, "Error al revisar la solicitud");
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsReviewing(false);
    }
  };

  return { isReviewing, reviewLeave };
}

// cancelar solicitud propia
export function useCancelLeave(onSuccess?: () => void) {
  const [isCancelling, setIsCancelling] = useState(false);

  const cancelLeave = async (id: string) => {
    try {
      setIsCancelling(true);
      await api.delete(`/leaves/${id}`);
      toast.success("Solcitud cancelada");
      onSuccess?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Error al cancelar la solicitud"));
    } finally {
      setIsCancelling(false);
    }
  };

  return { isCancelling, cancelLeave };
}
