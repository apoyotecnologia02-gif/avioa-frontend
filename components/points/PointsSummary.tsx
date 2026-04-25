'use client'

import { Reward } from "@/types/points.types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PlusCircle, Award } from "lucide-react"

interface PointsSummaryProps {
  userPoints: number
  rewards: Reward[]
  onRequestPointsClick: () => void
}

export function PointsSummary({ userPoints, rewards, onRequestPointsClick }: PointsSummaryProps) {
  // Logic for the progress bar
  // 1. Sort rewards by cost
  // 2. Find the next reward the user CANNOT afford
  // 3. If the user can afford everything, set goal to the highest reward or a generic message.

  const sortedRewards = [...rewards].sort((a, b) => a.cost - b.cost)
  const nextReward = sortedRewards.find(r => r.cost > userPoints)
  
  let progressPercentage = 100
  let progressMessage = "¡Puedes canjear cualquier recompensa!"
  let goal = userPoints

  if (nextReward) {
    goal = nextReward.cost
    progressPercentage = Math.min(100, Math.max(0, (userPoints / goal) * 100))
    progressMessage = `Te faltan ${(goal - userPoints).toLocaleString()} pts para: ${nextReward.name}`
  } else if (sortedRewards.length > 0) {
    // Has enough for all rewards
    const highestReward = sortedRewards[sortedRewards.length - 1]
    progressMessage = `¡Tienes suficientes puntos para la recompensa máxima: ${highestReward.name}!`
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute -right-10 -top-10 bg-primary/10 w-40 h-40 rounded-full blur-3xl" />
      <div className="absolute -left-10 -bottom-10 bg-primary/10 w-40 h-40 rounded-full blur-3xl" />
      
      <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Points Info */}
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="bg-primary/20 p-4 rounded-2xl">
            <Award className="w-10 h-10 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Puntos Disponibles
            </p>
            <h2 className="text-4xl font-black text-foreground tracking-tight">
              {userPoints.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* Progress Section */}
        <div className="flex-1 w-full max-w-md px-0 md:px-8">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-muted-foreground">Progreso a siguiente meta</span>
            <span className="text-primary">{progressPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            {progressMessage}
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full md:w-auto shrink-0">
          <Button onClick={onRequestPointsClick} size="lg" className="w-full shadow-lg shadow-primary/25">
            <PlusCircle className="mr-2 h-5 w-5" />
            Solicitar Puntos
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}
