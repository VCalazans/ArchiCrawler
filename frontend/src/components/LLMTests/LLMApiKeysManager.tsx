import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Shield,
  Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Types
import { LLMProvider, StoreApiKeyRequest } from '../../types/llm-tests';

// Hooks
import { useApiKeys, useLLMNotifications } from '../../hooks/useLLMTests';

// Validation schema
const schema = yup.object().shape({
  provider: yup
    .string()
    .required('Provedor é obrigatório')
    .oneOf(Object.values(LLMProvider)),
  apiKey: yup
    .string()
    .required('API Key é obrigatória')
    .min(10, 'API Key deve ter pelo menos 10 caracteres'),
});

const LLMApiKeysManager: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState<Record<LLMProvider, boolean>>({
    [LLMProvider.OPENAI]: false,
    [LLMProvider.ANTHROPIC]: false,
    [LLMProvider.GEMINI]: false,
  });

  const {
    providers,
    apiKeysStatus,
    isLoading,
    storeApiKey,
    validateApiKey,
    deleteApiKey,
    isStoringKey,
    isValidatingKey,
    isDeletingKey,
  } = useApiKeys();

  const { addNotification } = useLLMNotifications();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StoreApiKeyRequest>({
    resolver: yupResolver(schema),
    defaultValues: {
      provider: LLMProvider.OPENAI,
      apiKey: '',
    },
  });

  const onSubmit = async (data: StoreApiKeyRequest) => {
    storeApiKey(data, {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'API Key Configurada',
          message: `API Key do ${data.provider.toUpperCase()} foi salva com sucesso.`,
        });
        reset();
        setDialogOpen(false);
      },
      onError: (error: unknown) => {
        addNotification({
          type: 'error',
          title: 'Erro ao Salvar',
          message: error instanceof Error ? error.message : 'Não foi possível salvar a API key.',
        });
      },
    });
  };

  const handleValidateKey = (provider: LLMProvider) => {
    validateApiKey(provider, {
      onSuccess: (response) => {
        addNotification({
          type: response.data?.isValid ? 'success' : 'error',
          title: response.data?.isValid ? 'Key Válida' : 'Key Inválida',
          message: response.data?.message || 'Validação concluída.',
        });
      },
      onError: () => {
        addNotification({
          type: 'error',
          title: 'Erro na Validação',
          message: 'Não foi possível validar a API key.',
        });
      },
    });
  };

  const handleDeleteKey = (provider: LLMProvider) => {
    deleteApiKey(provider, {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'API Key Removida',
          message: `API Key do ${provider.toUpperCase()} foi removida.`,
        });
      },
      onError: () => {
        addNotification({
          type: 'error',
          title: 'Erro ao Remover',
          message: 'Não foi possível remover a API key.',
        });
      },
    });
  };

  const toggleShowApiKey = (provider: LLMProvider) => {
    setShowApiKey(prev => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const getProviderInfo = (provider: LLMProvider) => {
    switch (provider) {
      case LLMProvider.OPENAI:
        return {
          name: 'OpenAI',
          description: 'GPT-4, GPT-3.5 Turbo e modelos da OpenAI',
          website: 'https://platform.openai.com/api-keys',
          color: '#10B981',
        };
      case LLMProvider.ANTHROPIC:
        return {
          name: 'Anthropic',
          description: 'Claude 3 e modelos da Anthropic',
          website: 'https://console.anthropic.com/',
          color: '#8B5CF6',
        };
      case LLMProvider.GEMINI:
        return {
          name: 'Google Gemini',
          description: 'Gemini Pro e modelos do Google',
          website: 'https://makersuite.google.com/app/apikey',
          color: '#F59E0B',
        };
    }
  };

  const getStatusIcon = (provider: LLMProvider) => {
    const status = apiKeysStatus?.find(s => s.provider === provider);
    if (!status) return <XCircle size={20} className="text-gray-400" />;
    
    return status.isValid 
      ? <CheckCircle size={20} className="text-green-500" />
      : <XCircle size={20} className="text-red-500" />;
  };

  const getStatusColor = (provider: LLMProvider) => {
    const status = apiKeysStatus?.find(s => s.provider === provider);
    if (!status) return 'default';
    return status.isValid ? 'success' : 'error';
  };

  const isConfigured = (provider: LLMProvider) => {
    return providers?.configured?.includes(provider) || false;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Key size={24} className="text-emerald-500 mr-3" />
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                  Gerenciar API Keys
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Configure suas chaves de API para provedores LLM
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => setDialogOpen(true)}
            >
              Nova API Key
            </Button>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <Shield size={16} className="inline mr-1" />
              Suas API keys são criptografadas e armazenadas com segurança. Nunca compartilhe suas chaves.
            </Typography>
          </Alert>

          {/* Lista de Provedores */}
          <Grid container spacing={3}>
            {Object.values(LLMProvider).map((provider) => {
              const info = getProviderInfo(provider);
              const configured = isConfigured(provider);
              
              return (
                <Grid item xs={12} md={4} key={provider}>
                  <Paper
                    sx={{
                      p: 3,
                      border: '2px solid',
                      borderColor: configured ? info.color : 'divider',
                      bgcolor: configured ? `${info.color}08` : 'background.paper',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: info.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                        }}
                      >
                        <Key size={20} className="text-white" />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {info.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {info.description}
                        </Typography>
                      </Box>
                      {getStatusIcon(provider)}
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={configured ? 'Configurado' : 'Não configurado'}
                        color={getStatusColor(provider)}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      {configured && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Última validação: {
                            apiKeysStatus?.find(s => s.provider === provider)?.lastChecked 
                              ? new Date(apiKeysStatus.find(s => s.provider === provider)!.lastChecked).toLocaleString()
                              : 'Nunca'
                          }
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {configured ? (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<RefreshCw size={16} />}
                            onClick={() => handleValidateKey(provider)}
                            disabled={isValidatingKey}
                          >
                            {isValidatingKey ? <CircularProgress size={16} /> : 'Validar'}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Trash2 size={16} />}
                            onClick={() => handleDeleteKey(provider)}
                            disabled={isDeletingKey}
                          >
                            Remover
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Globe size={16} />}
                          onClick={() => window.open(info.website, '_blank')}
                        >
                          Obter API Key
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* Informações adicionais */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Como obter suas API Keys
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Key size={20} className="text-emerald-500" />
                </ListItemIcon>
                <ListItemText
                  primary="OpenAI"
                  secondary="Acesse platform.openai.com, crie uma conta e gere uma API key na seção API Keys"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Key size={20} className="text-purple-500" />
                </ListItemIcon>
                <ListItemText
                  primary="Anthropic"
                  secondary="Acesse console.anthropic.com, crie uma conta e gere uma API key"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Key size={20} className="text-amber-500" />
                </ListItemIcon>
                <ListItemText
                  primary="Google Gemini"
                  secondary="Acesse makersuite.google.com, faça login com sua conta Google e gere uma API key"
                />
              </ListItem>
            </List>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog para adicionar nova API Key */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Nova API Key</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="provider"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.provider}>
                      <InputLabel>Provedor</InputLabel>
                      <Select {...field} label="Provedor">
                        {Object.values(LLMProvider).map((provider) => {
                          const info = getProviderInfo(provider);
                          return (
                            <MenuItem key={provider} value={provider}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 0.5,
                                    bgcolor: info.color,
                                    mr: 1,
                                  }}
                                />
                                {info.name}
                              </Box>
                            </MenuItem>
                          );
                        })}
                      </Select>
                      {errors.provider && (
                        <Typography variant="caption" color="error">
                          {errors.provider.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="apiKey"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="API Key"
                      type={showApiKey[field.value as LLMProvider] ? 'text' : 'password'}
                      error={!!errors.apiKey}
                      helperText={errors.apiKey?.message || 'Cole sua API key aqui'}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => toggleShowApiKey(field.value as LLMProvider)}
                              edge="end"
                            >
                              {showApiKey[field.value as LLMProvider] ? <EyeOff size={20} /> : <Eye size={20} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isStoringKey}
              startIcon={isStoringKey ? <CircularProgress size={20} /> : <Key size={20} />}
            >
              {isStoringKey ? 'Salvando...' : 'Salvar API Key'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </motion.div>
  );
};

export default LLMApiKeysManager; 