import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => apiClient.getAnalyticsOverview(),
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useBettingTrends(days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'trends', days],
    queryFn: () => apiClient.getBettingTrends(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSportBreakdown() {
  return useQuery({
    queryKey: ['analytics', 'sports'],
    queryFn: () => apiClient.getSportBreakdown(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useBetTypeAnalysis() {
  return useQuery({
    queryKey: ['analytics', 'bet-types'],
    queryFn: () => apiClient.getBetTypeAnalysis(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useBankrollHistory(days: number = 90) {
  return useQuery({
    queryKey: ['analytics', 'bankroll', days],
    queryFn: () => apiClient.getBankrollHistory(days),
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useInsights() {
  return useQuery({
    queryKey: ['analytics', 'insights'],
    queryFn: () => apiClient.getInsights(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}