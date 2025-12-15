import { useQuery } from '@tanstack/react-query'
import { getMyUsage } from '../api/usage'
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function Usage() {
  const { data: usage, isLoading } = useQuery({ queryKey: ['myUsage'], queryFn: () => getMyUsage(30) })

  if (isLoading) return <CircularProgress />

  const chartData = usage ? Object.entries(usage.requests_by_day)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, requests: count })) : []

  const endpointData = usage ? Object.entries(usage.requests_by_endpoint)
    .map(([name, value]) => ({ name: name.split('/').pop(), value })) : []

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Usage Statistics</Typography>
      
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

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Requests Over Time (Last 30 Days)</Typography>
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

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>By Endpoint</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={endpointData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
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
      </Grid>
    </Box>
  )
}
