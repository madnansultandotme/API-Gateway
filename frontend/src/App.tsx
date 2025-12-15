import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import APIKeys from './pages/APIKeys'
import Usage from './pages/Usage'
import TestAPIs from './pages/TestAPIs'
import AdminDashboard from './pages/admin/AdminDashboard'
import Users from './pages/admin/Users'
import Plans from './pages/admin/Plans'
import GlobalUsage from './pages/admin/GlobalUsage'
import { CircularProgress, Box } from '@mui/material'

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
  if (!user) return <Navigate to="/login" />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />
  
  return <>{children}</>
}

function AppRoutes() {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="keys" element={<APIKeys />} />
        <Route path="usage" element={<Usage />} />
        <Route path="test" element={<TestAPIs />} />
        
        <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
        <Route path="admin/plans" element={<ProtectedRoute adminOnly><Plans /></ProtectedRoute>} />
        <Route path="admin/usage" element={<ProtectedRoute adminOnly><GlobalUsage /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
