import axios, { AxiosInstance } from 'axios';
import {
  LLMProvider,
  TestType,
  TestStatus,
  StoreApiKeyRequest,
  StoreApiKeyResponse,
  ListProvidersResponse,
  GenerateTestRequest,
  GenerateTestResponse,
  GeneratedTest,
  TestStatistics,
  TestFilters,
  UpdateTestRequest,
  MCPCommand,
  TestExecutionResult,
  LLMTestsDashboard,
  CustomPromptTemplate,
  UsageMetrics,
  TestComparison
} from '../types/llm-tests';
import { ApiResponse } from '../types';

class LLMTestsApiService {
  private api: AxiosInstance;
  private baseURL = 'http://localhost:3001';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 60000, // 60 segundos para operações LLM
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para tratar respostas
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // =====================================================
  // Métodos de Gerenciamento de API Keys
  // =====================================================

  async storeApiKey(data: StoreApiKeyRequest): Promise<StoreApiKeyResponse> {
    const response = await this.api.post<StoreApiKeyResponse>('/llm-tests/api-keys', data);
    return response.data;
  }

  async listProviders(): Promise<ListProvidersResponse> {
    const response = await this.api.get<ListProvidersResponse>('/llm-tests/api-keys');
    return response.data;
  }

  async validateApiKey(provider: LLMProvider): Promise<ApiResponse<{
    provider: LLMProvider;
    isValid: boolean;
    message: string;
  }>> {
    const response = await this.api.post(`/llm-tests/api-keys/${provider}/validate`);
    return response.data;
  }

  async deleteApiKey(provider: LLMProvider): Promise<ApiResponse> {
    const response = await this.api.delete(`/llm-tests/api-keys/${provider}`);
    return response.data;
  }

  async getApiKeysStatus(): Promise<ApiResponse<Array<{
    provider: LLMProvider;
    isValid: boolean;
    lastChecked: string;
  }>>> {
    const response = await this.api.get('/llm-tests/api-keys/status');
    return response.data;
  }

  // =====================================================
  // Métodos de Geração de Testes
  // =====================================================

  async generateTest(data: GenerateTestRequest): Promise<GenerateTestResponse> {
    const response = await this.api.post<GenerateTestResponse>('/llm-tests/generate', data);
    return response.data;
  }

  async getTests(filters?: TestFilters): Promise<ApiResponse<GeneratedTest[]>> {
    const params = new URLSearchParams();
    
    if (filters?.testType) params.append('testType', filters.testType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.llmProvider) params.append('llmProvider', filters.llmProvider);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const response = await this.api.get(`/llm-tests/generate?${params.toString()}`);
    return response.data;
  }

  async getTestById(id: string): Promise<ApiResponse<GeneratedTest>> {
    const response = await this.api.get(`/llm-tests/generate/${id}`);
    return response.data;
  }

  async updateTest(id: string, data: UpdateTestRequest): Promise<ApiResponse<{
    id: string;
    status: TestStatus;
    updatedAt: Date;
  }>> {
    const response = await this.api.put(`/llm-tests/generate/${id}`, data);
    return response.data;
  }

