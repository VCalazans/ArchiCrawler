import { useState, useCallback, useRef, useEffect } from 'react';
import { dynamicTestApi, ChatTestRequest, AgentStepData } from '../services/dynamic-test-api';

export interface DynamicTestState {
  isExecuting: boolean;
  executionId: string | null;
  steps: AgentStepData[];
  error: string | null;
  currentStep: AgentStepData | null;
}

export const useDynamicTest = () => {
  const [state, setState] = useState<DynamicTestState>({
    isExecuting: false,
    executionId: null,
    steps: [],
    error: null,
    currentStep: null
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  // 🚀 Inicia execução de teste
  const startTest = useCallback(async (request: ChatTestRequest) => {
    try {
      setState(prev => ({
        ...prev,
        isExecuting: true,
        error: null,
        steps: [],
        currentStep: null
      }));

      const response = await dynamicTestApi.startChatTest(request);
      
      if (response.success && response.executionId) {
        setState(prev => ({
          ...prev,
          executionId: response.executionId!
        }));

        // Conectar ao stream SSE
        connectToStream(response.executionId);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isExecuting: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  }, []);

  // 📡 Conecta ao stream SSE
  const connectToStream = useCallback((executionId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = dynamicTestApi.createExecutionStream(executionId);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const stepData: AgentStepData = JSON.parse(event.data);
        
        setState(prev => ({
          ...prev,
          steps: [...prev.steps, stepData],
          currentStep: stepData
        }));
      } catch (error) {
        console.error('Erro ao processar evento SSE:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Erro no EventSource:', error);
      setState(prev => ({
        ...prev,
        error: 'Erro na conexão com o servidor'
      }));
    };

    eventSource.addEventListener('close', () => {
      setState(prev => ({
        ...prev,
        isExecuting: false
      }));
      eventSource.close();
    });

  }, []);

  // 🛑 Para execução
  const stopTest = useCallback(async () => {
    if (!state.executionId) return;

    try {
      await dynamicTestApi.stopExecution(state.executionId);
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      setState(prev => ({
        ...prev,
        isExecuting: false,
        executionId: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao parar execução'
      }));
    }
  }, [state.executionId]);

  // 🧹 Limpa estado
  const clearState = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setState({
      isExecuting: false,
      executionId: null,
      steps: [],
      error: null,
      currentStep: null
    });
  }, []);

  // 🔄 Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    ...state,
    startTest,
    stopTest,
    clearState
  };
}; 