import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { TestFlow, TestStep } from '../types';

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

  return useMutation({
    mutationFn: (flow: Omit<TestFlow, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiService.createTestFlow(flow),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testFlows'] });
    },
  });
};

export const useUpdateTestFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, flow }: { id: string; flow: Partial<TestFlow> }) =>
      apiService.updateTestFlow(id, flow),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['testFlows'] });
      queryClient.invalidateQueries({ queryKey: ['testFlow', variables.id] });
    },
  });
};

export const useUpdateTestFlowSteps = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, steps }: { id: string; steps: TestStep[] }) =>
      apiService.updateTestFlow(id, { steps }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['testFlows'] });
      queryClient.invalidateQueries({ queryKey: ['testFlow', variables.id] });
    },
  });
};

export const useDeleteTestFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteTestFlow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testFlows'] });
    },
  });
};

export const useExecuteTestFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.executeTestFlow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testExecutions'] });
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
    refetchInterval: (query) => {
      // Só continua atualizando se estiver em execução
      const execution = query.state.data?.data;
      return execution?.status === 'running' ? 2000 : false;
    },
  });
}; 