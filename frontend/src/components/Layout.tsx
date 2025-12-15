import { Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  AppBar, Toolbar, Typography, Button, Box, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Divider
} from '@mui/material'
import {
  Dashboard, VpnKey, Assessment, People, Settings, Logout, Api
} from '@mui/icons-material'

const drawerWidth = 240

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const clientMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'API Keys', icon: <VpnKey />, path: '/keys' },
    { text: 'Usage', icon: <Assessment />, path: '/usage' },
    { text: 'Test APIs', icon: <Api />, path: '/test' },
  ]

  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'Plans', icon: <Settings />, path: '/admin/plans' },
    { text: 'Global Usage', icon: <Assessment />, path: '/admin/usage' },
  ]

  const menuItems = user?.role === 'admin' ? adminMenuItems : clientMenuItems

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            API Platform
          </Typography>
          <Typography sx={{ mr: 2 }}>{user?.email}</Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.path}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {user?.role === 'admin' && (
            <>
              <Divider />
              <List>
                {clientMenuItems.map((item) => (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton component={Link} to={item.path}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
