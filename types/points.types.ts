export interface Reward {
  rewardId: string
  name: string
  description: string
  cost: number
  stock: number | null
  isActive: boolean
  imageUrl: string
}

export interface Wallet {
  userId: string
  total: number
}

export interface RedeemRequest {
  rewardId: string
}
