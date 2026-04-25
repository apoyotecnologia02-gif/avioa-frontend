'use client'

import { Reward } from "@/types/points.types"
import { RewardCard } from "./RewardCard"
import { Skeleton } from "@/components/ui/skeleton"

interface RewardsGridProps {
  rewards: Reward[]
  userPoints: number
  onRedeem?: (rewardId: string) => void
  isLoading: boolean
  redeemingId?: string | null
}

export function RewardsGrid({ rewards, userPoints, onRedeem, isLoading, redeemingId }: RewardsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (rewards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed">
        <h3 className="text-lg font-medium">No hay recompensas disponibles</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Vuelve más tarde para ver nuevas opciones para canjear tus puntos.
        </p>
      </div>
    )
  }

  // Ordenar recompensas por costo (de menor a mayor)
  const sortedRewards = [...rewards].sort((a, b) => a.cost - b.cost)

  console.log("sortedRewards", sortedRewards)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sortedRewards.map((reward) => (
      //  onRedeem && redeemingId && (<RewardCard
      //     key={reward.rewardId}
      //     reward={reward}
      //     // userPoints={userPoints}
      //     // onRedeem={onRedeem}
      //     // isRedeeming={redeemingId === reward.rewardId}
      //   />)
      <RewardCard key={reward.rewardId} reward={reward} />
      ))}
    </div>
  )
}
