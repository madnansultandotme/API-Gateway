import api from './client'

export interface Plan {
  id: string
  name: string
  monthly_limit: number
  rate_limit_per_minute: number
  allowed_services: string[]
  created_at: string
}

export const listPlans = async (): Promise<Plan[]> => {
  const { data } = await api.get('/plans/')
  return data
}

export const createPlan = async (plan: Omit<Plan, 'id' | 'created_at'>): Promise<Plan> => {
  const { data } = await api.post('/plans/', plan)
  return data
}

export const updatePlan = async (id: string, plan: Partial<Plan>): Promise<Plan> => {
  const { data } = await api.put(`/plans/${id}`, plan)
  return data
}

export const deletePlan = async (id: string): Promise<void> => {
  await api.delete(`/plans/${id}`)
}
