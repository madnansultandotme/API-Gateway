import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listUsers, suspendUser, activateUser } from '../../api/admin'
import { listSubscriptions, assignPlan } from '../../api/subscriptions'
import { listPlans } from '../../api/plans'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Select, MenuItem, FormControl, InputLabel
} from '@mui/material'
import { Block, CheckCircle, Assignment } from '@mui/icons-material'

export default function Users() {
  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState('')
  const queryClient = useQueryClient()

  const { data: users } = useQuery({ queryKey: ['users'], queryFn: listUsers })
  const { data: subscriptions } = useQuery({ queryKey: ['subscriptions'], queryFn: listSubscriptions })
  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: listPlans })

  const suspendMutation = useMutation({
    mutationFn: suspendUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })

  const activateMutation = useMutation({
    mutationFn: activateUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })

  const assignMutation = useMutation({
    mutationFn: ({ userId, planId }: { userId: string; planId: string }) => assignPlan(userId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      setAssignOpen(false)
    }
  })

  const getUserPlan = (userId: string) => {
    const sub = subscriptions?.find(s => s.user_id === userId)
    if (!sub) return null
    return plans?.find(p => p.id === sub.plan_id)
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Users Management</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((user) => {
              const plan = getUserPlan(user.id)
              return (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Chip label={user.role} color={user.role === 'admin' ? 'primary' : 'default'} size="small" /></TableCell>
                  <TableCell>
                    <Chip label={user.is_active ? 'Active' : 'Suspended'} color={user.is_active ? 'success' : 'error'} size="small" />
                  </TableCell>
                  <TableCell>{plan?.name || 'No Plan'}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => { setSelectedUser(user.id); setAssignOpen(true); }} title="Assign Plan">
                      <Assignment />
                    </IconButton>
                    {user.is_active ? (
                      <IconButton onClick={() => suspendMutation.mutate(user.id)} color="error" title="Suspend">
                        <Block />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => activateMutation.mutate(user.id)} color="success" title="Activate">
                        <CheckCircle />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)}>
        <DialogTitle>Assign Plan</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Plan</InputLabel>
            <Select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} label="Plan">
              {plans?.map(plan => (
                <MenuItem key={plan.id} value={plan.id}>{plan.name} ({plan.monthly_limit} req/month)</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => selectedUser && assignMutation.mutate({ userId: selectedUser, planId: selectedPlan })} disabled={!selectedPlan}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
