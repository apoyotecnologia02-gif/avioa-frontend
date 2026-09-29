import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MaintenanceRequest,
  CreateMaintenanceDto,
  UpdateMaintenanceStatusDto,
  MaintenanceFilters,
} from "@/types/maintenance.types";

const API_URL = "/api/maintenance";

// ===== KEYS =====
export const MAINTENANCE_KEYS = {
  all: ["maintenance"] as const,
  lists: () => [...MAINTENANCE_KEYS.all, "list"] as const,
  list: (filters?: MaintenanceFilters) =>
    [...MAINTENANCE_KEYS.lists(), { filters }] as const,
  my: () => [...MAINTENANCE_KEYS.all, "my"] as const,
  details: () => [...MAINTENANCE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...MAINTENANCE_KEYS.details(), id] as const,
};

// ===== API =====
const api = {
  create: (data: CreateMaintenanceDto) =>
    fetch(`${API_URL}?path=`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al crear la solicitud");
      }
      return res.json();
    }),

  getMyRequests: (): Promise<MaintenanceRequest[]> =>
    fetch(`${API_URL}?path=my`, { credentials: "include" }).then(async (res) => {
      if (!res.ok) throw new Error("Error al obtener mis solicitudes");
      return res.json();
    }),

  getAllRequests: (
    filters?: MaintenanceFilters,
  ): Promise<MaintenanceRequest[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.equipmentId) params.append("equipmentId", filters.equipmentId);
    const query = params.toString() ? `&${params.toString()}` : "";

    return fetch(`${API_URL}?path=${query}`, { credentials: "include" }).then(
      async (res) => {
        if (!res.ok) throw new Error("Error al obtener las solicitudes");
        return res.json();
      },
    );
  },

  getOne: (id: string): Promise<MaintenanceRequest> =>
    fetch(`${API_URL}?path=${id}`, { credentials: "include" }).then(
      async (res) => {
        if (!res.ok) throw new Error("Error al obtener la solicitud");
        return res.json();
      },
    ),

  updateStatus: (id: string, data: UpdateMaintenanceStatusDto) =>
    fetch(`${API_URL}?path=${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al actualizar el estado");
      }
      return res.json();
    }),

  cancel: (id: string) =>
    fetch(`${API_URL}?path=${id}/cancel`, {
      method: "PATCH",
      credentials: "include",
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al cancelar la solicitud");
      }
      return res.json();
    }),
};

// ===== HOOKS =====
export function useMaintenance() {
  const queryClient = useQueryClient();

  const useMyRequests = () => {
    return useQuery({
      queryKey: MAINTENANCE_KEYS.my(),
      queryFn: api.getMyRequests,
    });
  };

  const useAllRequests = (
    filters?: MaintenanceFilters,
    options?: { enabled?: boolean },
  ) => {
    return useQuery({
      queryKey: MAINTENANCE_KEYS.list(filters),
      queryFn: () => api.getAllRequests(filters),
      enabled: options?.enabled ?? true,
    });
  };

  const useOne = (id: string) => {
    return useQuery({
      queryKey: MAINTENANCE_KEYS.detail(id),
      queryFn: () => api.getOne(id),
      enabled: !!id,
    });
  };

  const useCreateRequest = () => {
    return useMutation({
      mutationFn: api.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.my() });
        queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.lists() });
        toast.success("Solicitud de mantenimiento creada");
      },
      onError: (error: any) => {
        toast.error(error?.message || "Error al crear la solicitud");
      },
    });
  };

  const useUpdateStatus = () => {
    return useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: string;
        data: UpdateMaintenanceStatusDto;
      }) => api.updateStatus(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.lists() });
        queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.my() });
        queryClient.invalidateQueries({
          queryKey: MAINTENANCE_KEYS.detail(variables.id),
        });
        toast.success("Estado actualizado");
      },
      onError: (error: any) => {
        toast.error(error?.message || "Error al actualizar el estado");
      },
    });
  };

  const useCancelRequest = () => {
    return useMutation({
      mutationFn: api.cancel,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.lists() });
        queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.my() });
        queryClient.invalidateQueries({
          queryKey: MAINTENANCE_KEYS.detail(id),
        });
        toast.success("Solicitud cancelada");
      },
      onError: (error: any) => {
        toast.error(error?.message || "Error al cancelar la solicitud");
      },
    });
  };

  return {
    useMyRequests,
    useAllRequests,
    useOne,
    useCreateRequest,
    useUpdateStatus,
    useCancelRequest,
  };
}