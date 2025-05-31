import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  User,
  ApiKey,
  MCPClient,
  ScrapeRequest,
  ScrapeResponse,
  ScreenshotRequest,
  TestFlow,
  TestExecution,
  MCPServer,
  ApiResponse,
  PaginatedResponse
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'http://localhost:3001';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
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

  // Métodos de Autenticação
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<ApiResponse<User>> {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  // Métodos de API Keys
  async createApiKey(data: {
    name: string;
    permissions?: string[];
    expiresInDays?: number;
  }): Promise<ApiResponse<ApiKey>> {
    const response = await this.api.post('/auth/api-keys', data);
    return response.data;
  }

  async getApiKeys(): Promise<ApiResponse<ApiKey[]>> {
    const response = await this.api.get('/auth/api-keys');
    return response.data;
  }

  async revokeApiKey(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/auth/api-keys/${id}`);
    return response.data;
  }

  // Métodos de MCP Clients
  async createMCPClient(data: {
    name: string;
    permissions?: string[];
    allowedIPs?: string[];
  }): Promise<ApiResponse<MCPClient>> {
    const response = await this.api.post('/auth/mcp-clients', data);
    return response.data;
  }

  async getMCPClients(): Promise<ApiResponse<MCPClient[]>> {
    const response = await this.api.get('/auth/mcp-clients');
    return response.data;
  }

  async revokeMCPClient(clientId: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/auth/mcp-clients/${clientId}`);
    return response.data;
  }

  // Métodos de Scraping
  async extractData(request: ScrapeRequest): Promise<ScrapeResponse> {
    const response = await this.api.post<ScrapeResponse>('/scraper/extract', request);
    return response.data;
  }

  async takeScreenshot(request: ScreenshotRequest): Promise<Blob> {
    const response = await this.api.post('/scraper/screenshot', request, {
      responseType: 'blob',
    });
    return response.data;
  }

  async generatePDF(request: {
    url: string;
    options?: Record<string, unknown>;
  }): Promise<Blob> {
    const response = await this.api.post('/scraper/pdf', request, {
      responseType: 'blob',
    });
    return response.data;
  }

  async evaluateScript(request: {
    url: string;
    script: string;
    engine?: string;
    options?: Record<string, unknown>;
  }): Promise<ScrapeResponse> {
    const response = await this.api.post<ScrapeResponse>('/scraper/evaluate', request);
    return response.data;
  }

  async getAvailableEngines(): Promise<{
    availableEngines: string[];
    defaultEngine: string;
  }> {
    const response = await this.api.get('/scraper/engines');
    return response.data;
  }

  // Métodos de MCP
  async getMCPServers(): Promise<ApiResponse<MCPServer[]>> {
    const response = await this.api.get('/mcp/servers');
    return response.data;
  }

  async startMCPServer(serverName: string): Promise<ApiResponse> {
    const response = await this.api.post(`/mcp/servers/${serverName}/start`);
    return response.data;
  }

  async stopMCPServer(serverName: string): Promise<ApiResponse> {
    const response = await this.api.post(`/mcp/servers/${serverName}/stop`);
    return response.data;
  }

  async getMCPServerStatus(serverName: string): Promise<ApiResponse> {
    const response = await this.api.get(`/mcp/servers/${serverName}/status`);
    return response.data;
  }

  async getMCPTools(serverName: string): Promise<ApiResponse> {
    const response = await this.api.get(`/mcp/servers/${serverName}/tools`);
    return response.data;
  }

  async callMCPTool(data: {
    serverName: string;
    toolName: string;
    arguments: Record<string, unknown>;
  }): Promise<ApiResponse> {
    const response = await this.api.post('/mcp/call-tool', data);
    return response.data;
  }

  // Métodos específicos do Playwright MCP
  async playwrightNavigate(url: string): Promise<ApiResponse> {
    const response = await this.api.post('/mcp/playwright/navigate', { url });
    return response.data;
  }

  async playwrightClick(element: string): Promise<ApiResponse> {
    const response = await this.api.post('/mcp/playwright/click', { element });
    return response.data;
  }

  async playwrightFill(element: string, text: string): Promise<ApiResponse> {
    const response = await this.api.post('/mcp/playwright/fill', { element, text });
    return response.data;
  }

  async playwrightScreenshot(options?: {
    filename?: string;
    raw?: boolean;
  }): Promise<ApiResponse> {
    const response = await this.api.post('/mcp/playwright/screenshot', options || {});
    return response.data;
  }

  // Métodos de Teste de Interface (para implementação futura)
  async createTestFlow(flow: Omit<TestFlow, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<TestFlow>> {
    // TODO: Implementar endpoint no backend
    const response = await this.api.post('/test-flows', flow);
    return response.data;
  }

  async getTestFlows(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<TestFlow>> {
    // TODO: Implementar endpoint no backend
    const response = await this.api.get('/test-flows', { params });
    return response.data;
  }

  async getTestFlow(id: string): Promise<ApiResponse<TestFlow>> {
    // TODO: Implementar endpoint no backend
    const response = await this.api.get(`/test-flows/${id}`);
    return response.data;
  }

  async updateTestFlow(id: string, flow: Partial<TestFlow>): Promise<ApiResponse<TestFlow>> {
    // TODO: Implementar endpoint no backend
    const response = await this.api.put(`/test-flows/${id}`, flow);
    return response.data;
  }

  async deleteTestFlow(id: string): Promise<ApiResponse> {
    // TODO: Implementar endpoint no backend
    const response = await this.api.delete(`/test-flows/${id}`);
    return response.data;
  }

  async executeTestFlow(id: string): Promise<ApiResponse<TestExecution>> {
    // TODO: Implementar endpoint no backend
    const response = await this.api.post(`/test-flows/${id}/execute`);
    return response.data;
  }

  async getTestExecutions(flowId?: string): Promise<PaginatedResponse<TestExecution>> {
    // TODO: Implementar endpoint no backend
    const params = flowId ? { flowId } : {};
    const response = await this.api.get('/test-executions', { params });
    return response.data;
  }

  async getTestExecution(id: string): Promise<ApiResponse<TestExecution>> {
    // TODO: Implementar endpoint no backend
    const response = await this.api.get(`/test-executions/${id}`);
    return response.data;
  }

  // Métodos de Health Check
  async healthCheck(): Promise<Record<string, unknown>> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Método para upload de arquivos
  async uploadFile(file: File, endpoint: string): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Método para download de arquivos
  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.api.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

export const apiService = new ApiService();
export default apiService; 