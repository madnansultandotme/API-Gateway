import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listAPIKeys } from '../api/keys'
import axios from 'axios'
import {
  Box, Typography, Paper, Grid, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, Alert, CircularProgress
} from '@mui/material'

const ENDPOINTS = [
  { name: 'Weather', path: '/api/services/weather', params: ['city'] },
  { name: 'Currency', path: '/api/services/currency', params: ['base', 'target'] },
  { name: 'Random Fact', path: '/api/services/random-fact', params: [] },
  { name: 'IP Lookup', path: '/api/services/ip-lookup', params: ['ip'] },
]

export default function TestAPIs() {
  const [selectedKey, setSelectedKey] = useState('')
  const [selectedEndpoint, setSelectedEndpoint] = useState(0)
  const [params, setParams] = useState<Record<string, string>>({})
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { data: keys } = useQuery({ queryKey: ['myKeys'], queryFn: listAPIKeys })
  const activeKeys = keys?.filter(k => k.is_active) || []

  const handleTest = async () => {
    if (!selectedKey) return
    setLoading(true)
    setError(null)
    setResponse(null)

    const endpoint = ENDPOINTS[selectedEndpoint]
    const queryParams = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v)
    ).toString()
    const url = `${endpoint.path}${queryParams ? '?' + queryParams : ''}`

    try {
      const key = activeKeys.find(k => k.id === selectedKey)
      const fullKey = prompt('Enter your full API key (prefix.secret):')
      if (!fullKey) return

      const res = await axios.get(url, {
        headers: { 'X-API-Key': fullKey }
      })
      setResponse(JSON.stringify(res.data, null, 2))
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Test APIs</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>API Key</InputLabel>
              <Select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)} label="API Key">
                {activeKeys.map(key => (
                  <MenuItem key={key.id} value={key.id}>{key.name} ({key.prefix}...)</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Endpoint</InputLabel>
              <Select value={selectedEndpoint} onChange={(e) => {
                setSelectedEndpoint(e.target.value as number)
                setParams({})
              }} label="Endpoint">
                {ENDPOINTS.map((ep, i) => (
                  <MenuItem key={i} value={i}>{ep.name} - {ep.path}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {ENDPOINTS[selectedEndpoint].params.map(param => (
              <TextField
                key={param}
                fullWidth
                label={param}
                margin="normal"
                value={params[param] || ''}
                onChange={(e) => setParams({ ...params, [param]: e.target.value })}
              />
            ))}

            <Button 
              variant="contained" 
              fullWidth 
              sx={{ mt: 2 }} 
              onClick={handleTest}
              disabled={!selectedKey || loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Test API'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, minHeight: 300 }}>
            <Typography variant="h6" gutterBottom>Response</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {response && (
              <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto' }}>
                {response}
              </pre>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
