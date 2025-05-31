import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Chip,
  Alert,
  Paper,
  Divider,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';
import {
  ChevronDown,
  Wand2,
  Globe,
  Settings,
  Sparkles,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Types
import {
  LLMProvider,
  TestType,
  GenerateTestRequest,
} from '../../types/llm-tests';

// Hooks
import { useApiKeys, useTests, useLLMNotifications } from '../../hooks/useLLMTests';

// Validation schema
const schema = yup.object().shape({
  targetUrl: yup
    .string()
    .required('URL é obrigatória')
    .url('URL deve ser válida'),
  testDescription: yup
    .string()
    .required('Descrição do teste é obrigatória')
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  testType: yup
    .string()
    .required('Tipo de teste é obrigatório')
    .oneOf(Object.values(TestType)),
  llmProvider: yup
    .string()
    .required('Provedor LLM é obrigatório')
    .oneOf(Object.values(LLMProvider)),
  model: yup.string().optional(),
  additionalContext: yup.string().optional(),
});

type FormData = {
  targetUrl: string;
  testDescription: string;
  testType: TestType;
  llmProvider: LLMProvider;
  model?: string;
  additionalContext?: string;
};

interface LLMTestGeneratorProps {
  onTestGenerated?: () => void;
}

const LLMTestGenerator: React.FC<LLMTestGeneratorProps> = ({
  onTestGenerated,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    advanced: false,
    context: false,
  });

  const { providers, isLoading: isLoadingProviders } = useApiKeys();
  const { generateTest, isGenerating } = useTests();
  const { addNotification } = useLLMNotifications();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      targetUrl: '',
      testDescription: '',
      testType: TestType.E2E,
      llmProvider: LLMProvider.OPENAI,
      model: '',
      additionalContext: '',
    },
  });

  const selectedProvider = watch('llmProvider');

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const generateRequest: GenerateTestRequest = {
        targetUrl: data.targetUrl,
        testDescription: data.testDescription,
        testType: data.testType,
        llmProvider: data.llmProvider,
        model: data.model,
        additionalContext: data.additionalContext,
      };

      generateTest(generateRequest, {
        onSuccess: (response) => {
          addNotification({
            type: 'success',
            title: 'Teste Gerado com Sucesso!',
            message: `Teste "${response.data?.name}" foi criado e está sendo validado.`,
          });
          reset();
          onTestGenerated?.();
        },
        onError: (error: unknown) => {
          addNotification({
            type: 'error',
            title: 'Erro ao Gerar Teste',
            message: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.',
          });
        },
      });
    } catch (error) {
      console.error('Erro ao gerar teste:', error);
    }
  };

  const getTestTypeDescription = (type: TestType) => {
    switch (type) {
      case TestType.E2E:
        return 'Testes end-to-end que simulam o comportamento real do usuário';
      case TestType.VISUAL:
        return 'Testes de regressão visual para detectar mudanças na interface';
      case TestType.PERFORMANCE:
        return 'Testes de performance para medir velocidade e responsividade';
      case TestType.ACCESSIBILITY:
        return 'Testes de acessibilidade para garantir conformidade WCAG';
      default:
        return '';
    }
  };

  const getProviderModels = (provider: LLMProvider) => {
    const providerInfo = providers?.available?.find(p => p.name.toLowerCase().includes(provider));
    return providerInfo?.models || [];
  };

  const hasConfiguredProviders = (providers?.configured?.length || 0) > 0;

  if (!hasConfiguredProviders && !isLoadingProviders) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
        <Typography variant="h6" gutterBottom>
          Nenhum Provedor LLM Configurado
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Para gerar testes com IA, você precisa configurar pelo menos uma API key de um provedor LLM.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          href="#api-keys"
          sx={{ mt: 2 }}
        >
          Configurar API Keys
        </Button>
      </Paper>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Wand2 size={24} className="text-emerald-500 mr-3" />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              Gerar Novo Teste com IA
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Configurações Básicas */}
            <Accordion
              expanded={expandedSections.basic}
              onChange={() => handleSectionToggle('basic')}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ChevronDown />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Settings size={20} className="mr-2" />
                  <Typography variant="h6">Configurações Básicas</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Controller
                      name="targetUrl"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="URL do Site"
                          placeholder="https://exemplo.com"
                          error={!!errors.targetUrl}
                          helperText={errors.targetUrl?.message || 'URL do site que será testado'}
                          InputProps={{
                            startAdornment: (
                              <Globe size={20} className="text-gray-400 mr-2" />
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="testType"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.testType}>
                          <InputLabel>Tipo de Teste</InputLabel>
                          <Select {...field} label="Tipo de Teste">
                            {Object.values(TestType).map((type) => (
                              <MenuItem key={type} value={type}>
                                <Box>
                                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                    {type.replace('_', ' ')}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {getTestTypeDescription(type)}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.testType && (
                            <Typography variant="caption" color="error">
                              {errors.testType.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="llmProvider"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.llmProvider}>
                          <InputLabel>Provedor LLM</InputLabel>
                          <Select {...field} label="Provedor LLM">
                            {providers?.configured?.map((provider) => (
                              <MenuItem key={provider} value={provider}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Chip
                                    label={provider.toUpperCase()}
                                    size="small"
                                    color="primary"
                                    sx={{ mr: 1 }}
                                  />
                                  <Typography variant="body1">
                                    {provider === 'openai' && 'OpenAI GPT'}
                                    {provider === 'anthropic' && 'Anthropic Claude'}
                                    {provider === 'gemini' && 'Google Gemini'}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.llmProvider && (
                            <Typography variant="caption" color="error">
                              {errors.llmProvider.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="testDescription"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={4}
                          label="Descrição do Teste"
                          placeholder="Descreva o que você quer testar. Ex: 'Teste de login com usuário válido e navegação para dashboard'"
                          error={!!errors.testDescription}
                          helperText={
                            errors.testDescription?.message ||
                            'Descreva detalhadamente o comportamento que você quer testar'
                          }
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Configurações Avançadas */}
            <Accordion
              expanded={expandedSections.advanced}
              onChange={() => handleSectionToggle('advanced')}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ChevronDown />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Sparkles size={20} className="mr-2" />
                  <Typography variant="h6">Configurações Avançadas</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {selectedProvider && (
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="model"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Modelo (Opcional)</InputLabel>
                            <Select {...field} label="Modelo (Opcional)">
                              <MenuItem value="">
                                <em>Usar modelo padrão</em>
                              </MenuItem>
                              {getProviderModels(selectedProvider).map((model) => (
                                <MenuItem key={model} value={model}>
                                  {model}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <Info size={16} className="inline mr-1" />
                        Se não especificar um modelo, será usado o modelo padrão do provedor selecionado.
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Contexto Adicional */}
            <Accordion
              expanded={expandedSections.context}
              onChange={() => handleSectionToggle('context')}
              sx={{ mb: 3 }}
            >
              <AccordionSummary expandIcon={<ChevronDown />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Info size={20} className="mr-2" />
                  <Typography variant="h6">Contexto Adicional</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Controller
                  name="additionalContext"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      label="Contexto Adicional (Opcional)"
                      placeholder="Informações extras sobre o site, credenciais de teste, fluxos específicos, etc."
                      helperText="Forneça qualquer informação adicional que possa ajudar a IA a gerar um teste mais preciso"
                    />
                  )}
                />
              </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 3 }} />

            {/* Ações */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  O teste será gerado usando {selectedProvider.toUpperCase()} e validado automaticamente
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => reset()}
                  disabled={isGenerating}
                >
                  Limpar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isGenerating || !hasConfiguredProviders}
                  startIcon={isGenerating ? null : <Wand2 size={20} />}
                  sx={{ minWidth: 140 }}
                >
                  {isGenerating ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress
                        size={20}
                        sx={{ mr: 1 }}
                      />
                      Gerando...
                    </Box>
                  ) : (
                    'Gerar Teste'
                  )}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LLMTestGenerator; 