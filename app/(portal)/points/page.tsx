"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
// import { pointsService } from "@/lib/api/points.service"
import { Wallet } from "@/types/points.types";
import { PointsSummary } from "@/components/points/PointsSummary";
import { RewardsGrid } from "@/components/points/RewardsGrid";
import { RequestPointsModal } from "@/components/points/RequestPointsModal";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { History, ClipboardList } from "lucide-react";
import { api } from "@/lib/axios";
import { useRewards } from "@/hooks/useRewards";
import { useWallet } from "@/hooks/useWallet";
import { useReedeemReward } from "@/hooks/useReedemReward";
import { useRequestPoints } from "@/hooks/useRequestPoints";

interface Reward {
  rewardId: string;
  name: string;
  description: string;
  cost: number;
  stock: number;
  isActive: boolean;
  imageUrl: string;
  createdAt: string;
}

interface RewardResponse {
  rewards: Reward[];
}

export default function PointsPage() {
  const router = useRouter();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const { rewards, isLoading, reload } = useRewards();
  const {
    wallet,
    isLoading: isWalletLoading,
    reload: reloadWallet,
  } = useWallet();

  const { redeemingId, handleRedeem } = useReedeemReward(() => reloadWallet());
  const { isSubmitting, handleRequestPoints } = useRequestPoints(() =>
    setIsRequestModalOpen(false),
  );

  // useEffect(() => {
  //   if (rewards.length > 0) {
  //     console.log(
  //       "rewardsIds",
  //       rewards.map((r) => r.rewardId),
  //     );
  //   }
  // }, [rewards]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Centro de Recompensas
          </h1>
          <p className="text-muted-foreground">
            Canjea tus puntos acumulados o solicita puntos a tu líder.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => router.push("/points/my-requests")}
          >
            <ClipboardList className="h-4 w-4" />
            Mis Solicitudes
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => router.push("/points/history")}
          >
            <History className="h-4 w-4" />
            Ver Historial
          </Button>
        </div>
      </div>

      {isLoadingData && !wallet ? (
        <Skeleton className="w-full h-[200px] rounded-xl" />
      ) : wallet ? (
        <PointsSummary
          userPoints={wallet.total}
          rewards={rewards}
          onRequestPointsClick={() => setIsRequestModalOpen(true)}
        />
      ) : null}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Recompensas Disponibles
        </h2>

        <RewardsGrid
          rewards={rewards}
          userPoints={wallet?.total || 0}
          onRedeem={handleRedeem}
          isLoading={isLoading}
          redeemingId={redeemingId}
        />
      </div>

      <RequestPointsModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleRequestPoints}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
