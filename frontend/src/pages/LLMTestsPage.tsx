import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Brain,
  Plus,
  Settings,
  BarChart3,
  Key,
  PlayCircle,
  TrendingUp,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Components do módulo LLM Tests
import LLMTestGenerator from '../components/LLMTests/LLMTestGenerator';
import LLMTestsList from '../components/LLMTests/LLMTestsList';
import LLMApiKeysManager from '../components/LLMTests/LLMApiKeysManager';
import LLMTestsDashboard from '../components/LLMTests/LLMTestsDashboard';
import LLMTestsSettings from '../components/LLMTests/LLMTestsSettings';
import LLMTestExecutions from '../components/LLMTests/LLMTestExecutions';

// Hooks
import { useDashboard, useHealthCheck, useLLMNotifications } from '../hooks/useLLMTests';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`llm-tests-tabpanel-${index}`}
      aria-labelledby={`llm-tests-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const LLMTestsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { dashboard, isLoading: isDashboardLoading } = useDashboard();
  const { health, isLoading: isHealthLoading } = useHealthCheck();
  const { notifications, removeNotification } = useLLMNotifications();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getHealthStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'unhealthy': return 'error';
      default: return 'info';
    }
  };

  const getHealthStatusIcon = (status?: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={20} />;
      case 'degraded': return <AlertTriangle size={20} />;
      case 'unhealthy': return <AlertTriangle size={20} />;
      default: return <Clock size={20} />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header com informações do módulo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Brain size={32} className="text-emerald-500 mr-3" />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Testes com IA
            </Typography>
            <Chip 
              label="Beta" 
              color="primary" 
              size="small" 
              sx={{ ml: 2 }} 
            />
          </Box>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Gere testes automatizados usando Large Language Models (LLMs) com comandos MCP integrados
          </Typography>

          {/* Status Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Health Status */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {dashboard?.totalTests || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Testes Criados
                      </Typography>
                    </Box>
                    <Zap className="text-blue-500" size={24} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {dashboard?.validatedTests || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Testes Validados
                      </Typography>
                    </Box>
                    <CheckCircle className="text-green-500" size={24} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {dashboard?.averageScore?.toFixed(1) || '0.0'}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Score Médio
                      </Typography>
                    </Box>
                    <TrendingUp className="text-emerald-500" size={24} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
                    <Box>
                      <Chip
                        icon={getHealthStatusIcon(health?.status)}
                        label={health?.status || 'Verificando...'}
                        color={getHealthStatusColor(health?.status)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Status do Sistema
                    </Typography>
                  </Box>
                  {(isHealthLoading || isDashboardLoading) && (
                    <LinearProgress sx={{ mt: 1 }} />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </motion.div>

      {/* Notificações */}
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          severity={notification.type}
          onClose={() => removeNotification(notification.id)}
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2">{notification.title}</Typography>
          <Typography variant="body2">{notification.message}</Typography>
        </Alert>
      ))}

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 72,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                px: 3,
              },
            }}
          >
            <Tab
              icon={<BarChart3 size={20} />}
              label="Dashboard"
              id="llm-tests-tab-0"
              aria-controls="llm-tests-tabpanel-0"
            />
            <Tab
              icon={<Plus size={20} />}
              label="Gerar Teste"
              id="llm-tests-tab-1"
              aria-controls="llm-tests-tabpanel-1"
            />
            <Tab
              icon={<Brain size={20} />}
              label="Meus Testes"
              id="llm-tests-tab-2"
              aria-controls="llm-tests-tabpanel-2"
            />
            <Tab
              icon={<PlayCircle size={20} />}
              label="Execuções"
              id="llm-tests-tab-3"
              aria-controls="llm-tests-tabpanel-3"
            />
            <Tab
              icon={<Key size={20} />}
              label="API Keys"
              id="llm-tests-tab-4"
              aria-controls="llm-tests-tabpanel-4"
            />
            <Tab
              icon={<Settings size={20} />}
              label="Configurações"
              id="llm-tests-tab-5"
              aria-controls="llm-tests-tabpanel-5"
            />
          </Tabs>
        </Paper>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        {/* Dashboard */}
        <TabPanel value={tabValue} index={0}>
          <LLMTestsDashboard />
        </TabPanel>

        {/* Gerar Teste */}
        <TabPanel value={tabValue} index={1}>
          <LLMTestGenerator onTestGenerated={() => setTabValue(2)} />
        </TabPanel>

        {/* Meus Testes */}
        <TabPanel value={tabValue} index={2}>
          <LLMTestsList />
        </TabPanel>

        {/* Execuções */}
        <TabPanel value={tabValue} index={3}>
          <LLMTestExecutions />
        </TabPanel>

        {/* API Keys */}
        <TabPanel value={tabValue} index={4}>
          <LLMApiKeysManager />
        </TabPanel>

        {/* Configurações */}
        <TabPanel value={tabValue} index={5}>
          <LLMTestsSettings />
        </TabPanel>
      </motion.div>

      {/* Floating Action Button para Quick Actions */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Tooltip title="Gerar Novo Teste">
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Plus size={20} />}
            onClick={() => setTabValue(1)}
            sx={{
              borderRadius: '50px',
              px: 3,
              py: 1.5,
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
              '&:hover': {
                boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Novo Teste
          </Button>
        </Tooltip>
      </Box>
    </Container>
  );
};

export default LLMTestsPage; 