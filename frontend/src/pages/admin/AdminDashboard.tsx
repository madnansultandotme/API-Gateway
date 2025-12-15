import { useQuery } from '@tanstack/react-query'
import { getGlobalUsage } from '../../api/usage'
import { listUsers } from '../../api/admin'
import { listPlans } from '../../api/plans'
import { listAllKeys } from '../../api/admin'
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const { data: usage, isLoading } = useQuery({ queryKey: ['globalUsage'], queryFn: () => getGlobalUsage(30) })
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: listUsers })
  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: listPlans })
  const { data: keys } = useQuery({ queryKey: ['allKeys'], queryFn: listAllKeys })

  if (isLoading) return <CircularProgress />

  const chartData = usage ? Object.entries(usage.requests_by_day)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, requests: count })) : []

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h3">{users?.length || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Active Plans</Typography>
            <Typography variant="h3">{plans?.length || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">API Keys</Typography>
            <Typography variant="h3">{keys?.length || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Total Requests</Typography>
            <Typography variant="h3">{usage?.total_requests || 0}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Platform Usage (Last 30 Days)</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="requests" stroke="#1976d2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
