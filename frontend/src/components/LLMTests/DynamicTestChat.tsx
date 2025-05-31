import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
  IconButton,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Send as SendIcon,
  Stop as StopIcon,
  AutoAwesome as AutoAwesomeIcon,
  Computer as ComputerIcon,
  Clear as ClearIcon,
  Settings as SettingsIcon,
  PhotoCamera as PhotoCameraIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDynamicTest } from '../../hooks/useDynamicTest';
import { AgentStepData } from '../../services/dynamic-test-api';
import { dynamicTestApi } from '../../services/dynamic-test-api';

interface DynamicTestChatProps {
  className?: string;
}

export const DynamicTestChat: React.FC<DynamicTestChatProps> = ({ className }) => {
  const [message, setMessage] = useState('');
  const [targetUrl, setTargetUrl] = useState('https://github.com/login');
  const [llmProvider, setLlmProvider] = useState('openai');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isExecuting, steps, error, currentStep, startTest, stopTest, clearState } = useDynamicTest();

  // Auto scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps]);

  // Testar conexão com backend ao carregar
  useEffect(() => {
    const testConnection = async () => {
      setConnectionStatus('connecting');
      try {
        await fetch('http://localhost:3001/health', { 
          method: 'GET',
          timeout: 5000 
        } as RequestInit);
        setConnectionStatus('connected');
      } catch {
        setConnectionStatus('disconnected');
      }
    };
    
    testConnection();
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || isExecuting) return;

    try {
      await startTest({
        message: message.trim(),
        targetUrl,
        llmProvider,
        model: 'gpt-4'
      });
      setMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleStop = () => {
    stopTest();
  };

  const handleClear = () => {
    clearState();
  };

  const handleSaveApiKey = async () => {
    try {
      await dynamicTestApi.setApiKey(llmProvider, apiKey);
      setShowSettings(false);
      setApiKey('');
    } catch (error) {
      console.error('Erro ao salvar API key:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box className={className} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AutoAwesomeIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                🤖 ArchiCrawler Assistant
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Assistente inteligente de testes web
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => setShowSettings(true)} size="small">
              <SettingsIcon />
            </IconButton>
            <IconButton onClick={handleClear} size="small" disabled={isExecuting}>
              <ClearIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Status Bar */}
        {(isExecuting || currentStep || connectionStatus !== 'connected') && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
              
              {/* Status de Conexão */}
              <Chip 
                label={
                  connectionStatus === 'connected' ? 'Backend Conectado' :
                  connectionStatus === 'connecting' ? 'Conectando...' : 
                  'Backend Desconectado'
                }
                color={
                  connectionStatus === 'connected' ? 'success' : 
                  connectionStatus === 'connecting' ? 'warning' : 
                  'error'
                }
                size="small"
                variant="outlined"
              />
              
              {/* Status de Execução */}
              {(isExecuting || currentStep) && (
                <Chip 
                  icon={<PsychologyIcon />}
                  label={isExecuting ? 'Executando...' : 'Finalizado'}
                  color={isExecuting ? 'primary' : 'success'}
                  variant="outlined"
                  size="small"
                />
              )}
              
              {currentStep && (
                <Typography variant="caption" color="text.secondary">
                  Confiança: {currentStep.confidence}% | {steps.length} passos
                </Typography>
              )}
            </Box>
            {isExecuting && <LinearProgress />}
          </Box>
        )}
      </Paper>

      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2, 
        bgcolor: 'background.default',
        minHeight: 0  // Importante para flex funcionar
      }}>
        {/* Placeholder quando não há mensagens */}
        {steps.length === 0 && !error && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            opacity: 0.7
          }}>
            <AutoAwesomeIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Pronto para testar!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Digite uma descrição do que você quer testar e pressione "Testar"
            </Typography>
            
            {/* Debug Info quando backend desconectado */}
            {connectionStatus === 'disconnected' && (
              <Alert severity="warning" sx={{ mt: 2, maxWidth: 500 }}>
                <AlertTitle>⚠️ Backend Desconectado</AlertTitle>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Não foi possível conectar com o backend. Verifique se:
                </Typography>
                <ul style={{ textAlign: 'left', paddingLeft: 20, margin: 0 }}>
                  <li>Backend está rodando em <code>http://localhost:3000</code></li>
                  <li>Execute: <code>cd backend && npm run dev</code></li>
                  <li>Verifique o console por erros</li>
                </ul>
              </Alert>
            )}
          </Box>
        )}
        
        <AnimatePresence>
          {steps.map((step, index) => (
            <StepMessage key={step.id} step={step} index={index} />
          ))}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Paper sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            label="URL Alvo"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            sx={{ minWidth: 300, flex: 1 }}
            disabled={isExecuting}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>LLM Provider</InputLabel>
            <Select
              value={llmProvider}
              onChange={(e) => setLlmProvider(e.target.value)}
              disabled={isExecuting}
            >
              <MenuItem value="openai">OpenAI</MenuItem>
              <MenuItem value="anthropic">Anthropic</MenuItem>
              <MenuItem value="gemini">Gemini</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Descreva o que você quer testar... (Ex: 'Teste se o login funciona no GitHub')"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isExecuting}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          
          {isExecuting ? (
            <Button
              variant="contained"
              color="error"
              onClick={handleStop}
              startIcon={<StopIcon />}
              sx={{ minWidth: 100, height: 56 }}
            >
              Parar
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!message.trim() || connectionStatus !== 'connected'}
              startIcon={<SendIcon />}
              sx={{ minWidth: 100, height: 56 }}
            >
              {connectionStatus === 'disconnected' ? 'Desconectado' : 
               connectionStatus === 'connecting' ? 'Conectando' : 'Testar'}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)}>
        <DialogTitle>Configurar API Key</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={`API Key ${llmProvider.toUpperCase()}`}
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="sk-..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Cancelar</Button>
          <Button onClick={handleSaveApiKey} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Componente para exibir cada passo da execução
interface StepMessageProps {
  step: AgentStepData;
  index: number;
}

const StepMessage: React.FC<StepMessageProps> = ({ step, index }) => {
  const [showScreenshot, setShowScreenshot] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card sx={{ mb: 2, boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar sx={{ bgcolor: step.success ? 'success.main' : 'error.main' }}>
              <ComputerIcon />
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  🤖 Agente
                </Typography>
                <Chip 
                  label={`${step.confidence}%`}
                  size="small"
                  color={step.confidence > 80 ? 'success' : step.confidence > 60 ? 'warning' : 'error'}
                />
                <Typography variant="caption" color="text.secondary">
                  {new Date(step.timestamp).toLocaleTimeString()} • {step.duration}ms
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                {step.description}
              </Typography>
              
              {step.thoughts && (
                <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1, mb: 1 }}>
                  <Typography variant="caption" fontStyle="italic">
                    💭 {step.thoughts}
                  </Typography>
                </Box>
              )}
              
              {step.screenshot && (
                <Box>
                  <Button
                    size="small"
                    startIcon={<PhotoCameraIcon />}
                    onClick={() => setShowScreenshot(true)}
                  >
                    Ver Screenshot
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Screenshot Dialog */}
      <Dialog 
        open={showScreenshot} 
        onClose={() => setShowScreenshot(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Screenshot - {step.description}</DialogTitle>
        <DialogContent>
          {step.screenshot && (
            <img 
              src={step.screenshot} 
              alt="Screenshot"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowScreenshot(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}; 