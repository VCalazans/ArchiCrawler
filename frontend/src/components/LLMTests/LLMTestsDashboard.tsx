import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Brain,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types
import { LLMProvider, TestType } from '../../types/llm-tests';

// Hooks
import { useDashboard, useUsageMetrics } from '../../hooks/useLLMTests';

const LLMTestsDashboard: React.FC = () => {
  const { dashboard, statistics, isLoading } = useDashboard();
  const { metrics } = useUsageMetrics(undefined, 'weekly');

  const getProviderColor = (provider: LLMProvider) => {
    switch (provider) {
      case LLMProvider.OPENAI: return '#10B981';
      case LLMProvider.ANTHROPIC: return '#8B5CF6';
      case LLMProvider.GEMINI: return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getTestTypeIcon = (type: TestType) => {
    switch (type) {
      case TestType.E2E: return '🔄';
      case TestType.VISUAL: return '👁️';
      case TestType.PERFORMANCE: return '⚡';
      case TestType.ACCESSIBILITY: return '♿';
      default: return '🧪';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Carregando dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
          Dashboard - Testes com IA
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visão geral das suas atividades de geração de testes
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Métricas Principais */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {dashboard?.totalTests || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Testes
                  </Typography>
                </Box>
                <Brain size={32} className="text-blue-500" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp size={16} className="text-green-500 mr-1" />
                <Typography variant="caption" color="success.main">
                  +12% este mês
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {dashboard?.validatedTests || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Testes Validados
                  </Typography>
                </Box>
                <CheckCircle size={32} className="text-green-500" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {dashboard?.totalTests ? 
                    `${((dashboard.validatedTests / dashboard.totalTests) * 100).toFixed(1)}% de sucesso` 
                    : '0% de sucesso'
                  }
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {dashboard?.averageScore?.toFixed(1) || '0.0'}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Score Médio
                  </Typography>
                </Box>
                <Zap size={32} className="text-amber-500" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp size={16} className="text-green-500 mr-1" />
                <Typography variant="caption" color="success.main">
                  +5.2% esta semana
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {dashboard?.weeklyStats?.reduce((acc, stat) => acc + stat.executed, 0) || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Execuções
                  </Typography>
                </Box>
                <Clock size={32} className="text-blue-500" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Esta semana
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Atividade Semanal */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Atividade dos Últimos 7 Dias
              </Typography>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'end', gap: 2, p: 2 }}>
                {dashboard?.weeklyStats?.map((stat, index) => {
                  const maxValue = Math.max(...(dashboard.weeklyStats?.map(s => s.generated) || [1]));
                  const height = (stat.generated / maxValue) * 160;
                  
                  return (
                    <Box
                      key={index}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {stat.generated}
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          height: `${height}px`,
                          bgcolor: 'primary.main',
                          borderRadius: 1,
                          opacity: 0.8,
                          '&:hover': { opacity: 1 },
                          transition: 'opacity 0.2s',
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {format(subDays(new Date(), 6 - index), 'EEE', { locale: ptBR })}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Provedores */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Provedores Mais Utilizados
              </Typography>
              <List sx={{ py: 0 }}>
                {dashboard?.topProviders?.map((provider, index) => (
                  <ListItem key={provider.provider} sx={{ px: 0 }}>
                    <Avatar
                      sx={{
                        bgcolor: getProviderColor(provider.provider),
                        width: 32,
                        height: 32,
                        mr: 2,
                      }}
                    >
                      {provider.provider.charAt(0).toUpperCase()}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {provider.provider.toUpperCase()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {provider.count} testes
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <LinearProgress
                            variant="determinate"
                            value={provider.successRate}
                            sx={{ flex: 1, mr: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {provider.successRate.toFixed(1)}%
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribuição por Tipo de Teste */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribuição por Tipo de Teste
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(dashboard?.testTypeDistribution || {}).map(([type, count]) => {
                  const total = Object.values(dashboard?.testTypeDistribution || {})
                    .reduce((acc, val) => acc + val, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  
                  return (
                    <Box key={type}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {getTestTypeIcon(type as TestType)}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {type.replace('_', ' ').toUpperCase()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {count} ({percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Testes Recentes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Testes Recentes
              </Typography>
              <List sx={{ py: 0 }}>
                {dashboard?.recentTests?.slice(0, 5).map((test) => (
                  <ListItem key={test.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {test.name}
                          </Typography>
                          <Chip
                            label={test.status}
                            size="small"
                            color={test.status === 'validated' ? 'success' : 'default'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {test.testType.replace('_', ' ')} • {test.llmProvider.toUpperCase()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(test.createdAt), 'dd/MM HH:mm', { locale: ptBR })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Métricas de Uso */}
        {metrics && metrics.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Métricas de Uso
                </Typography>
                <Grid container spacing={3}>
                  {metrics.map((metric) => (
                    <Grid item xs={12} sm={6} md={3} key={`${metric.provider}-${metric.period}`}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {metric.totalRequests}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Requisições
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          {metric.provider.toUpperCase()}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </motion.div>
  );
};

export default LLMTestsDashboard; 