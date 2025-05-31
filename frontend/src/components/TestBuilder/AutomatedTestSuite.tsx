import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

type TestStepType = 'navigate' | 'click' | 'fill' | 'screenshot' | 'assert' | 'extract' | 'wait';
type TestStepStatus = 'pending' | 'running' | 'success' | 'error';
type Environment = 'development' | 'staging' | 'production';

interface TestStep {
  id: string;
  type: TestStepType;
  name: string;
  config: {
    url?: string;
    selector?: string;
    text?: string;
    timeout?: number;
    assertion?: string;
    expectedValue?: string | number | boolean;
  };
  status?: TestStepStatus;
  result?: Record<string, unknown>;
  screenshot?: string;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  environment: Environment;
  browserConfig: {
    headless: boolean;
    viewport: { width: number; height: number };
    device?: string;
  };
}

const AutomatedTestSuite: React.FC = () => {
  const [testSuite, setTestSuite] = useState<TestSuite>({
    id: '',
    name: '',
    description: '',
    steps: [],
    environment: 'development',
    browserConfig: {
      headless: false,
      viewport: { width: 1280, height: 720 },
    },
  });

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [newStep, setNewStep] = useState<Partial<TestStep>>({
    type: 'navigate',
    name: '',
    config: {},
  });

  const stepTypes = [
    { value: 'navigate' as TestStepType, label: 'Navegar para URL', icon: '🌐' },
    { value: 'click' as TestStepType, label: 'Clique em Elemento', icon: '👆' },
    { value: 'fill' as TestStepType, label: 'Preencher Campo', icon: '✏️' },
    { value: 'screenshot' as TestStepType, label: 'Capturar Tela', icon: '📸' },
    { value: 'assert' as TestStepType, label: 'Validar Elemento', icon: '✅' },
    { value: 'extract' as TestStepType, label: 'Extrair Dados', icon: '📊' },
    { value: 'wait' as TestStepType, label: 'Aguardar', icon: '⏳' },
  ];

  const environments = [
    { value: 'development' as Environment, label: 'Desenvolvimento', color: 'primary' },
    { value: 'staging' as Environment, label: 'Homologação', color: 'warning' },
    { value: 'production' as Environment, label: 'Produção', color: 'error' },
  ];

  const addStep = useCallback(() => {
    if (newStep.name && newStep.type) {
      const step: TestStep = {
        id: Date.now().toString(),
        name: newStep.name,
        type: newStep.type,
        config: newStep.config || {},
        status: 'pending',
      };
      
      setTestSuite(prev => ({
        ...prev,
        steps: [...prev.steps, step],
      }));
      
      setNewStep({ type: 'navigate', name: '', config: {} });
      setStepDialogOpen(false);
    }
  }, [newStep]);

  const removeStep = useCallback((stepId: string) => {
    setTestSuite(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId),
    }));
  }, []);

  const executeTestSuite = useCallback(async () => {
    setIsRunning(true);
    setCurrentStep(0);

    try {
      // Iniciar servidor MCP Playwright
      const startResponse = await fetch('/api/mcp/servers/playwright/start', {
        method: 'POST',
        headers: {
          'X-API-Key': localStorage.getItem('apiKey') || '',
        },
      });

      if (!startResponse.ok) {
        throw new Error('Falha ao iniciar servidor Playwright');
      }

      // Executar cada passo
      for (let i = 0; i < testSuite.steps.length; i++) {
        setCurrentStep(i);
        const step = testSuite.steps[i];
        
        // Atualizar status do passo
        setTestSuite(prev => ({
          ...prev,
          steps: prev.steps.map(s => 
            s.id === step.id ? { ...s, status: 'running' } : s
          ),
        }));

        try {
          let result;
          
          switch (step.type) {
            case 'navigate':
              result = await fetch('/api/mcp/playwright/navigate', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-MCP-Client-ID': 'automated-test-suite',
                  'X-MCP-Client-Secret': 'test-secret',
                },
                body: JSON.stringify({ url: step.config.url }),
              });
              break;
              
            case 'click':
              result = await fetch('/api/mcp/playwright/click', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-MCP-Client-ID': 'automated-test-suite',
                  'X-MCP-Client-Secret': 'test-secret',
                },
                body: JSON.stringify({ element: step.config.selector }),
              });
              break;
              
            case 'fill':
              result = await fetch('/api/mcp/playwright/fill', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-MCP-Client-ID': 'automated-test-suite',
                  'X-MCP-Client-Secret': 'test-secret',
                },
                body: JSON.stringify({ 
                  element: step.config.selector,
                  text: step.config.text 
                }),
              });
              break;
              
            case 'screenshot':
              result = await fetch('/api/mcp/playwright/screenshot', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-MCP-Client-ID': 'automated-test-suite',
                  'X-MCP-Client-Secret': 'test-secret',
                },
                body: JSON.stringify({ 
                  filename: `step-${i + 1}-${step.name.replace(/\s+/g, '-').toLowerCase()}`,
                  raw: true 
                }),
              });
              break;
              
            case 'extract':
              result = await fetch('/api/scraper/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  url: step.config.url,
                  selectors: { [step.name]: step.config.selector },
                  engine: 'playwright',
                }),
              });
              break;
              
            case 'wait':
              await new Promise(resolve => setTimeout(resolve, step.config.timeout || 1000));
              result = { ok: true };
              break;
              
            default:
              throw new Error(`Tipo de passo não suportado: ${step.type}`);
          }

          if (result && !result.ok) {
            throw new Error(`Falha na execução do passo: ${step.name}`);
          }

          const responseData = result && 'json' in result ? await result.json() : { success: true };
          
          // Atualizar passo com sucesso
          setTestSuite(prev => ({
            ...prev,
            steps: prev.steps.map(s => 
              s.id === step.id ? { 
                ...s, 
                status: 'success',
                result: responseData 
              } : s
            ),
          }));

        } catch (error) {
          // Atualizar passo com erro
          setTestSuite(prev => ({
            ...prev,
            steps: prev.steps.map(s => 
              s.id === step.id ? { 
                ...s, 
                status: 'error',
                result: { error: error instanceof Error ? error.message : String(error) }
              } : s
            ),
          }));
          
          console.error(`Erro no passo ${step.name}:`, error);
          break; // Parar execução em caso de erro
        }

        // Pequena pausa entre passos
        await new Promise(resolve => setTimeout(resolve, 500));
      }

    } catch (error) {
      console.error('Erro na execução da suite de testes:', error);
    } finally {
      setIsRunning(false);
      setCurrentStep(-1);
    }
  }, [testSuite]);

  const getStepIcon = (type: string) => {
    const stepType = stepTypes.find(st => st.value === type);
    return stepType?.icon || '🔧';
  };

  const getStepStatusColor = (status?: string) => {
    switch (status) {
      case 'running': return 'warning';
      case 'success': return 'success';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Suite de Testes Automatizados
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setStepDialogOpen(true)}
            disabled={isRunning}
          >
            Adicionar Passo
          </Button>
          <Button
            variant="contained"
            startIcon={isRunning ? <CircularProgress size={20} /> : <PlayIcon />}
            onClick={executeTestSuite}
            disabled={isRunning || testSuite.steps.length === 0}
          >
            {isRunning ? 'Executando...' : 'Executar Suite'}
          </Button>
        </Box>
      </Box>

      {/* Configurações da Suite */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Configurações da Suite</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Nome da Suite"
              value={testSuite.name}
              onChange={(e) => setTestSuite(prev => ({ ...prev, name: e.target.value }))}
              sx={{ minWidth: 200 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Ambiente</InputLabel>
              <Select
                value={testSuite.environment}
                onChange={(e) => setTestSuite(prev => ({ ...prev, environment: e.target.value as Environment }))}
                label="Ambiente"
              >
                {environments.map(env => (
                  <MenuItem key={env.value} value={env.value}>
                    {env.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Chip 
              label={`${testSuite.steps.length} passos`}
              color="primary"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Lista de Passos */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Passos de Teste</Typography>
          
          {testSuite.steps.length === 0 ? (
            <Alert severity="info">
              Nenhum passo adicionado. Clique em "Adicionar Passo" para começar.
            </Alert>
          ) : (
            <List>
              <AnimatePresence>
                {testSuite.steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ListItem
                      sx={{
                        border: currentStep === index ? '2px solid #10b981' : '1px solid #334155',
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: currentStep === index ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <Typography sx={{ fontSize: '1.5rem', mr: 1 }}>
                          {getStepIcon(step.type)}
                        </Typography>
                        <Chip
                          label={step.status || 'pending'}
                          color={getStepStatusColor(step.status)}
                          size="small"
                        />
                      </Box>
                      <ListItemText
                        primary={`${index + 1}. ${step.name}`}
                        secondary={`Tipo: ${stepTypes.find(st => st.value === step.type)?.label}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={() => removeStep(step.id)}
                          disabled={isRunning}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Adicionar Passo */}
      <Dialog open={stepDialogOpen} onClose={() => setStepDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Novo Passo</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nome do Passo"
              value={newStep.name}
              onChange={(e) => setNewStep(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel>Tipo de Passo</InputLabel>
              <Select
                value={newStep.type}
                onChange={(e) => setNewStep(prev => ({ ...prev, type: e.target.value as TestStepType }))}
                label="Tipo de Passo"
              >
                {stepTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Campos específicos por tipo */}
            {(newStep.type === 'navigate' || newStep.type === 'extract') && (
              <TextField
                label="URL"
                value={newStep.config?.url || ''}
                onChange={(e) => setNewStep(prev => ({
                  ...prev,
                  config: { ...prev.config, url: e.target.value }
                }))}
                fullWidth
              />
            )}

            {(newStep.type === 'click' || newStep.type === 'fill' || newStep.type === 'assert' || newStep.type === 'extract') && (
              <TextField
                label="Seletor CSS"
                value={newStep.config?.selector || ''}
                onChange={(e) => setNewStep(prev => ({
                  ...prev,
                  config: { ...prev.config, selector: e.target.value }
                }))}
                fullWidth
                placeholder="Ex: #botao-login, .form-input, [data-testid='submit']"
              />
            )}

            {newStep.type === 'fill' && (
              <TextField
                label="Texto a Inserir"
                value={newStep.config?.text || ''}
                onChange={(e) => setNewStep(prev => ({
                  ...prev,
                  config: { ...prev.config, text: e.target.value }
                }))}
                fullWidth
              />
            )}

            {newStep.type === 'wait' && (
              <TextField
                label="Tempo de Espera (ms)"
                type="number"
                value={newStep.config?.timeout || 1000}
                onChange={(e) => setNewStep(prev => ({
                  ...prev,
                  config: { ...prev.config, timeout: parseInt(e.target.value) }
                }))}
                fullWidth
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStepDialogOpen(false)}>Cancelar</Button>
          <Button onClick={addStep} variant="contained">Adicionar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutomatedTestSuite; 