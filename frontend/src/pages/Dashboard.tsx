import { useQuery } from '@tanstack/react-query'
import { getMyUsage } from '../api/usage'
import { getMySubscription } from '../api/subscriptions'
import { listPlans } from '../api/plans'
import { listAPIKeys } from '../api/keys'
import {
  Grid, Paper, Typography, Box, CircularProgress, Alert, LinearProgress
} from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { data: usage, isLoading: usageLoading } = useQuery({ queryKey: ['myUsage'], queryFn: () => getMyUsage(30) })
  const { data: subscription } = useQuery({ queryKey: ['mySubscription'], queryFn: getMySubscription })
  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: listPlans })
  const { data: keys } = useQuery({ queryKey: ['myKeys'], queryFn: listAPIKeys })

  const currentPlan = plans?.find(p => p.id === subscription?.plan_id)
  const usagePercent = currentPlan ? (subscription?.usage_count || 0) / currentPlan.monthly_limit * 100 : 0

  const chartData = usage ? Object.entries(usage.requests_by_day)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, requests: count })) : []

  if (usageLoading) return <CircularProgress />

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Total Requests</Typography>
            <Typography variant="h3">{usage?.total_requests || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Success Rate</Typography>
            <Typography variant="h3">
              {usage?.total_requests ? Math.round(usage.successful_requests / usage.total_requests * 100) : 0}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Active API Keys</Typography>
            <Typography variant="h3">{keys?.filter(k => k.is_active).length || 0}</Typography>
          </Paper>
        </Grid>
        
        {currentPlan && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Plan: {currentPlan.name}</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography>Usage: {subscription?.usage_count || 0} / {currentPlan.monthly_limit}</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(usagePercent, 100)} 
                  color={usagePercent > 80 ? 'warning' : 'primary'}
                  sx={{ mt: 1, height: 10, borderRadius: 5 }}
                />
                {usagePercent >= 80 && <Alert severity="warning" sx={{ mt: 2 }}>You've used 80% of your quota!</Alert>}
              </Box>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Requests Over Time</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="requests" stroke="#1976d2" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
