import api from './client'

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  usage_count: number
  reset_at: string
  created_at: string
}

export const getMySubscription = async (): Promise<Subscription> => {
  const { data } = await api.get('/subscriptions/my')
  return data
}

export const listSubscriptions = async (): Promise<Subscription[]> => {
  const { data } = await api.get('/subscriptions/')
  return data
}

export const assignPlan = async (userId: string, planId: string): Promise<Subscription> => {
  const { data } = await api.post('/subscriptions/', { user_id: userId, plan_id: planId })
  return data
}
