import React from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';
import {
  Build as BuildIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MCPPage: React.FC = () => {
  const servers = [
    { name: 'Playwright MCP', status: 'running', description: 'Servidor MCP para automação Playwright' },
    { name: 'Context7 MCP', status: 'stopped', description: 'Servidor MCP para documentação Context7' },
    { name: 'Custom MCP', status: 'running', description: 'Servidor MCP personalizado' },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 'none' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
          Gerenciamento MCP
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie servidores e ferramentas do Model Context Protocol (MCP)
        </Typography>
      </Box>

      {/* Estatísticas MCP */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Servidores Ativos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                    2
                  </Typography>
                </Box>
                <BuildIcon sx={{ fontSize: 40, color: '#10b981' }} />
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total de Servidores
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                    3
                  </Typography>
                </Box>
                <SettingsIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Ferramentas Disponíveis
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                    12
                  </Typography>
                </Box>
                <BuildIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>

      {/* Lista de Servidores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Servidores MCP
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {servers.map((server) => (
                <Box
                  key={server.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {server.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {server.description}
                    </Typography>
                    <Chip
                      label={server.status === 'running' ? 'Ativo' : 'Parado'}
                      color={server.status === 'running' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {server.status === 'running' ? (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<StopIcon />}
                        size="small"
                      >
                        Parar
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        color="success"
                        startIcon={<PlayIcon />}
                        size="small"
                      >
                        Iniciar
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<SettingsIcon />}
                      size="small"
                    >
                      Configurar
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default MCPPage; 