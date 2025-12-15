import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login, getMe } from '../api/auth'
import {
  Container, Paper, TextField, Button, Typography, Box, Alert
} from '@mui/material'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const { access_token } = await login(email, password)
      localStorage.setItem('token', access_token)
      const user = await getMe()
      setUser(user)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch {
      setError('Invalid credentials')
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            API Platform Login
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" type="email" margin="normal"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
            <TextField
              fullWidth label="Password" type="password" margin="normal"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
              Login
            </Button>
          </form>
          <Typography align="center" sx={{ mt: 2 }}>
            Don't have an account? <Link to="/register">Register</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}
