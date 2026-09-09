// hooks/useEquipmentLoans.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ===== CONSTANTES =====
const API_URL = "/api/equipment-loans";

// ===== KEYS PARA REACT QUERY =====
export const EQUIPMENT_LOAN_KEYS = {
  equipment: ["equipment"] as const,
  equipmentList: () => [...EQUIPMENT_LOAN_KEYS.equipment, "list"] as const,
  
  loans: ["loans"] as const,
  loansList: (filters?: any) => [...EQUIPMENT_LOAN_KEYS.loans, "list", { filters }] as const,
  myLoans: () => [...EQUIPMENT_LOAN_KEYS.loans, "my"] as const,
  
  locations: ["locations"] as const,
  locationsList: () => [...EQUIPMENT_LOAN_KEYS.locations, "list"] as const,
};

// ===== FUNCIONES DE API =====
const api = {
  // EQUIPOS
  getEquipment: () =>
    fetch(`${API_URL}?path=equipment`, {
      credentials: "include",
    }).then((res) => {
      if (!res.ok) throw new Error("Error al obtener equipos");
      return res.json();
    }),

  createEquipment: (data: any) =>
    fetch(`${API_URL}?path=equipment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }).then((res) => {
      if (!res.ok) throw new Error("Error al crear equipo");
      return res.json();
    }),

  // PRÉSTAMOS
  createLoan: (data: any) =>
    fetch(`${API_URL}?path=loans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }).then((res) => {
      if (!res.ok) throw new Error("Error al crear préstamo");
      return res.json();
    }),

  getMyLoans: () =>
    fetch(`${API_URL}?path=loans/my`, {
      credentials: "include",
    }).then((res) => {
      if (!res.ok) throw new Error("Error al obtener mis préstamos");
      return res.json();
    }),

  getAllLoans: (filters?: { status?: string; userId?: string; equipmentId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.equipmentId) params.append("equipmentId", filters.equipmentId);
    const query = params.toString() ? `&${params.toString()}` : "";
    
    return fetch(`${API_URL}?path=loans${query}`, {
      credentials: "include",
    }).then((res) => {
      if (!res.ok) throw new Error("Error al obtener préstamos");
      return res.json();
    });
  },

  updateLoanStatus: (id: string, status: string) =>
    fetch(`${API_URL}?path=loans/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      credentials: "include",
    }).then((res) => {
      if (!res.ok) throw new Error("Error al actualizar estado");
      return res.json();
    }),

  cancelLoan: (id: string) =>
    fetch(`${API_URL}?path=loans/${id}/cancel`, {
      method: "PATCH",
      credentials: "include",
    }).then((res) => {
      if (!res.ok) throw new Error("Error al cancelar préstamo");
      return res.json();
    }),

  // UBICACIONES
  getLocations: () =>
    fetch(`${API_URL}?path=locations`, {
      credentials: "include",
    }).then((res) => {
      if (!res.ok) throw new Error("Error al obtener ubicaciones");
      return res.json();
    }),
};

// ===== HOOKS =====
export function useEquipmentLoans() {
  const queryClient = useQueryClient();

  const useEquipment = () => {
    return useQuery({
      queryKey: EQUIPMENT_LOAN_KEYS.equipmentList(),
      queryFn: api.getEquipment,
    });
  };

  const useCreateEquipment = () => {
    return useMutation({
      mutationFn: api.createEquipment,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: EQUIPMENT_LOAN_KEYS.equipmentList() });
        toast.success("Equipo creado exitosamente");
      },
      onError: (error: any) => {
        toast.error(error?.message || "Error al crear el equipo");
      },
    });
  };

  const useMyLoans = () => {
    return useQuery({
      queryKey: EQUIPMENT_LOAN_KEYS.myLoans(),
      queryFn: api.getMyLoans,
    });
  };

  const useAllLoans = (filters?: { status?: string; userId?: string; equipmentId?: string }) => {
    return useQuery({
      queryKey: EQUIPMENT_LOAN_KEYS.loansList(filters),
      queryFn: () => api.getAllLoans(filters),
    });
  };

  const useCreateLoan = () => {
    return useMutation({
      mutationFn: api.createLoan,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: EQUIPMENT_LOAN_KEYS.myLoans() });
        queryClient.invalidateQueries({ queryKey: EQUIPMENT_LOAN_KEYS.loansList() });
        toast.success("Solicitud creada exitosamente");
      },
      onError: (error: any) => {
        toast.error(error?.message || "Error al crear la solicitud");
      },
    });
  };

  const useUpdateLoanStatus = () => {
    return useMutation({
      mutationFn: ({ id, status }: { id: string; status: string }) =>
        api.updateLoanStatus(id, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: EQUIPMENT_LOAN_KEYS.loansList() });
        queryClient.invalidateQueries({ queryKey: EQUIPMENT_LOAN_KEYS.myLoans() });
        toast.success("Estado actualizado");
      },
      onError: (error: any) => {
        toast.error(error?.message || "Error al actualizar el estado");
      },
    });
  };

  const useCancelLoan = () => {
    return useMutation({
      mutationFn: api.cancelLoan,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: EQUIPMENT_LOAN_KEYS.loansList() });
        queryClient.invalidateQueries({ queryKey: EQUIPMENT_LOAN_KEYS.myLoans() });
        toast.success("Préstamo cancelado");
      },
      onError: (error: any) => {
        toast.error(error?.message || "Error al cancelar el préstamo");
      },
    });
  };

  const useLocations = () => {
    return useQuery({
      queryKey: EQUIPMENT_LOAN_KEYS.locationsList(),
      queryFn: api.getLocations,
    });
  };

  return {
    useEquipment,
    useCreateEquipment,
    useMyLoans,
    useAllLoans,
    useCreateLoan,
    useUpdateLoanStatus,
    useCancelLoan,
    useLocations,
  };
}