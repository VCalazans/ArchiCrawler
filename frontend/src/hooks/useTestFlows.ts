import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { TestFlow } from '../types';
import { useNotification } from './useNotification';

export const useTestFlows = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['testFlows', params],
    queryFn: () => apiService.getTestFlows(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useTestFlow = (id: string) => {
  return useQuery({
    queryKey: ['testFlow', id],
    queryFn: () => apiService.getTestFlow(id),
    enabled: !!id,
  });
};

export const useCreateTestFlow = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (flow: Omit<TestFlow, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiService.createTestFlow(flow),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testFlows'] });
      showNotification({
        type: 'success',
        title: 'Fluxo criado!',
        message: 'Fluxo de teste criado com sucesso.',
      });
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Erro ao criar fluxo',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });
};

export const useUpdateTestFlow = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: ({ id, flow }: { id: string; flow: Partial<TestFlow> }) =>
      apiService.updateTestFlow(id, flow),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['testFlows'] });
      queryClient.invalidateQueries({ queryKey: ['testFlow', variables.id] });
      showNotification({
        type: 'success',
        title: 'Fluxo atualizado!',
        message: 'Fluxo de teste atualizado com sucesso.',
      });
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Erro ao atualizar fluxo',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });
};

export const useDeleteTestFlow = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteTestFlow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testFlows'] });
      showNotification({
        type: 'success',
        title: 'Fluxo excluído!',
        message: 'Fluxo de teste excluído com sucesso.',
      });
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Erro ao excluir fluxo',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });
};

export const useExecuteTestFlow = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (id: string) => apiService.executeTestFlow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testExecutions'] });
      showNotification({
        type: 'success',
        title: 'Execução iniciada!',
        message: 'Execução do fluxo de teste iniciada com sucesso.',
      });
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Erro ao executar fluxo',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });
};

export const useTestExecutions = (flowId?: string) => {
  return useQuery({
    queryKey: ['testExecutions', flowId],
    queryFn: () => apiService.getTestExecutions(flowId),
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });
};

export const useTestExecution = (id: string) => {
  return useQuery({
    queryKey: ['testExecution', id],
    queryFn: () => apiService.getTestExecution(id),
    enabled: !!id,
    refetchInterval: (data) => {
      // Só continua atualizando se estiver em execução
      const execution = data?.data;
      return execution?.status === 'running' ? 2000 : false;
    },
  });
}; 