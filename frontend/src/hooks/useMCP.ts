import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { MCPServer } from '../types';
import { useNotification } from './useNotification';

export const useMCPServers = () => {
  return useQuery({
    queryKey: ['mcpServers'],
    queryFn: () => apiService.getMCPServers(),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 10 * 1000, // Atualiza a cada 10 segundos
  });
};

export const useStartMCPServer = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (serverName: string) => apiService.startMCPServer(serverName),
    onSuccess: (_, serverName) => {
      queryClient.invalidateQueries({ queryKey: ['mcpServers'] });
      showNotification({
        type: 'success',
        title: 'Servidor iniciado!',
        message: `Servidor MCP ${serverName} iniciado com sucesso.`,
      });
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Erro ao iniciar servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });
};

export const useStopMCPServer = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (serverName: string) => apiService.stopMCPServer(serverName),
    onSuccess: (_, serverName) => {
      queryClient.invalidateQueries({ queryKey: ['mcpServers'] });
      showNotification({
        type: 'success',
        title: 'Servidor parado!',
        message: `Servidor MCP ${serverName} parado com sucesso.`,
      });
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Erro ao parar servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });
};

export const useMCPServerStatus = (serverName: string) => {
  return useQuery({
    queryKey: ['mcpServerStatus', serverName],
    queryFn: () => apiService.getMCPServerStatus(serverName),
    enabled: !!serverName,
    refetchInterval: 5 * 1000, // Atualiza a cada 5 segundos
  });
};

export const useMCPTools = (serverName: string) => {
  return useQuery({
    queryKey: ['mcpTools', serverName],
    queryFn: () => apiService.getMCPTools(serverName),
    enabled: !!serverName,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useCallMCPTool = () => {
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (data: {
      serverName: string;
      toolName: string;
      arguments: Record<string, unknown>;
    }) => apiService.callMCPTool(data),
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Ferramenta executada!',
        message: 'Ferramenta MCP executada com sucesso.',
      });
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Erro na execução da ferramenta',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });
};

// Hooks específicos para Playwright MCP
export const usePlaywrightNavigate = () => {
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (url: string) => apiService.playwrightNavigate(url),
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Navegação realizada!',
        message: 'Navegação do Playwright realizada com sucesso.',
      });
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Erro na navegação',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });
};

export const usePlaywrightClick = () => {
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (element: string) => apiService.playwrightClick(element),
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Clique realizado!',
        message: 'Clique do Playwright realizado com sucesso.',
      });
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Erro no clique',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });
};

export const usePlaywrightFill = () => {
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: ({ element, text }: { element: string; text: string }) =>
      apiService.playwrightFill(element, text),
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Campo preenchido!',
        message: 'Campo do Playwright preenchido com sucesso.',
      });
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Erro no preenchimento',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });
};

export const usePlaywrightScreenshot = () => {
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (options?: { filename?: string; raw?: boolean }) =>
      apiService.playwrightScreenshot(options),
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Screenshot capturado!',
        message: 'Screenshot do Playwright capturado com sucesso.',
      });
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Erro no screenshot',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });
}; 