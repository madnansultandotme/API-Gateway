import api from './client'

export interface UsageStats {
  total_requests: number
  successful_requests: number
  failed_requests: number
  requests_by_endpoint: Record<string, number>
  requests_by_day: Record<string, number>
}

export const getMyUsage = async (days: number = 30): Promise<UsageStats> => {
  const { data } = await api.get(`/usage/my?days=${days}`)
  return data
}

export const getGlobalUsage = async (days: number = 30): Promise<UsageStats> => {
  const { data } = await api.get(`/usage/global?days=${days}`)
  return data
}

export const getUserUsage = async (userId: string, days: number = 30): Promise<UsageStats> => {
  const { data } = await api.get(`/usage/user/${userId}?days=${days}`)
  return data
}
