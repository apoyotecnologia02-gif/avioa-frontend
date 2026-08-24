import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface DirectoryUser {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  department?: string;
}

export function useUserDirectory() {
  return useQuery({
    queryKey: ["user-directory"],
    queryFn: async () => {
      const { data } = await api.get<DirectoryUser[]>(
        "/admin/users/directory",
        {
          skip401Redirect: true,
        },
      );
      return data;
    },
  });
}
