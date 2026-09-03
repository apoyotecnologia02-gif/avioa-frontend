"use client";

import { api } from "@/lib/axios";
import { useState } from "react";
import { toast } from "sonner";

export function useReedeemReward(onSuccess: () => void) {
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const handleRedeem = async (rewardId: string) => {
    try {
      setRedeemingId(rewardId);

      const response = await api.post(`/points/redeem/${rewardId}`, null, {
        skip401Redirect: true,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Recompensa redimida con éxito");

        onSuccess?.();
      }
    } catch (error) {
      toast.error("Error al redimir la recompensa");
    } finally {
      setRedeemingId(null);
    }
  };

  return {
    redeemingId,
    handleRedeem,
  };
}
