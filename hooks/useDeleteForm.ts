// hooks/useDeleteForm.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import Cookies from "js-cookie";

export function useDeleteForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formId: string) => {
      console.log(` Eliminando formulario: ${formId}`);
      
   
      const token = Cookies.get("portal_access_token") || localStorage.getItem("token");
      
      const response = await api.delete(`/forms/${formId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Formulario eliminado exitosamente");
    },
    onError: (error: any) => {
      
      if (error?.response?.status === 403) {
        toast.error("No tienes permisos para eliminar este formulario");
      } else if (error?.response?.status === 404) {
        toast.error("El formulario ya fue eliminado o no existe");
      } else {
        toast.error(
          error?.response?.data?.message || "Error al eliminar el formulario"
        );
      }
    },
  });
}