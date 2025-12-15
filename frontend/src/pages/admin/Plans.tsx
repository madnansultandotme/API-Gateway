import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listPlans, createPlan, deletePlan } from '../../api/plans'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Chip, IconButton, Checkbox, FormControlLabel, FormGroup
} from '@mui/material'
import { Delete, Add } from '@mui/icons-material'

const SERVICES = ['weather', 'currency', 'random-fact', 'ip-lookup']

export default function Plans() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [monthlyLimit, setMonthlyLimit] = useState(1000)
  const [rateLimit, setRateLimit] = useState(60)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const queryClient = useQueryClient()

  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: listPlans })

  const createMutation = useMutation({
    mutationFn: () => createPlan({
      name,
      monthly_limit: monthlyLimit,
      rate_limit_per_minute: rateLimit,
      allowed_services: selectedServices
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      setOpen(false)
      resetForm()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] })
  })

  const resetForm = () => {
    setName('')
    setMonthlyLimit(1000)
    setRateLimit(60)
    setSelectedServices([])
  }

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Plans Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Create Plan</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Monthly Limit</TableCell>
              <TableCell>Rate Limit/min</TableCell>
              <TableCell>Services</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans?.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.name}</TableCell>
                <TableCell>{plan.monthly_limit.toLocaleString()}</TableCell>
                <TableCell>{plan.rate_limit_per_minute}</TableCell>
                <TableCell>
                  {plan.allowed_services.length === 0 ? 'All' : plan.allowed_services.map(s => (
                    <Chip key={s} label={s} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>{new Date(plan.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => deleteMutation.mutate(plan.id)} color="error"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Plan</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Plan Name" margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField fullWidth label="Monthly Limit" type="number" margin="normal" value={monthlyLimit} onChange={(e) => setMonthlyLimit(parseInt(e.target.value))} />
          <TextField fullWidth label="Rate Limit (per minute)" type="number" margin="normal" value={rateLimit} onChange={(e) => setRateLimit(parseInt(e.target.value))} />
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
          <Button variant="contained" onClick={() => createMutation.mutate()} disabled={!name}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
