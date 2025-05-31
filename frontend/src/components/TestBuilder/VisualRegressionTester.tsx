import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Alert,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Compare as CompareIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

interface VisualTest {
  id: string;
  name: string;
  url: string;
  baselineImage?: string;
  currentImage?: string;
  diffImage?: string;
  threshold: number;
  status: 'pending' | 'running' | 'passed' | 'failed';
  similarity?: number;
  createdAt: Date;
}

const VisualRegressionTester: React.FC = () => {
  const [tests, setTests] = useState<VisualTest[]>([]);
  const [newTest, setNewTest] = useState({
    name: '',
    url: '',
    threshold: 95,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    test?: VisualTest;
  }>({ open: false });

  const createBaseline = async (test: Omit<VisualTest, 'id' | 'createdAt' | 'status'>) => {
    const testId = Date.now().toString();
    const newVisualTest: VisualTest = {
      ...test,
      id: testId,
      status: 'running',
      createdAt: new Date(),
    };

    setTests(prev => [...prev, newVisualTest]);

    try {
      // Capturar screenshot baseline usando o scraper
      const response = await fetch('/api/scraper/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: test.url,
          fullPage: true,
          format: 'png',
          quality: 100,
          device: 'desktop',
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        setTests(prev => prev.map(t => 
          t.id === testId 
            ? { ...t, baselineImage: imageUrl, status: 'passed' }
            : t
        ));
      } else {
        throw new Error('Falha ao capturar screenshot');
      }
    } catch (error) {
      setTests(prev => prev.map(t => 
        t.id === testId 
          ? { ...t, status: 'failed' }
          : t
      ));
    }
  };

  const runVisualComparison = async (testId: string) => {
    setTests(prev => prev.map(t => 
      t.id === testId ? { ...t, status: 'running' } : t
    ));

    try {
      const test = tests.find(t => t.id === testId);
      if (!test?.baselineImage) {
        throw new Error('Baseline não encontrado');
      }

      // Capturar novo screenshot
      const response = await fetch('/api/scraper/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: test.url,
          fullPage: true,
          format: 'png',
          quality: 100,
          device: 'desktop',
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const currentImageUrl = URL.createObjectURL(blob);
        
        // Simular comparação visual (em produção, usaria uma lib como Pixelmatch)
        const mockSimilarity = Math.random() * 100;
        const passed = mockSimilarity >= test.threshold;
        
        setTests(prev => prev.map(t => 
          t.id === testId 
            ? { 
                ...t, 
                currentImage: currentImageUrl, 
                similarity: mockSimilarity,
                status: passed ? 'passed' : 'failed'
              }
            : t
        ));
      }
    } catch (error) {
      setTests(prev => prev.map(t => 
        t.id === testId ? { ...t, status: 'failed' } : t
      ));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    for (const test of tests) {
      if (test.baselineImage) {
        await runVisualComparison(test.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    setIsRunning(false);
  };

  const handleAddTest = () => {
    if (newTest.name && newTest.url) {
      createBaseline({
        name: newTest.name,
        url: newTest.url,
        threshold: newTest.threshold,
      });
      setNewTest({ name: '', url: '', threshold: 95 });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'success';
      case 'failed': return 'error';
      case 'running': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckIcon />;
      case 'failed': return <ErrorIcon />;
      case 'running': return <CameraIcon />;
      default: return <ViewIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Testes de Regressão Visual
      </Typography>

      {/* Formulário para novo teste */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Novo Teste Visual</Typography>
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
                label="URL para Testar"
                value={newTest.url}
                onChange={(e) => setNewTest(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://exemplo.com"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Threshold (%)"
                value={newTest.threshold}
                onChange={(e) => setNewTest(prev => ({ ...prev, threshold: parseInt(e.target.value) }))}
                inputProps={{ min: 50, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleAddTest}
                startIcon={<CameraIcon />}
                disabled={!newTest.name || !newTest.url}
              >
                Criar Baseline
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Controles de execução */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<CompareIcon />}
          onClick={runAllTests}
          disabled={isRunning || tests.length === 0}
        >
          Executar Todos os Testes
        </Button>
        <Chip 
          label={`${tests.length} testes configurados`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Lista de testes */}
      <Grid container spacing={3}>
        {tests.map((test) => (
          <Grid item xs={12} md={6} lg={4} key={test.id}>
            <Card 
              sx={{ 
                height: '100%',
                position: 'relative',
                border: test.status === 'failed' ? '2px solid #ef4444' : 'none',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                    {test.name}
                  </Typography>
                  <Chip
                    icon={getStatusIcon(test.status)}
                    label={test.status}
                    color={getStatusColor(test.status)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {test.url}
                </Typography>

                {test.similarity !== undefined && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Similaridade: {test.similarity.toFixed(1)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={test.similarity} 
                      color={test.similarity >= test.threshold ? 'success' : 'error'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => runVisualComparison(test.id)}
                    disabled={isRunning || !test.baselineImage}
                  >
                    Comparar
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setPreviewDialog({ open: true, test })}
                    disabled={!test.baselineImage}
                  >
                    Ver Imagens
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {tests.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Nenhum teste visual configurado. Adicione uma URL para começar a criar baselines de comparação.
        </Alert>
      )}

      {/* Dialog de preview das imagens */}
      <Dialog 
        open={previewDialog.open} 
        onClose={() => setPreviewDialog({ open: false })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Comparação Visual: {previewDialog.test?.name}
        </DialogTitle>
        <DialogContent>
          {previewDialog.test && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Baseline</Typography>
                {previewDialog.test.baselineImage && (
                  <img 
                    src={previewDialog.test.baselineImage} 
                    alt="Baseline"
                    style={{ width: '100%', height: 'auto', border: '1px solid #ccc' }}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Atual</Typography>
                {previewDialog.test.currentImage && (
                  <img 
                    src={previewDialog.test.currentImage} 
                    alt="Atual"
                    style={{ width: '100%', height: 'auto', border: '1px solid #ccc' }}
                  />
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default VisualRegressionTester; 