'use client'

import { Reward } from "@/types/points.types"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

interface RewardCardProps {
  reward: Reward
  userPoints?: number
  onRedeem?: (rewardId: string) => void
  isRedeeming?: boolean
}

export function RewardCard({ reward, userPoints, onRedeem, isRedeeming }: RewardCardProps) {
  const canRedeem = userPoints === undefined || userPoints >= reward.cost

  return (
    <div 
      className="group relative w-full h-[140px] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      style={{ filter: 'drop-shadow(0px 8px 12px rgba(0, 0, 0, 0.08))' }}
      onClick={() => onRedeem && canRedeem && !isRedeeming ? onRedeem(reward.rewardId) : undefined}
    >
      <div 
        className={`w-full h-full rounded-2xl flex items-center justify-between p-6 pl-8 overflow-hidden transition-colors ${canRedeem ? 'bg-white' : 'bg-gray-50 opacity-90'}`}
        style={{
          WebkitMaskImage: 'radial-gradient(circle at 0 50%, transparent 12px, black 13px), radial-gradient(circle at 100% 50%, transparent 12px, black 13px)',
          WebkitMaskPosition: 'left center, right center',
          WebkitMaskSize: '51% 100%, 51% 100%',
          WebkitMaskRepeat: 'no-repeat',
          maskImage: 'radial-gradient(circle at 0 50%, transparent 12px, black 13px), radial-gradient(circle at 100% 50%, transparent 12px, black 13px)',
          maskPosition: 'left center, right center',
          maskSize: '51% 100%, 51% 100%',
          maskRepeat: 'no-repeat'
        }}
      >
        {/* Left Side: Info */}
        <div className="flex flex-col justify-center flex-1 pr-4">
          <Badge variant="secondary" className="flex w-fit items-center gap-1 mb-2 bg-muted/50">
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <span className="font-bold text-sm">{reward.cost.toLocaleString()} pts</span>
          </Badge>
          <p className="text-[15px] text-gray-800 font-medium leading-tight line-clamp-2">
            {reward.name}
          </p>
        </div>

        {/* Right Side: Image */}
        <div className="flex-shrink-0 w-24 h-24 relative flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={reward.imageUrl} 
            alt={reward.name} 
            className={`max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-md ${!canRedeem ? 'grayscale' : ''}`}
          />
        </div>
        
        {/* Overlay for redeeming state */}
        {isRedeeming && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <span className="font-bold text-primary bg-white px-3 py-1 rounded-full shadow-sm text-sm">Procesando...</span>
          </div>
        )}
      </div>
    </div>
  )
}
