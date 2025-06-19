import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient, { BetFilters, CreateBetData } from '@/lib/api-client'

export function useBets(filters?: BetFilters) {
  return useQuery({
    queryKey: ['bets', filters],
    queryFn: () => apiClient.getBets(filters),
  })
}

export function useBet(id: string) {
  return useQuery({
    queryKey: ['bets', id],
    queryFn: () => apiClient.getBet(id),
    enabled: !!id,
  })
}

export function useBetStats() {
  return useQuery({
    queryKey: ['bet-stats'],
    queryFn: () => apiClient.getBetStats(),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useCreateBet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBetData) => apiClient.createBet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bets'] })
      queryClient.invalidateQueries({ queryKey: ['bet-stats'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export function useUpdateBet(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<CreateBetData>) => apiClient.updateBet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bets'] })
      queryClient.invalidateQueries({ queryKey: ['bets', id] })
      queryClient.invalidateQueries({ queryKey: ['bet-stats'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export function useDeleteBet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteBet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bets'] })
      queryClient.invalidateQueries({ queryKey: ['bet-stats'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}