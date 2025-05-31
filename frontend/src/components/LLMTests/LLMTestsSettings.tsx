import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  Alert,
  Grid,
  Paper,
  Slider,
  Chip,
} from '@mui/material';
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  Zap,
  Clock,
  Database,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';

// Types
import { LLMProvider } from '../../types/llm-tests';

// Hooks
import { useLLMConfig, useLLMNotifications } from '../../hooks/useLLMTests';

interface SettingsForm {
  defaultProvider: LLMProvider;
  enabledProviders: LLMProvider[];
  maxTestsPerUser: number;
  autoValidation: boolean;
  enableCache: boolean;
  cacheTimeout: number;
  maxRetries: number;
  requestTimeout: number;
  enableMetrics: boolean;
  enableNotifications: boolean;
}

const LLMTestsSettings: React.FC = () => {
  const [isDirty, setIsDirty] = useState(false);
  const { config, isLoading, updateConfig, isUpdating } = useLLMConfig();
  const { addNotification } = useLLMNotifications();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<SettingsForm>({
    defaultValues: {
      defaultProvider: config?.defaultProvider || LLMProvider.OPENAI,
      enabledProviders: config?.enabledProviders || [LLMProvider.OPENAI],
      maxTestsPerUser: config?.maxTestsPerUser || 100,
      autoValidation: true,
      enableCache: true,
      cacheTimeout: 300,
      maxRetries: 3,
      requestTimeout: 60,
      enableMetrics: true,
      enableNotifications: true,
    },
  });

  const watchedValues = watch();

  React.useEffect(() => {
    if (config) {
      reset({
        defaultProvider: config.defaultProvider,
        enabledProviders: config.enabledProviders,
        maxTestsPerUser: config.maxTestsPerUser,
        autoValidation: true,
        enableCache: true,
        cacheTimeout: 300,
        maxRetries: 3,
        requestTimeout: 60,
        enableMetrics: true,
        enableNotifications: true,
      });
    }
  }, [config, reset]);

  const onSubmit = async (data: SettingsForm) => {
    try {
      updateConfig({
        defaultProvider: data.defaultProvider,
        enabledProviders: data.enabledProviders,
        maxTestsPerUser: data.maxTestsPerUser,
      }, {
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: 'Configurações Salvas',
            message: 'As configurações foram atualizadas com sucesso.',
          });
          setIsDirty(false);
        },
        onError: () => {
          addNotification({
            type: 'error',
            title: 'Erro ao Salvar',
            message: 'Não foi possível salvar as configurações.',
          });
        },
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const handleReset = () => {
    reset();
    setIsDirty(false);
    addNotification({
      type: 'info',
      title: 'Configurações Restauradas',
      message: 'As configurações foram restauradas para os valores padrão.',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Settings size={24} className="text-emerald-500 mr-3" />
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                  Configurações do Módulo
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Configure as preferências do módulo de testes com IA
              </Typography>
            </Box>
            {isDirty && (
              <Chip
                label="Alterações não salvas"
                color="warning"
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              {/* Configurações de Provedores */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Zap size={20} className="text-emerald-500 mr-2" />
                    <Typography variant="h6">Provedores LLM</Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="defaultProvider"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Provedor Padrão</InputLabel>
                            <Select {...field} label="Provedor Padrão">
                              {Object.values(LLMProvider).map((provider) => (
                                <MenuItem key={provider} value={provider}>
                                  {provider.toUpperCase()}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="enabledProviders"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Provedores Habilitados</InputLabel>
                            <Select
                              {...field}
                              multiple
                              label="Provedores Habilitados"
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {selected.map((value) => (
                                    <Chip key={value} label={value.toUpperCase()} size="small" />
                                  ))}
                                </Box>
                              )}
                            >
                              {Object.values(LLMProvider).map((provider) => (
                                <MenuItem key={provider} value={provider}>
                                  {provider.toUpperCase()}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Configurações de Limites */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Shield size={20} className="text-emerald-500 mr-2" />
                    <Typography variant="h6">Limites e Controles</Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="maxTestsPerUser"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type="number"
                            label="Máximo de Testes por Usuário"
                            inputProps={{ min: 1, max: 1000 }}
                            error={!!errors.maxTestsPerUser}
                            helperText={errors.maxTestsPerUser?.message || 'Limite de testes que cada usuário pode criar'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ pt: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          Timeout de Requisições (segundos)
                        </Typography>
                        <Controller
                          name="requestTimeout"
                          control={control}
                          render={({ field }) => (
                            <Box sx={{ px: 2 }}>
                              <Slider
                                {...field}
                                min={30}
                                max={180}
                                step={15}
                                marks={[
                                  { value: 30, label: '30s' },
                                  { value: 60, label: '60s' },
                                  { value: 120, label: '120s' },
                                  { value: 180, label: '180s' },
                                ]}
                                valueLabelDisplay="auto"
                              />
                            </Box>
                          )}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Configurações de Performance */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Clock size={20} className="text-emerald-500 mr-2" />
                    <Typography variant="h6">Performance e Cache</Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="enableCache"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch {...field} />}
                            label="Habilitar Cache de Resultados"
                          />
                        )}
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Melhora a performance ao reutilizar resultados similares
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ pt: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          Timeout do Cache (segundos)
                        </Typography>
                        <Controller
                          name="cacheTimeout"
                          control={control}
                          render={({ field }) => (
                            <Box sx={{ px: 2 }}>
                              <Slider
                                {...field}
                                min={60}
                                max={3600}
                                step={60}
                                disabled={!watchedValues.enableCache}
                                marks={[
                                  { value: 300, label: '5min' },
                                  { value: 900, label: '15min' },
                                  { value: 1800, label: '30min' },
                                  { value: 3600, label: '1h' },
                                ]}
                                valueLabelDisplay="auto"
                              />
                            </Box>
                          )}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Configurações Gerais */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Database size={20} className="text-emerald-500 mr-2" />
                    <Typography variant="h6">Configurações Gerais</Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="autoValidation"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch {...field} />}
                            label="Validação Automática"
                          />
                        )}
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Valida automaticamente os testes gerados
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="enableMetrics"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch {...field} />}
                            label="Coleta de Métricas"
                          />
                        )}
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Permite coleta de métricas de uso e performance
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="enableNotifications"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch {...field} />}
                            label="Notificações"
                          />
                        )}
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Exibe notificações sobre operações e eventos
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ pt: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          Máximo de Tentativas
                        </Typography>
                        <Controller
                          name="maxRetries"
                          control={control}
                          render={({ field }) => (
                            <Box sx={{ px: 2 }}>
                              <Slider
                                {...field}
                                min={1}
                                max={10}
                                step={1}
                                marks={[
                                  { value: 1, label: '1' },
                                  { value: 3, label: '3' },
                                  { value: 5, label: '5' },
                                  { value: 10, label: '10' },
                                ]}
                                valueLabelDisplay="auto"
                              />
                            </Box>
                          )}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Número máximo de tentativas em caso de falha
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Ações */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                type="button"
                variant="outlined"
                startIcon={<RefreshCw size={20} />}
                onClick={handleReset}
                disabled={isUpdating}
              >
                Restaurar Padrões
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save size={20} />}
                  disabled={isUpdating || !isDirty}
                  sx={{ minWidth: 140 }}
                >
                  {isUpdating ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </Box>
            </Box>
          </form>

          {/* Aviso sobre configurações avançadas */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              💡 <strong>Dica:</strong> Algumas configurações podem afetar a performance do sistema. 
              Recomendamos testar em ambiente de desenvolvimento antes de aplicar em produção.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LLMTestsSettings; 