import axios, { AxiosError } from 'axios';

// Tipos para o sistema dinâmico
export interface ChatTestRequest {
  message: string;
  targetUrl: string;
  llmProvider: string;
  model?: string;
}

export interface ChatResponse {
  success: boolean;
  executionId?: string;
  message: string;
  data?: unknown;
}

export interface AgentStepData {
  id: string;
  description: string;
  timestamp: string;
  duration: number;
  success: boolean;
  screenshot?: string;
  thoughts: string;
  confidence: number;
}

export interface ExecutionStatus {
  activeExecutions: string[];
  totalExecutions: number;
}

export class DynamicTestApiService {
  private baseURL = 'http://localhost:3001';

  /**
   * 🚀 Inicia um teste dinâmico via chat
   */
  async startChatTest(request: ChatTestRequest): Promise<ChatResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/llm-tests/chat/execute`, request, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      throw new Error(`Erro ao iniciar teste: ${axiosError.response?.data?.message || axiosError.message}`);
    }
  }

  /**
   * 📡 Cria uma conexão SSE para acompanhar execução em tempo real
   */
  createExecutionStream(executionId: string): EventSource {
    const eventSource = new EventSource(`${this.baseURL}/llm-tests/chat/stream/${executionId}`);
    return eventSource;
  }

  /**
   * 🛑 Para uma execução em andamento
   */
  async stopExecution(executionId: string): Promise<ChatResponse> {
    try {
      const response = await axios.delete(`${this.baseURL}/llm-tests/chat/execution/${executionId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      throw new Error(`Erro ao parar execução: ${axiosError.response?.data?.message || axiosError.message}`);
    }
  }

  /**
   * 📊 Obtém status das execuções
   */
  async getExecutionStatus(): Promise<ExecutionStatus> {
    try {
      const response = await axios.get(`${this.baseURL}/llm-tests/chat/status`);
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      throw new Error(`Erro ao obter status: ${axiosError.response?.data?.message || axiosError.message}`);
    }
  }

  /**
   * 🔑 Configura API key para LLM
   */
  async setApiKey(provider: string, apiKey: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/llm-tests/api-keys`, {
        provider,
        apiKey
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      throw new Error(`Erro ao configurar API key: ${axiosError.response?.data?.message || axiosError.message}`);
    }
  }
}

export const dynamicTestApi = new DynamicTestApiService(); 