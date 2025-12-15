import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listAPIKeys, createAPIKey, revokeAPIKey, rotateAPIKey, APIKeyCreated } from '../api/keys'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Chip, Alert, IconButton, Checkbox, FormControlLabel, FormGroup
} from '@mui/material'
import { Delete, Refresh, ContentCopy } from '@mui/icons-material'

const SERVICES = ['weather', 'currency', 'random-fact', 'ip-lookup']

export default function APIKeys() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('')
  const [newKey, setNewKey] = useState<APIKeyCreated | null>(null)
  const queryClient = useQueryClient()

  const { data: keys, isLoading } = useQuery({ queryKey: ['myKeys'], queryFn: listAPIKeys })

  const createMutation = useMutation({
    mutationFn: () => createAPIKey(name, selectedServices, expiresInDays || undefined),
    onSuccess: (data) => {
      setNewKey(data)
      queryClient.invalidateQueries({ queryKey: ['myKeys'] })
      setName('')
      setSelectedServices([])
      setExpiresInDays('')
    }
  })

  const revokeMutation = useMutation({
    mutationFn: revokeAPIKey,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myKeys'] })
  })

  const rotateMutation = useMutation({
    mutationFn: rotateAPIKey,
    onSuccess: (data) => {
      setNewKey(data)
      queryClient.invalidateQueries({ queryKey: ['myKeys'] })
    }
  })

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">API Keys</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Create New Key</Button>
      </Box>

      {newKey && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setNewKey(null)}>
          <Typography fontWeight="bold">Save this key now - it won't be shown again!</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <code style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>{newKey.key}</code>
            <IconButton onClick={() => copyToClipboard(newKey.key)}><ContentCopy /></IconButton>
          </Box>
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Prefix</TableCell>
              <TableCell>Services</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {keys?.map((key) => (
              <TableRow key={key.id}>
                <TableCell>{key.name}</TableCell>
                <TableCell><code>{key.prefix}...</code></TableCell>
                <TableCell>
                  {key.allowed_services.length === 0 ? 'All' : key.allowed_services.map(s => (
                    <Chip key={s} label={s} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>
                  <Chip label={key.is_active ? 'Active' : 'Revoked'} color={key.is_active ? 'success' : 'error'} size="small" />
                </TableCell>
                <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{key.expires_at ? new Date(key.expires_at).toLocaleDateString() : 'Never'}</TableCell>
                <TableCell>
                  {key.is_active && (
                    <>
                      <IconButton onClick={() => rotateMutation.mutate(key.id)} title="Rotate"><Refresh /></IconButton>
                      <IconButton onClick={() => revokeMutation.mutate(key.id)} title="Revoke" color="error"><Delete /></IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create API Key</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Key Name" margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField fullWidth label="Expires in Days (optional)" type="number" margin="normal" 
            value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : '')} />
          <Typography sx={{ mt: 2 }}>Allowed Services (leave empty for all):</Typography>
          <FormGroup row>
            {SERVICES.map(service => (
              <FormControlLabel key={service} control={
                <Checkbox checked={selectedServices.includes(service)} onChange={() => handleServiceToggle(service)} />
              } label={service} />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { createMutation.mutate(); setOpen(false); }} disabled={!name}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
