"use client";

import { api } from "@/lib/axios";
import { KnowledgeContents } from "@/types/knowledge.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useKnowledgeContents(folderId?: string) {
  return useQuery<KnowledgeContents>({
    queryKey: ["knowledge", folderId ?? "root"],
    queryFn: async () => {
      const { data } = await api.get<KnowledgeContents>("/knowledge", {
        params: folderId ? { folderId } : undefined,
        skip401Redirect: true,
      });
      return data;
    },
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: { name: string; parentId?: string }) => {
      const { data } = await api.post("/knowledge/folders", dto, {
        skip401Redirect: true,
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["knowledge", variables.parentId ?? "root"],
      });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (folderId: string) => {
      const { data } = await api.delete(`/knowledge/folders/${folderId}`, {
        skip401Redirect: true,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });
}

export function useCreateFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: {
      title: string;
      driveUrl: string;
      folderId: string;
    }) => {
      const { data } = await api.post("/knowledge/files", dto);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["knowledge", variables.folderId],
      });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/knowledge/files/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });
}
