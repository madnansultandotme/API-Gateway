import api from './client'
import { User } from './auth'
import { APIKey } from './keys'

export const listUsers = async (): Promise<User[]> => {
  const { data } = await api.get('/admin/users')
  return data
}

export const suspendUser = async (userId: string): Promise<void> => {
  await api.post(`/admin/users/${userId}/suspend`)
}

export const activateUser = async (userId: string): Promise<void> => {
  await api.post(`/admin/users/${userId}/activate`)
}

export const listAllKeys = async (): Promise<(APIKey & { user_id: string })[]> => {
  const { data } = await api.get('/admin/keys')
  return data
}

export const adminRevokeKey = async (keyId: string): Promise<void> => {
  await api.post(`/admin/keys/${keyId}/revoke`)
}
