// hooks/useCommercialResources.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import type {
  CommercialResource,
  ResourceInput,
  ResourceKind,
} from "@/types/commercial.types";

// ===== KEYS PARA REACT QUERY =====
export const COMMERCIAL_KEYS = {
  all: ["commercial"] as const,
  resources: () => [...COMMERCIAL_KEYS.all, "resources"] as const,
  resourcesList: (kind?: ResourceKind) =>
    [...COMMERCIAL_KEYS.resources(), "list", { kind }] as const,
};

// ===== FUNCIONES DE API =====
const apiClient = {
  list: async (kind?: ResourceKind): Promise<CommercialResource[]> => {
    const params = kind ? { kind } : undefined;
    const { data } = await api.get<CommercialResource[]>(
      "/commercial/resources",
      { params },
    );
    return data;
  },

  create: async (input: ResourceInput): Promise<CommercialResource> => {
    const { data } = await api.post<CommercialResource>(
      "/commercial/resources",
      input,
    );
    return data;
  },

  update: async (
    id: string,
    input: ResourceInput,
  ): Promise<CommercialResource> => {
    const { data } = await api.patch<CommercialResource>(
      `/commercial/resources/${id}`,
      input,
    );
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/commercial/resources/${id}`);
  },
};

// ===== HOOKS =====

/**
 * Lista los recursos comerciales, opcionalmente filtrados por kind.
 * Los 8 catálogos usan este hook con distintos `kind`.
 */
export function useCommercialResources(kind?: ResourceKind) {
  return useQuery({
    queryKey: COMMERCIAL_KEYS.resourcesList(kind),
    queryFn: () => apiClient.list(kind),
    staleTime: 60_000,
  });
}

export function useCreateCommercialResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.create,
    onSuccess: () => {
      // Invalida tanto la lista filtrada como la global
      queryClient.invalidateQueries({ queryKey: COMMERCIAL_KEYS.resources() });
      toast.success("Recurso creado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear el recurso");
    },
  });
}

export function useUpdateCommercialResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ResourceInput }) =>
      apiClient.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMERCIAL_KEYS.resources() });
      toast.success("Recurso actualizado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar el recurso");
    },
  });
}

export function useDeleteCommercialResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMERCIAL_KEYS.resources() });
      toast.success("Recurso eliminado");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el recurso");
    },
  });
}