import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/auth'
import {
  Container, Paper, TextField, Button, Typography, Box, Alert
} from '@mui/material'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await register(email, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch {
      setError('Registration failed. Email may already be in use.')
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Register
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Registration successful! Redirecting...</Alert>}
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
              Register
            </Button>
          </form>
          <Typography align="center" sx={{ mt: 2 }}>
            Already have an account? <Link to="/login">Login</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}
