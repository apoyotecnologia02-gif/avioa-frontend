import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commercialRequest } from '@/lib/commercial/request';

export function useCommercialOperators() {
  return useQuery({
    queryKey: ['commercial-operators'],
    queryFn: async () => {
      const res = await commercialRequest('/api/commercial/operators');
      if (!res.ok) throw new Error('Error al cargar operadores');
      return res.json();
    },
  });
}

export function useCreateOperator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { category: string; destination: string; operator: string; raw: string }) => {
      const res = await commercialRequest('/api/commercial/operators', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear operador');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commercial-operators'] }),
  });
}

export function useDeleteOperator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await commercialRequest(`/api/commercial/operators?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar operador');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commercial-operators'] }),
  });
}