  async deleteTest(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/llm-tests/generate/${id}`);
    return response.data;
  }

  async regenerateTest(id: string): Promise<ApiResponse<{
    originalId: string;
    newId: string;
    name: string;
    status: TestStatus;
    validationResult: Record<string, unknown>;
    metadata: Record<string, unknown>;
    createdAt: Date;
  }>> {
    const response = await this.api.post(`/llm-tests/generate/${id}/regenerate`);
    return response.data;
  }

  async getMCPCommands(id: string): Promise<ApiResponse<{
    testId: string;
    testName: string;
    mcpCommands: MCPCommand[];
    commandCount: number;
  }>> {
    const response = await this.api.get(`/llm-tests/generate/${id}/mcp-commands`);
    return response.data;
  }

  // =====================================================
  // Métodos de Estatísticas e Dashboard
  // =====================================================

  async getTestStatistics(): Promise<ApiResponse<TestStatistics>> {
    const response = await this.api.get('/llm-tests/generate/statistics');
    return response.data;
  }

  async getDashboardData(): Promise<ApiResponse<LLMTestsDashboard>> {
    const response = await this.api.get('/llm-tests/dashboard');
    return response.data;
  }

  async getUsageMetrics(
    provider?: LLMProvider,
    period?: 'daily' | 'weekly' | 'monthly'
  ): Promise<ApiResponse<UsageMetrics[]>> {
    const params = new URLSearchParams();
    if (provider) params.append('provider', provider);
    if (period) params.append('period', period);

    const response = await this.api.get(`/llm-tests/usage-metrics?${params.toString()}`);
    return response.data;
  }

  // =====================================================
  // Métodos de Execução de Testes
  // =====================================================

  async executeTest(id: string): Promise<ApiResponse<{
    executionId: string;
    testId: string;
    status: string;
    success: boolean;
    duration: number;
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    startedAt: string;
    completedAt: string;
  }>> {
    const response = await this.api.post(`/llm-tests/generate/${id}/execute`);
    return response.data;
  }

  async getExecutionStatus(executionId: string): Promise<ApiResponse<TestExecutionResult>> {
    const response = await this.api.get(`/llm-tests/executions/${executionId}`);
    return response.data;
  }

  async getTestExecutions(testId?: string): Promise<ApiResponse<TestExecutionResult[]>> {
    const params = testId ? `?testId=${testId}` : '';
    const response = await this.api.get(`/llm-tests/executions${params}`);
    return response.data;
  }

  async stopExecution(executionId: string): Promise<ApiResponse> {
    const response = await this.api.post(`/llm-tests/executions/${executionId}/stop`);
    return response.data;
  }

  // =====================================================
  // Métodos de Templates de Prompt
  // =====================================================

  async getPromptTemplates(testType?: TestType): Promise<ApiResponse<CustomPromptTemplate[]>> {
    const params = testType ? `?testType=${testType}` : '';
    const response = await this.api.get(`/llm-tests/prompt-templates${params}`);
    return response.data;
  }

  async createPromptTemplate(template: Omit<CustomPromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<CustomPromptTemplate>> {
    const response = await this.api.post('/llm-tests/prompt-templates', template);
    return response.data;
  }

  async updatePromptTemplate(id: string, template: Partial<CustomPromptTemplate>): Promise<ApiResponse<CustomPromptTemplate>> {
    const response = await this.api.put(`/llm-tests/prompt-templates/${id}`, template);
    return response.data;
  }

  async deletePromptTemplate(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/llm-tests/prompt-templates/${id}`);
    return response.data;
  }

  // =====================================================
  // Métodos de Comparação e Análise
  // =====================================================

  async compareTests(testId1: string, testId2: string): Promise<ApiResponse<TestComparison>> {
    const response = await this.api.post('/llm-tests/compare', {
      testId1,
      testId2
    });
    return response.data;
  }

  async analyzeTest(id: string): Promise<ApiResponse<{
    complexity: number;
    maintainability: number;
    coverage: number;
    recommendations: string[];
    issues: Array<{
      type: 'warning' | 'error' | 'info';
      message: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  }>> {
    const response = await this.api.post(`/llm-tests/analyze/${id}`);
    return response.data;
  }

  // =====================================================
  // Métodos de Exportação e Importação
  // =====================================================

  async exportTest(id: string, format: 'json' | 'playwright' | 'cypress'): Promise<Blob> {
    const response = await this.api.get(`/llm-tests/export/${id}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }

  async exportTests(ids: string[], format: 'json' | 'playwright' | 'cypress'): Promise<Blob> {
    const response = await this.api.post('/llm-tests/export', {
      testIds: ids,
      format
    }, {
      responseType: 'blob'
    });
    return response.data;
  }

  async importTests(file: File): Promise<ApiResponse<{
    imported: number;
    failed: number;
    errors: string[];
  }>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post('/llm-tests/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // =====================================================
  // Métodos de Configuração
  // =====================================================

  async getConfig(): Promise<ApiResponse<{
    enabledProviders: LLMProvider[];
    defaultProvider: LLMProvider;
    maxTestsPerUser: number;
    supportedTestTypes: TestType[];
  }>> {
    const response = await this.api.get('/llm-tests/config');
    return response.data;
  }

  async updateConfig(config: {
    defaultProvider?: LLMProvider;
    enabledProviders?: LLMProvider[];
    maxTestsPerUser?: number;
  }): Promise<ApiResponse> {
    const response = await this.api.put('/llm-tests/config', config);
    return response.data;
  }

  // =====================================================
  // Métodos de Health Check
  // =====================================================

  async healthCheck(): Promise<ApiResponse<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    providers: Record<LLMProvider, {
      status: 'available' | 'unavailable';
      latency?: number;
    }>;
    database: {
      status: 'connected' | 'disconnected';
      latency?: number;
    };
  }>> {
    const response = await this.api.get('/llm-tests/health');
    return response.data;
  }
}

// Instância singleton do serviço
export const llmTestsApi = new LLMTestsApiService();
export default llmTestsApi; 