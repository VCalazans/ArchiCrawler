import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface PerformanceMetrics {
  id: string;
  url: string;
  timestamp: Date;
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  networkRequests: number;
  totalSize: number;
  status: 'good' | 'warning' | 'poor';
}

interface PerformanceTest {
  id: string;
  name: string;
  url: string;
  interval: number; // minutos
  isActive: boolean;
  metrics: PerformanceMetrics[];
  thresholds: {
    loadTime: number;
    fcp: number;
    lcp: number;
    cls: number;
    fid: number;
  };
}

const PerformanceMonitor: React.FC = () => {
  const [tests, setTests] = useState<PerformanceTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    url: '',
    interval: 30,
  });
  const [selectedTest, setSelectedTest] = useState<PerformanceTest | null>(null);

  const defaultThresholds = {
    loadTime: 3000,
    fcp: 1800,
    lcp: 2500,
    cls: 0.1,
    fid: 100,
  };

  const runPerformanceTest = async (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test) return;

    setIsRunning(true);

    try {
      // Usar o scraper com métricas de performance
      const response = await fetch('/api/scraper/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: test.url,
          performanceMetrics: true,
          engine: 'playwright',
          options: {
            waitUntil: 'networkidle',
            timeout: 30000,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Simular métricas de performance (em produção viria do Playwright)
        const metrics: PerformanceMetrics = {
          id: Date.now().toString(),
          url: test.url,
          timestamp: new Date(),
          loadTime: Math.random() * 5000 + 1000,
          domContentLoaded: Math.random() * 3000 + 500,
          firstContentfulPaint: Math.random() * 2000 + 800,
          largestContentfulPaint: Math.random() * 4000 + 1500,
          cumulativeLayoutShift: Math.random() * 0.3,
          firstInputDelay: Math.random() * 200 + 50,
          networkRequests: Math.floor(Math.random() * 100) + 20,
          totalSize: Math.random() * 5000000 + 1000000,
          status: 'good',
        };

        // Determinar status baseado nos thresholds
        if (
          metrics.loadTime > test.thresholds.loadTime ||
          metrics.largestContentfulPaint > test.thresholds.lcp ||
          metrics.cumulativeLayoutShift > test.thresholds.cls
        ) {
          metrics.status = 'poor';
        } else if (
          metrics.loadTime > test.thresholds.loadTime * 0.8 ||
          metrics.largestContentfulPaint > test.thresholds.lcp * 0.8
        ) {
          metrics.status = 'warning';
        }

        // Atualizar teste com novas métricas
        setTests(prev => prev.map(t =>
          t.id === testId
            ? { ...t, metrics: [...t.metrics, metrics].slice(-50) } // Manter apenas últimas 50
            : t
        ));
      }
    } catch (error) {
      console.error('Erro ao executar teste de performance:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const createTest = () => {
    if (newTest.name && newTest.url) {
      const test: PerformanceTest = {
        id: Date.now().toString(),
        name: newTest.name,
        url: newTest.url,
        interval: newTest.interval,
        isActive: false,
        metrics: [],
        thresholds: defaultThresholds,
      };

      setTests(prev => [...prev, test]);
      setNewTest({ name: '', url: '', interval: 30 });
    }
  };

  const toggleTest = (testId: string) => {
    setTests(prev => prev.map(t =>
      t.id === testId ? { ...t, isActive: !t.isActive } : t
    ));
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getMetricColor = (value: number, threshold: number, inverse: boolean = false) => {
    const ratio = value / threshold;
    if (inverse) {
      return ratio <= 0.8 ? 'success' : ratio <= 1 ? 'warning' : 'error';
    }
    return ratio <= 0.8 ? 'success' : ratio <= 1 ? 'warning' : 'error';
  };

  const getLatestMetrics = (test: PerformanceTest) => {
    return test.metrics[test.metrics.length - 1];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Monitor de Performance
      </Typography>

      {/* Formulário para novo teste */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Novo Teste de Performance</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nome do Teste"
                value={newTest.name}
                onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="URL para Monitorar"
                value={newTest.url}
                onChange={(e) => setNewTest(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://exemplo.com"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Intervalo (min)"
                value={newTest.interval}
                onChange={(e) => setNewTest(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
                inputProps={{ min: 5, max: 1440 }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={createTest}
                startIcon={<SpeedIcon />}
                disabled={!newTest.name || !newTest.url}
              >
                Criar Teste
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de testes */}
      <Grid container spacing={3}>
        {tests.map((test) => {
          const latestMetrics = getLatestMetrics(test);
          
          return (
            <Grid item xs={12} key={test.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {test.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={test.isActive ? 'Ativo' : 'Inativo'}
                        color={test.isActive ? 'success' : 'default'}
                        size="small"
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => runPerformanceTest(test.id)}
                        disabled={isRunning}
                        startIcon={<RefreshIcon />}
                      >
                        Testar Agora
                      </Button>
                      <Button
                        size="small"
                        variant={test.isActive ? 'contained' : 'outlined'}
                        color={test.isActive ? 'error' : 'primary'}
                        onClick={() => toggleTest(test.id)}
                      >
                        {test.isActive ? 'Pausar' : 'Iniciar'}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedTest(test)}
                        startIcon={<TimelineIcon />}
                        disabled={test.metrics.length === 0}
                      >
                        Ver Histórico
                      </Button>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {test.url} • Intervalo: {test.interval} min • {test.metrics.length} execuções
                  </Typography>

                  {latestMetrics && (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color={
                            getMetricColor(latestMetrics.loadTime, test.thresholds.loadTime) === 'success' ? 'success.main' :
                            getMetricColor(latestMetrics.loadTime, test.thresholds.loadTime) === 'warning' ? 'warning.main' : 'error.main'
                          }>
                            {(latestMetrics.loadTime / 1000).toFixed(1)}s
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tempo de Carregamento
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color={
                            getMetricColor(latestMetrics.largestContentfulPaint, test.thresholds.lcp) === 'success' ? 'success.main' :
                            getMetricColor(latestMetrics.largestContentfulPaint, test.thresholds.lcp) === 'warning' ? 'warning.main' : 'error.main'
                          }>
                            {(latestMetrics.largestContentfulPaint / 1000).toFixed(1)}s
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            LCP
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color={
                            getMetricColor(latestMetrics.cumulativeLayoutShift, test.thresholds.cls) === 'success' ? 'success.main' :
                            getMetricColor(latestMetrics.cumulativeLayoutShift, test.thresholds.cls) === 'warning' ? 'warning.main' : 'error.main'
                          }>
                            {latestMetrics.cumulativeLayoutShift.toFixed(3)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            CLS
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {formatBytes(latestMetrics.totalSize)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tamanho Total
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  )}

                  {!latestMetrics && (
                    <Alert severity="info">
                      Nenhuma métrica disponível. Execute um teste para ver os resultados.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {tests.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Nenhum teste de performance configurado. Adicione uma URL para começar o monitoramento.
        </Alert>
      )}

      {/* Dialog de histórico */}
      <Dialog
        open={!!selectedTest}
        onClose={() => setSelectedTest(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Histórico de Performance: {selectedTest?.name}
        </DialogTitle>
        <DialogContent>
          {selectedTest && selectedTest.metrics.length > 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data/Hora</TableCell>
                    <TableCell align="right">Load Time (s)</TableCell>
                    <TableCell align="right">LCP (s)</TableCell>
                    <TableCell align="right">CLS</TableCell>
                    <TableCell align="right">Requests</TableCell>
                    <TableCell align="right">Tamanho</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedTest.metrics.slice(-20).reverse().map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell>
                        {metric.timestamp.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {(metric.loadTime / 1000).toFixed(1)}
                      </TableCell>
                      <TableCell align="right">
                        {(metric.largestContentfulPaint / 1000).toFixed(1)}
                      </TableCell>
                      <TableCell align="right">
                        {metric.cumulativeLayoutShift.toFixed(3)}
                      </TableCell>
                      <TableCell align="right">
                        {metric.networkRequests}
                      </TableCell>
                      <TableCell align="right">
                        {formatBytes(metric.totalSize)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={metric.status}
                          color={
                            metric.status === 'good' ? 'success' :
                            metric.status === 'warning' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PerformanceMonitor; 