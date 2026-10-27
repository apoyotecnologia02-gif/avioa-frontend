import { api } from "@/lib/axios";
import type { CommercialRepository, CommercialResource } from "@/types/commercial.types";

/**
 * Adaptador del módulo comercial hacia el backend NestJS.
 * Reutiliza los interceptores de JWT, refresh y errores del portal (lib/axios.ts).
 *
 * Nota: usa PATCH para update. Si tu backend usa PUT, cambia esa línea.
 */
export function createCommercialRepository(): CommercialRepository {
  return {
    list: async () =>
      (await api.get<CommercialResource[]>("/commercial/resources")).data,

    save: async (input, id) =>
      (
        await (id
          ? api.patch<CommercialResource>(`/commercial/resources/${id}`, input)
          : api.post<CommercialResource>("/commercial/resources", input))
      ).data,

    remove: async (id) => {
      await api.delete(`/commercial/resources/${id}`);
    },
  };
}