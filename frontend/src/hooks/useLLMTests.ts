import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LLMProvider,
  TestType,
  TestFilters,
  StoreApiKeyRequest,
  GenerateTestRequest,
  UpdateTestRequest,
  CustomPromptTemplate
} from '../types/llm-tests';
import { llmTestsApi } from '../services/llm-tests-api';

// =====================================================
// Hook para gerenciamento de API Keys
// =====================================================

export const useApiKeys = () => {
  const queryClient = useQueryClient();

  const providersQuery = useQuery({
    queryKey: ['llm-tests', 'providers'],
    queryFn: () => llmTestsApi.listProviders(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const statusQuery = useQuery({
    queryKey: ['llm-tests', 'api-keys-status'],
    queryFn: () => llmTestsApi.getApiKeysStatus(),
    refetchInterval: 30 * 1000, // 30 segundos
  });

  const storeApiKeyMutation = useMutation({
    mutationFn: (data: StoreApiKeyRequest) => llmTestsApi.storeApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'providers'] });
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'api-keys-status'] });
    },
  });

  const validateApiKeyMutation = useMutation({
    mutationFn: (provider: LLMProvider) => llmTestsApi.validateApiKey(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'api-keys-status'] });
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: (provider: LLMProvider) => llmTestsApi.deleteApiKey(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'providers'] });
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'api-keys-status'] });
    },
  });

  return {
    providers: providersQuery.data?.data,
    apiKeysStatus: statusQuery.data?.data,
    isLoading: providersQuery.isLoading || statusQuery.isLoading,
    error: providersQuery.error || statusQuery.error,
    storeApiKey: storeApiKeyMutation.mutate,
    validateApiKey: validateApiKeyMutation.mutate,
    deleteApiKey: deleteApiKeyMutation.mutate,
    isStoringKey: storeApiKeyMutation.isPending,
    isValidatingKey: validateApiKeyMutation.isPending,
    isDeletingKey: deleteApiKeyMutation.isPending,
  };
};

// =====================================================
// Hook para geração e gerenciamento de testes
// =====================================================

export const useTests = (filters?: TestFilters) => {
  const queryClient = useQueryClient();

  const testsQuery = useQuery({
    queryKey: ['llm-tests', 'tests', filters],
    queryFn: () => llmTestsApi.getTests(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  const generateTestMutation = useMutation({
    mutationFn: (data: GenerateTestRequest) => llmTestsApi.generateTest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'tests'] });
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'statistics'] });
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'dashboard'] });
    },
  });

  const updateTestMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTestRequest }) => 
      llmTestsApi.updateTest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'tests'] });
    },
  });

  const deleteTestMutation = useMutation({
    mutationFn: (id: string) => llmTestsApi.deleteTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'tests'] });
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'statistics'] });
    },
  });

  const regenerateTestMutation = useMutation({
    mutationFn: (id: string) => llmTestsApi.regenerateTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'tests'] });
    },
  });

  return {
    tests: testsQuery.data?.data || [],
    isLoading: testsQuery.isLoading,
    error: testsQuery.error,
    generateTest: generateTestMutation.mutate,
    updateTest: updateTestMutation.mutate,
    deleteTest: deleteTestMutation.mutate,
    regenerateTest: regenerateTestMutation.mutate,
    isGenerating: generateTestMutation.isPending,
    isUpdating: updateTestMutation.isPending,
    isDeleting: deleteTestMutation.isPending,
    isRegenerating: regenerateTestMutation.isPending,
  };
};

// =====================================================
// Hook para um teste específico
// =====================================================

export const useTest = (id: string) => {
  const queryClient = useQueryClient();

  const testQuery = useQuery({
    queryKey: ['llm-tests', 'test', id],
    queryFn: () => llmTestsApi.getTestById(id),
    enabled: !!id,
  });

  const mcpCommandsQuery = useQuery({
    queryKey: ['llm-tests', 'test', id, 'mcp-commands'],
    queryFn: () => llmTestsApi.getMCPCommands(id),
    enabled: !!id,
  });

  const executeTestMutation = useMutation({
    mutationFn: () => llmTestsApi.executeTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'executions'] });
    },
  });

  return {
    test: testQuery.data?.data,
    mcpCommands: mcpCommandsQuery.data?.data,
    isLoading: testQuery.isLoading || mcpCommandsQuery.isLoading,
    error: testQuery.error || mcpCommandsQuery.error,
    executeTest: executeTestMutation.mutate,
    isExecuting: executeTestMutation.isPending,
  };
};

// =====================================================
// Hook para dashboard e estatísticas
// =====================================================

