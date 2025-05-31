import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  PlayArrow,
  Web,
  Settings,
  AccountCircle,
  Logout,
  Build,
  Notifications,
  Search,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 280;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', badge: null },
    { text: 'Fluxos de Teste', icon: <PlayArrow />, path: '/test-flows', badge: 3 },
    { text: 'Web Scraping', icon: <Web />, path: '/scraping', badge: null },
    { text: 'MCP', icon: <Build />, path: '/mcp', badge: 'NEW' },
    { text: 'Configurações', icon: <Settings />, path: '/settings', badge: null },
  ];

  const drawer = (
    <Box sx={{ height: '100%', background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)' }}>
      <Toolbar sx={{ px: 3, py: 2 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.2rem'
              }}
            >
              AC
            </Box>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: '#f8fafc',
                fontSize: '1.25rem'
              }}
            >
              ArchiCrawler
            </Typography>
          </Box>
        </motion.div>
      </Toolbar>
      
      <Divider sx={{ borderColor: 'rgba(51, 65, 85, 0.5)', mx: 2 }} />
      
      <Box sx={{ mt: 2, px: 1 }}>
        <List sx={{ py: 0 }}>
          {menuItems.map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ListItem disablePadding sx={{ mb: 1 }}>
                <Tooltip title={item.text} placement="right" arrow>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      py: 1.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        transform: 'translateX(4px)',
                        '& .MuiListItemIcon-root': {
                          color: '#10b981',
                        },
                        '& .MuiListItemText-primary': {
                          color: '#10b981',
                        }
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        borderLeft: '3px solid #10b981',
                        '& .MuiListItemIcon-root': {
                          color: '#10b981',
                        },
                        '& .MuiListItemText-primary': {
                          color: '#10b981',
                          fontWeight: 600,
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        },
                      },
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: '#94a3b8',
                        minWidth: 40,
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.95rem',
                          fontWeight: 500,
                          color: '#e2e8f0',
                          transition: 'color 0.2s ease'
                        }
                      }}
                    />
                    {item.badge && (
                      <Badge
                        badgeContent={item.badge}
                        color={typeof item.badge === 'string' ? 'secondary' : 'primary'}
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: typeof item.badge === 'string' ? '#f59e0b' : '#10b981',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            minWidth: '20px',
                            height: '20px',
                          }
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            </motion.div>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              color: '#e2e8f0',
              '&:hover': {
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981'
              }
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                color: '#f8fafc',
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Pesquisar" arrow>
              <IconButton
                sx={{ 
                  color: '#94a3b8',
                  '&:hover': {
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981'
                  }
                }}
              >
                <Search />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notificações" arrow>
              <IconButton
                sx={{ 
                  color: '#94a3b8',
                  '&:hover': {
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981'
                  }
                }}
              >
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Perfil" arrow>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                sx={{ 
                  color: '#e2e8f0',
                  '&:hover': {
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>

            <AnimatePresence>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                  mt: 1,
                  '& .MuiPaper-root': {
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 2,
                    minWidth: 200,
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                  }
                }}
              >
                <MenuItem 
                  onClick={handleClose}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: '#94a3b8' }}>
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    sx={{ color: '#e2e8f0' }}
                    primary={user?.username}
                    secondary="Ver perfil"
                    secondaryTypographyProps={{ sx: { color: '#64748b' } }}
                  />
                </MenuItem>
                <Divider sx={{ borderColor: '#334155' }} />
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      '& .MuiListItemIcon-root': {
                        color: '#ef4444'
                      },
                      '& .MuiListItemText-primary': {
                        color: '#ef4444'
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: '#94a3b8' }}>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText sx={{ color: '#e2e8f0' }}>
                    Sair
                  </ListItemText>
                </MenuItem>
              </Menu>
            </AnimatePresence>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="navigation folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              backgroundImage: 'none'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              backgroundImage: 'none'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          backgroundImage: 'radial-gradient(circle at 25% 25%, #1e293b 0%, #0f172a 50%)',
        }}
      >
        <Toolbar />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box 
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              width: '100%', 
              maxWidth: '100%',
              overflow: 'hidden'
            }}
          >
            {children}
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default MainLayout; 