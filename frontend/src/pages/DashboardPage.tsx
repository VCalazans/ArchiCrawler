import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PlayArrow as PlayIcon,
  Assessment as AssessmentIcon,
  Cloud as CloudIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Fluxos de Teste', value: 12, icon: <PlayIcon />, color: '#3b82f6' },
    { title: 'Execuções Hoje', value: 45, icon: <AssessmentIcon />, color: '#10b981' },
    { title: 'Taxa de Sucesso', value: '94%', icon: <DashboardIcon />, color: '#f59e0b' },
    { title: 'Servidores MCP', value: 3, icon: <CloudIcon />, color: '#8b5cf6' },
  ];

  const quickActions = [
    { title: 'Criar Fluxo', href: '/test-flows' },
    { title: 'Web Scraping', href: '/scraping' },
    { title: 'Gerenciar MCP', href: '/mcp' },
    { title: 'Configurações', href: '/settings' },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 'none' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
          Dashboard - ArchiCrawler
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bem-vindo à plataforma de testes de interface mais inovadora, {user?.username}!
        </Typography>
      </Box>

      {/* Estatísticas */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: { xs: 2, sm: 3, md: 4 },
          mb: { xs: 3, md: 4 },
        }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              sx={{
                height: '100%',
                minHeight: 160,
                background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)`,
                border: `1px solid ${stat.color}20`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: stat.color, width: { xs: 50, sm: 56, md: 64 }, height: { xs: 50, sm: 56, md: 64 } }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* Layout Principal */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '2fr 1fr',
          },
          gridTemplateRows: 'auto auto',
          gap: { xs: 3, md: 4 },
          minHeight: '400px',
        }}
      >
        {/* Ações Rápidas - Ocupa toda a primeira linha em telas pequenas */}
        <Box
          sx={{
            gridColumn: { xs: '1', lg: '1' },
            gridRow: { xs: '1', lg: '1' },
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card sx={{ height: '100%', minHeight: 200 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Ações Rápidas
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(2, 1fr)',
                      lg: 'repeat(2, 1fr)',
                      xl: 'repeat(4, 1fr)',
                    },
                    gap: { xs: 2, sm: 3 },
                  }}
                >
                  {quickActions.map((action) => (
                    <Button
                      key={action.title}
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        py: 2.5, 
                        borderRadius: 2,
                        minHeight: 56,
                        fontWeight: 500,
                      }}
                      href={action.href}
                    >
                      {action.title}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Informações do Sistema */}
        <Box
          sx={{
            gridColumn: { xs: '1', lg: '2' },
            gridRow: { xs: '2', lg: '1' },
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card sx={{ height: '100%', minHeight: 200 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Sistema
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 500 }}>
                      Online
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Versão
                    </Typography>
                    <Typography variant="body2">
                      v1.0.0
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Usuário
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user?.username} ({user?.role})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Última Conexão
                    </Typography>
                    <Typography variant="body2">
                      Agora
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Sessões Ativas
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 500 }}>
                      1
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Atividade Recente - Nova seção para preencher espaço */}
        <Box
          sx={{
            gridColumn: { xs: '1', lg: '1 / -1' },
            gridRow: { xs: '3', lg: '2' },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card sx={{ minHeight: 200 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Atividade Recente
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Avatar sx={{ bgcolor: '#10b981', width: 32, height: 32 }}>
                      <PlayIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Fluxo de teste "Login Principal" executado com sucesso
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        há 5 minutos
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Avatar sx={{ bgcolor: '#3b82f6', width: 32, height: 32 }}>
                      <DashboardIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Dashboard acessado pelo usuário admin
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        há 1 minuto
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Avatar sx={{ bgcolor: '#f59e0b', width: 32, height: 32 }}>
                      <CloudIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Servidor MCP Playwright iniciado
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        há 10 minutos
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage; 