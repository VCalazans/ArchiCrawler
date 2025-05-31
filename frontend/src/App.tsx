import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TestFlowsPage from './pages/TestFlowsPage';
import ScrapingPage from './pages/ScrapingPage';
import MCPPage from './pages/MCPPage';
import SettingsPage from './pages/SettingsPage';
import LLMTestsPage from './pages/LLMTestsPage';

// Criar instância do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
    },
  },
});

// Tema dark moderno inspirado no EvoDI
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#10b981', // Verde esmeralda
      dark: '#059669',
      light: '#34d399',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3b82f6', // Azul vibrante
      dark: '#1d4ed8',
      light: '#60a5fa',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f172a', // Azul escuro profundo
      paper: '#1e293b', // Azul escuro médio
    },
    text: {
      primary: '#f8fafc', // Texto principal claro
      secondary: '#94a3b8', // Texto secundário
    },
    success: {
      main: '#10b981',
      dark: '#059669',
      light: '#34d399',
    },
    warning: {
      main: '#f59e0b',
      dark: '#d97706',
      light: '#fbbf24',
    },
    error: {
      main: '#ef4444',
      dark: '#dc2626',
      light: '#f87171',
    },
    info: {
      main: '#3b82f6',
      dark: '#1d4ed8',
      light: '#60a5fa',
    },
    divider: '#334155',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { 
      fontWeight: 700,
      color: '#f8fafc',
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: { 
      fontWeight: 600,
      color: '#f8fafc',
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: { 
      fontWeight: 600,
      color: '#f8fafc',
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: { 
      fontWeight: 600,
      color: '#f8fafc',
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: { 
      fontWeight: 600,
      color: '#f8fafc',
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: { 
      fontWeight: 600,
      color: '#f8fafc',
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      color: '#e2e8f0',
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      color: '#94a3b8',
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0f172a',
          backgroundImage: 'radial-gradient(circle at 25% 25%, #1e293b 0%, #0f172a 50%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          padding: '10px 24px',
          fontSize: '0.95rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)',
          '&:hover': {
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
          },
        },
        outlined: {
          borderColor: '#334155',
          color: '#e2e8f0',
          '&:hover': {
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#1e293b',
          backgroundImage: 'linear-gradient(145deg, #1e293b 0%, #334155 100%)',
          border: '1px solid #334155',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
            border: '1px solid #475569',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          backgroundImage: 'linear-gradient(145deg, #1e293b 0%, #334155 100%)',
          border: '1px solid #334155',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#334155',
            borderRadius: 12,
            '& fieldset': {
              borderColor: '#475569',
            },
            '&:hover fieldset': {
              borderColor: '#64748b',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#10b981',
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root': {
            color: '#94a3b8',
            '&.Mui-focused': {
              color: '#10b981',
            },
          },
          '& .MuiOutlinedInput-input': {
            color: '#e2e8f0',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid #334155',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e293b',
          backgroundImage: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
          borderRight: '1px solid #334155',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            color: '#10b981',
            '&:hover': {
              backgroundColor: 'rgba(16, 185, 129, 0.3)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: '#334155',
          color: '#e2e8f0',
        },
      },
    },
  },
});

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Componente para rotas públicas
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Routes>
              {/* Rotas Públicas */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />

              {/* Rotas Protegidas */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DashboardPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/test-flows"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TestFlowsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/scraping"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ScrapingPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/mcp"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <MCPPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <SettingsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/llm-tests"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <LLMTestsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