export const useDashboard = () => {
  const dashboardQuery = useQuery({
    queryKey: ['llm-tests', 'dashboard'],
    queryFn: () => llmTestsApi.getDashboardData(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const statisticsQuery = useQuery({
    queryKey: ['llm-tests', 'statistics'],
    queryFn: () => llmTestsApi.getTestStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    dashboard: dashboardQuery.data?.data,
    statistics: statisticsQuery.data?.data,
    isLoading: dashboardQuery.isLoading || statisticsQuery.isLoading,
    error: dashboardQuery.error || statisticsQuery.error,
  };
};

// =====================================================
// Hook para métricas de uso
// =====================================================

export const useUsageMetrics = (provider?: LLMProvider, period?: 'daily' | 'weekly' | 'monthly') => {
  const metricsQuery = useQuery({
    queryKey: ['llm-tests', 'usage-metrics', provider, period],
    queryFn: () => llmTestsApi.getUsageMetrics(provider, period),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    metrics: metricsQuery.data?.data || [],
    isLoading: metricsQuery.isLoading,
    error: metricsQuery.error,
  };
};

// =====================================================
// Hook para execuções de testes
// =====================================================

export const useExecuteTest = () => {
  const queryClient = useQueryClient();

  const executeTestMutation = useMutation({
    mutationFn: (testId: string) => llmTestsApi.executeTest(testId),
    onSuccess: (data, testId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'tests'] });
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'test', testId] });
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'executions'] });
    },
  });

  return {
    executeTest: executeTestMutation.mutate,
    isExecuting: executeTestMutation.isPending,
    executionData: executeTestMutation.data?.data,
    error: executeTestMutation.error,
  };
};

export const useTestExecutions = (testId?: string) => {
  const executionsQuery = useQuery({
    queryKey: ['llm-tests', 'executions', testId],
    queryFn: () => llmTestsApi.getTestExecutions(testId),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 10 * 1000, // 10 segundos para execuções ativas
  });

  const stopExecutionMutation = useMutation({
    mutationFn: (executionId: string) => llmTestsApi.stopExecution(executionId),
    onSuccess: () => {
      executionsQuery.refetch();
    },
  });

  return {
    executions: executionsQuery.data?.data || [],
    isLoading: executionsQuery.isLoading,
    error: executionsQuery.error,
    stopExecution: stopExecutionMutation.mutate,
    isStopping: stopExecutionMutation.isPending,
  };
};

// =====================================================
// Hook para templates de prompt
// =====================================================

export const usePromptTemplates = (testType?: TestType) => {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ['llm-tests', 'prompt-templates', testType],
    queryFn: () => llmTestsApi.getPromptTemplates(testType),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  const createTemplateMutation = useMutation({
    mutationFn: (template: Omit<CustomPromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => 
      llmTestsApi.createPromptTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'prompt-templates'] });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, template }: { id: string; template: Partial<CustomPromptTemplate> }) => 
      llmTestsApi.updatePromptTemplate(id, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'prompt-templates'] });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => llmTestsApi.deletePromptTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'prompt-templates'] });
    },
  });

  return {
    templates: templatesQuery.data?.data || [],
    isLoading: templatesQuery.isLoading,
    error: templatesQuery.error,
    createTemplate: createTemplateMutation.mutate,
    updateTemplate: updateTemplateMutation.mutate,
    deleteTemplate: deleteTemplateMutation.mutate,
    isCreating: createTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    isDeleting: deleteTemplateMutation.isPending,
  };
};

// =====================================================
// Hook para configurações do módulo
// =====================================================

export const useLLMConfig = () => {
  const queryClient = useQueryClient();

  const configQuery = useQuery({
    queryKey: ['llm-tests', 'config'],
    queryFn: () => llmTestsApi.getConfig(),
    staleTime: 30 * 60 * 1000, // 30 minutos
  });

  const updateConfigMutation = useMutation({
    mutationFn: (config: {
      defaultProvider?: LLMProvider;
      enabledProviders?: LLMProvider[];
      maxTestsPerUser?: number;
    }) => llmTestsApi.updateConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-tests', 'config'] });
    },
  });

  return {
    config: configQuery.data?.data,
    isLoading: configQuery.isLoading,
    error: configQuery.error,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
  };
};

// =====================================================
// Hook para filtros persistentes
// =====================================================

export const useTestFilters = () => {
  const [filters, setFilters] = useState<TestFilters>({
    limit: 20,
    page: 1,
  });

  const updateFilters = useCallback((newFilters: Partial<TestFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page ?? 1, // Reset page when other filters change
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      limit: 20,
      page: 1,
    });
  }, []);

  return {
    filters,
    updateFilters,
    clearFilters,
  };
};

// =====================================================
// Hook para notificações do módulo LLM
// =====================================================

export const useLLMNotifications = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
  }>>([]);

  const addNotification = useCallback((notification: {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, {
      id,
      ...notification,
      timestamp: new Date(),
    }]);

    // Auto-remove after 5 seconds for success/info
    if (notification.type === 'success' || notification.type === 'info') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };
};

// =====================================================
// Hook para health check
// =====================================================

export const useHealthCheck = () => {
  const healthQuery = useQuery({
    queryKey: ['llm-tests', 'health'],
    queryFn: () => llmTestsApi.healthCheck(),
    refetchInterval: 60 * 1000, // 1 minuto
    staleTime: 30 * 1000, // 30 segundos
  });

  return {
    health: healthQuery.data?.data,
    isLoading: healthQuery.isLoading,
    error: healthQuery.error,
  };
}; 