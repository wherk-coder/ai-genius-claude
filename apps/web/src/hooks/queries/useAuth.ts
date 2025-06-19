import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import apiClient, { RegisterData } from '@/lib/api-client'

export function useLogin() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password, rememberMe }: { email: string; password: string; rememberMe?: boolean }) =>
      apiClient.login(email, password, rememberMe),
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user)
      router.push('/dashboard')
    },
  })
}

export function useRegister() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterData) => apiClient.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user)
      router.push('/dashboard')
    },
  })
}

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      queryClient.clear()
      router.push('/login')
    },
  })
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<{ name: string; email: string }>) =>
      apiClient.updateMe(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}