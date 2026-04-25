'use client'

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
// import { pointsService } from "@/lib/api/points.service"
import {  Wallet } from "@/types/points.types"
import { PointsSummary } from "@/components/points/PointsSummary"
import { RewardsGrid } from "@/components/points/RewardsGrid"
import { RequestPointsModal } from "@/components/points/RequestPointsModal"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/axios"
import { useRewards } from "@/hooks/useRewards"

interface Reward {
  rewardId:string,
  name:string,
  description:string,
  cost:number,
  stock:number,
  isActive:boolean,
  imageUrl:string,
  createdAt: string
}

interface RewardResponse {
  rewards: Reward[]
}


export default function PointsPage() {
  const { user } = useAuth()
  
  // const [rewards, setRewards] = useState<Reward[]>([])
  const [wallet, setWallet] = useState<Wallet | null>(null)
  
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  // const [isLoadingRewards, setIsLoadingRewards] = useState(true)

  const { rewards, isLoading, reload } = useRewards();

  // const loadRewards = async () => {
  //   try {
  //     setIsLoadingRewards(true)
      
  //     const response = await api.get<RewardResponse>('/points/rewards', { skip401Redirect: true });
  //     setRewards(response.data.rewards);

  //   } catch (error) {
  //     console.error("Error loading rewards data:", error)
  //     toast.error("Error al cargar la información de recompensas")
  //   } finally {
  //     setIsLoadingRewards(false)
  //   }
  // }

  // const loadData = useCallback(async () => {
  //   setIsLoadingData(true)
  //   try {
  //     const [rewardsData, walletData] = await Promise.all([
  //       pointsService.getRewards(),
  //       pointsService.getWallet()
  //     ])
  //     // setRewards(rewardsData)
  //     setWallet(walletData)
  //   } catch (error) {
  //     console.error("Error loading points data:", error)
  //     toast.error("Error al cargar la información de recompensas")
  //   } finally {
  //     setIsLoadingData(false)
  //   }
  // }, [])

  // useEffect(() => {
  //   loadData()
  //   loadRewards()
  // }, [loadData, loadRewards])

  // const handleRedeem = async (rewardId: string) => {
  //   try {
  //     setRedeemingId(rewardId)
  //     const res = await pointsService.redeemReward({ rewardId })
      
  //     if (res.success) {
  //       toast.success(res.message)
  //       // Refresh wallet to get updated points
  //       const updatedWallet = await pointsService.getWallet()
  //       setWallet(updatedWallet)
  //     }
  //   } catch (error: any) {
  //     toast.error(error.message || "Error al procesar la redención")
  //   } finally {
  //     setRedeemingId(null)
  //   }
  // }

  // const handleRequestPoints = async (reason: string, amount: number) => {
  //   try {
  //     setIsSubmittingRequest(true)
  //     const res = await pointsService.requestPoints({ reason, amount })
      
  //     if (res.success) {
  //       toast.success(res.message)
  //       setIsRequestModalOpen(false)
  //     }
  //   } catch (error: any) {
  //     toast.error(error.message || "Error al enviar la solicitud")
  //   } finally {
  //     setIsSubmittingRequest(false)
  //   }
  // }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Centro de Recompensas</h1>
        <p className="text-muted-foreground">
          Canjea tus puntos acumulados o solicita puntos a tu líder.
        </p>
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
        <h2 className="text-xl font-semibold tracking-tight">Recompensas Disponibles</h2>
        
        <RewardsGrid 
          rewards={rewards} 
          userPoints={wallet?.total || 0} 
          // onRedeem={handleRedeem}
          isLoading={isLoading}
          // redeemingId={redeemingId}
        />
      </div>

      {/* <RequestPointsModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleRequestPoints}
        isSubmitting={isSubmittingRequest}
      /> */}
    </div>
  )
}