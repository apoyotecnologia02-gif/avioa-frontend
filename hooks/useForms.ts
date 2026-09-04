"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { Form, FormSubmission } from "@/types/form.types";

const FORMS_URL = `${process.env.NEXT_PUBLIC_API_URL}/forms`;
export function useForms() {
  return useQuery<Form[]>({
    queryKey: ["forms"],
    queryFn: async () => {
      const { data } = await api.get<Form[]>("/forms");
      return data;
    },
  });
}

export function useForm(id: string) {
  return useQuery<Form>({
    queryKey: ["forms", id],
    queryFn: async () => {
      const { data } = await api.get<Form>(`/forms/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useSubmitForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formId, data }: FormSubmission) => {
      const response = await api.post(`/forms/${formId}/submit`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description: string;
      category: string;
      type: string;
      embedUrl: string;
    }) => {
      const { data } = await api.post<Form>("/forms", payload, {
        skip401Redirect: true,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
}

export function useDeleteForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/forms/${id}`, {
        skip401Redirect: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
}
