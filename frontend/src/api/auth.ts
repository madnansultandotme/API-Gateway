import api from './client'

export interface User {
  id: string
  email: string
  role: 'admin' | 'client'
  is_active: boolean
  created_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const formData = new URLSearchParams()
  formData.append('username', email)
  formData.append('password', password)
  
  const { data } = await api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  return data
}

export const register = async (email: string, password: string, role: string = 'client'): Promise<User> => {
  const { data } = await api.post('/auth/register', { email, password, role })
  return data
}

export const getMe = async (): Promise<User> => {
  const { data } = await api.get('/auth/me')
  return data
}
