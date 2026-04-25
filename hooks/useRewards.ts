'use client'

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export interface Reward {
    rewardId: string;
    name: string;
    description: string;
    cost: number;
    stock: number | null;
    isActive: boolean;
    imageUrl: string;
    createdAt: string;
}

interface RewardResponse {
    rewards: Reward[];
}

export function useRewards() {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [isLoading, setIsLoading] = useState(true)

    const loadRewards = useCallback(async () => {
        try {
            setIsLoading(true);

            const res = await api.get<RewardResponse>('/points/rewards', { skip401Redirect: true });

            setRewards(res.data.rewards);
        } catch (error: any) {
           console.error('Error loading rewards:', error)
           toast.error(
            error?.response?.data?.message || 'Error al cargar recompensas'
           ) 
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadRewards()
    }, [loadRewards])


    return {
        rewards,
        isLoading,
        reload: loadRewards
    }
}