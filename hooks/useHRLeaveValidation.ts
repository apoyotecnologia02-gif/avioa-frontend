"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import {
  LeaveRequest,
  ValidateCompensatedLeaveDto,
} from "@/types/leaves.types";

export function useLeavesPendingHRValidation() {
  return useQuery<LeaveRequest[]>({
    queryKey: ["leaves", "pending-hr-validation"],
    queryFn: async () => {
      const { data } = await api.get("/leaves/pending-hr-validation");
      return data;
    },
  });
}

export function useValidateByHR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leaveRequestId,
      dto,
    }: {
      leaveRequestId: string;
      dto: ValidateCompensatedLeaveDto;
    }) => {
      const { data } = await api.patch(
        `/leaves/${leaveRequestId}/validate-hr`,
        dto,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["leaves", "pending-hr-validation"],
      });
    },
  });
}

export function useLeaveHRDetail(id: string) {
  return useQuery<LeaveRequest>({
    queryKey: ["leaves", "hr-validation", id],
    queryFn: async () => {
      const { data } = await api.get(`/leaves/hr-validation/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
