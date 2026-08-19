import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface VaultPermission {
  passwordPermissionId: string;
  vaultId?: string;
  userId?: string;
  department?: string;
  canView: boolean;
  canEdit: boolean;
  canAdmin: boolean;
  user?: { userId: string; name: string; email: string; avatarUrl?: string };
}

interface ShareDto {
  userId?: string;
  department?: string;
  canView: boolean;
  canEdit: boolean;
  canAdmin: boolean;
}

export function useVaultShares(vaultId: string) {
  return useQuery({
    queryKey: ["vault-shares", vaultId],
    queryFn: async () => {
      const response = await api.get<VaultPermission[]>(
        `/password-vault/list-shared/${vaultId}`,
        {
          skip401Redirect: true,
        },
      );

      const data = response.data;

      return data || [];
    },
    enabled: !!vaultId,
  });
}

export function useShareVault(vaultId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: ShareDto) => {
      const { data } = await api.post<VaultPermission>(
        `/password-vault/sharing/${vaultId}`,
        dto,
        {
          skip401Redirect: true,
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-shares", vaultId] });
    },
  });
}

export function useUpdateVaultPermission(vaultId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      permissionId,
      ...dto
    }: { permissionId: string } & Partial<
      Pick<ShareDto, "canView" | "canEdit" | "canAdmin">
    >) => {
      const { data } = await api.patch<VaultPermission>(
        `/password-vault/sharing/permissions/${permissionId}`,
        dto,
        {
          skip401Redirect: true,
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-shares", vaultId] });
    },
  });
}

export function useRevokeVaultPermission(vaultId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permissionId: string) => {
      await api.delete(`/password-vault/sharing/permissions/${permissionId}`, {
        skip401Redirect: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-shares", vaultId] });
    },
  });
}
