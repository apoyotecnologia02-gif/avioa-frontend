import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export function useGetUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return data;
    },
  });
}
