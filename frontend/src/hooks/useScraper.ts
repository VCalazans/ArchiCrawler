import { useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { ScrapeRequest, ScreenshotRequest, ScrapeResponse } from '../types';
import { useNotification } from './useNotification';

export const useExtractData = () => {
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (request: ScrapeRequest) => apiService.extractData(request),
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Dados extraídos!',
        message: 'Dados extraídos com sucesso.',
      });
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Erro na extração',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });
};

export const useTakeScreenshot = () => {
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (request: ScreenshotRequest) => apiService.takeScreenshot(request),
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Screenshot capturado!',
        message: 'Screenshot capturado com sucesso.',
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

export const useGeneratePDF = () => {
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (request: { url: string; options?: Record<string, unknown> }) =>
      apiService.generatePDF(request),
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'PDF gerado!',
        message: 'PDF gerado com sucesso.',
      });
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Erro na geração do PDF',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });
};

export const useEvaluateScript = () => {
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (request: {
      url: string;
      script: string;
      engine?: string;
      options?: Record<string, unknown>;
    }) => apiService.evaluateScript(request),
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Script executado!',
        message: 'Script executado com sucesso.',
      });
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Erro na execução do script',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });
};

export const useAvailableEngines = () => {
  return useQuery({
    queryKey: ['availableEngines'],
    queryFn: () => apiService.getAvailableEngines(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}; 