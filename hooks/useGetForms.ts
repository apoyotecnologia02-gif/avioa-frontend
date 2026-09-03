// hooks/useGetForms.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

interface Form {
  form_id: string;
  title: string;
  description: string | null;
  category: string;
  embed_url: string | null;
  type: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  schema: any;
  autofill: any;
}

interface GetFormsParams {
  category?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResponse {
  data: Form[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useGetForms(params: GetFormsParams = {}) {
  const { category, status, type, page = 1, limit = 6 } = params;

  return useQuery({
    queryKey: ["forms", { category, status, type, page, limit }],
    queryFn: async (): Promise<PaginatedResponse> => {
      try {
        const searchParams = new URLSearchParams();
        if (category) searchParams.append("category", category);
        if (status) searchParams.append("status", status);
        if (type) searchParams.append("type", type);
        searchParams.append("page", page.toString());
        searchParams.append("limit", limit.toString());

        const url = `/forms?${searchParams.toString()}`;
        console.log("Fetching forms from:", url);
        
        const response = await api.get(url);
   

        if (Array.isArray(response.data)) {
          console.log("Response is an array, mapping directly");
          
          const mappedData = response.data.map((item: any) => ({
            form_id: item.form_id || item.id || item.formId || '',
            title: item.title || '',
            description: item.description || null,
            category: item.category || '',
            embed_url: item.embed_url || item.embedUrl || null,
            type: item.type || null,
            status: item.status || null,
            schema: item.schema || null,
            autofill: item.autofill || null,
            created_at: item.created_at || item.createdAt || new Date().toISOString(),
            updated_at: item.updated_at || item.updatedAt || new Date().toISOString(),
          }));

          console.log(" Mapped data:", mappedData);

          return {
            data: mappedData,
            total: mappedData.length,
            page: page,
            limit: limit,
            totalPages: Math.ceil(mappedData.length / limit),
          };
        }

        // Si la respuesta tiene una propiedad data
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          console.log("Response has data property");
          const responseData = response.data as any;
          
          const mappedData = (responseData.data || []).map((item: any) => ({
            form_id: item.form_id || item.id || item.formId || '',
            title: item.title || '',
            description: item.description || null,
            category: item.category || '',
            embed_url: item.embed_url || item.embedUrl || null,
            type: item.type || null,
            status: item.status || null,
            schema: item.schema || null,
            autofill: item.autofill || null,
            created_at: item.created_at || item.createdAt || new Date().toISOString(),
            updated_at: item.updated_at || item.updatedAt || new Date().toISOString(),
          }));

          return {
            data: mappedData,
            total: responseData.total || mappedData.length,
            page: responseData.page || page,
            limit: responseData.limit || limit,
            totalPages: responseData.totalPages || Math.ceil(mappedData.length / limit),
          };
        }

        // Si no se pudo parsear, devolver vacío
        console.warn("No se pudo parsear la respuesta:", response.data);
        return {
          data: [],
          total: 0,
          page: page,
          limit: limit,
          totalPages: 0,
        };

      } catch (error) {
        console.error("Error fetching forms:", error);
        throw error;
      }
    },
  });
}