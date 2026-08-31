import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export function useDirectory() {
  return useQuery({
    queryKey: ["directory"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users/directory", {
        skip401Redirect: true,
      });
      return data;
    },
  });
}
