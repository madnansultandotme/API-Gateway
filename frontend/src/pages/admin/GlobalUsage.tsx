import { useQuery } from '@tanstack/react-query'
import { getGlobalUsage } from '../../api/usage'
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function GlobalUsage() {
  const { data: usage, isLoading } = useQuery({ queryKey: ['globalUsage'], queryFn: () => getGlobalUsage(30) })

  if (isLoading) return <CircularProgress />

  const chartData = usage ? Object.entries(usage.requests_by_day)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, requests: count })) : []

  const endpointData = usage ? Object.entries(usage.requests_by_endpoint)
    .map(([name, value]) => ({ name: name.split('/').pop(), value })) : []

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Global Platform Usage</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Total Requests</Typography>
            <Typography variant="h3">{usage?.total_requests || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Successful</Typography>
            <Typography variant="h3" color="success.main">{usage?.successful_requests || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Failed</Typography>
            <Typography variant="h3" color="error.main">{usage?.failed_requests || 0}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Daily Requests</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requests" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Requests by Endpoint</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={endpointData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {endpointData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Endpoint Breakdown</Typography>
            {endpointData.map((ep, i) => (
              <Box key={ep.name} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
                <Typography>{ep.name}</Typography>
                <Typography fontWeight="bold">{ep.value.toLocaleString()}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
