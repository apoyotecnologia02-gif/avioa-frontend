// hooks/useCreateForm.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";

interface CreateFormData {
  title: string;
  description?: string;
  category: string;
  embed_url: string;
  type?: string;
  status?: string;
  schema?: any;
  autofill?: any;
}

export function useCreateForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFormData) => {
   
      const response = await api.post("/forms", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Formulario creado exitosamente");
    },
    onError: (error: any) => {
      console.error("Error en createForm:", error);
      toast.error(
        error?.response?.data?.message || "Error al crear el formulario"
      );
    },
  });
}