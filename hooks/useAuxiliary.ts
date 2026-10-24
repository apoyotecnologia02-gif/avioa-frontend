"use client";

import { createAuxiliaryRepository } from "@/lib/auxiliary/auxiliar-repository";
import { SaveInput } from "@/types/auxiliary";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const repository = createAuxiliaryRepository();

export function useAuxiliaryRecords() {
  return useQuery({
    queryKey: ["auxiliary"],
    queryFn: () => repository.list(),
  });
}

export function useSaveAuxiliaryRecord() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ input, files }: { input: SaveInput; files: File[] }) =>
      repository.save(input, files),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["auxiliar"] });
    },
  });
}
