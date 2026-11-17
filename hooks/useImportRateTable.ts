import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export function useImportRateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, source }: { file: File, source: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Llamamos al proxy (si lo tienes) o directo al backend
      const res = await api.post(`/commercial/drive-tables/import?source=${source}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      // Recargamos los datos de la tabla
      queryClient.invalidateQueries({ queryKey: ['rate-table', variables.source] });
    }
  });
}