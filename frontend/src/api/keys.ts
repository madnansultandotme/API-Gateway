import api from './client'

export interface APIKey {
  id: string
  name: string
  prefix: string
  allowed_services: string[]
  is_active: boolean
  created_at: string
  expires_at?: string
}

export interface APIKeyCreated extends APIKey {
  key: string
}

export const createAPIKey = async (name: string, allowed_services: string[], expires_in_days?: number): Promise<APIKeyCreated> => {
  const { data } = await api.post('/keys/', { name, allowed_services, expires_in_days })
  return data
}

export const listAPIKeys = async (): Promise<APIKey[]> => {
  const { data } = await api.get('/keys/')
  return data
}

export const revokeAPIKey = async (keyId: string): Promise<void> => {
  await api.delete(`/keys/${keyId}`)
}

export const rotateAPIKey = async (keyId: string): Promise<APIKeyCreated> => {
  const { data } = await api.post(`/keys/${keyId}/rotate`)
  return data
}
