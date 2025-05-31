// =====================================================
// Tipos do Módulo LLM Tests
// =====================================================

import { ApiResponse } from './index';

// Tipos de Provedores LLM
export enum LLMProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GEMINI = 'gemini'
}

export enum TestType {
  E2E = 'e2e',
  VISUAL = 'visual',
  PERFORMANCE = 'performance',
  ACCESSIBILITY = 'accessibility'
}

export enum TestStatus {
  DRAFT = 'draft',
  VALIDATED = 'validated',
  ACTIVE = 'active',
  FAILED = 'failed',
  ARCHIVED = 'archived'
}

// Interface para chaves API de usuários
export interface UserApiKey {
  id: string;
  userId: string;
  provider: LLMProvider;
  isActive: boolean;
  metadata: {
    lastValidated?: Date;
    modelsAccess?: string[];
    monthlyUsage?: number;
    validationStatus?: 'valid' | 'invalid' | 'pending';
  };
  createdAt: Date;
  updatedAt: Date;
}

// Interface para configurações de provedores LLM
export interface LLMProviderConfig {
  id: string;
  provider: LLMProvider;
  name: string;
  description: string;
  supportedModels: string[];
  defaultSettings: {
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
  };
  pricing: {
    inputTokenCost?: number;
    outputTokenCost?: number;
    currency?: string;
  };
  isActive: boolean;
  apiVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para comandos MCP
export interface MCPCommand {
  action: 'navigate' | 'click' | 'fill' | 'screenshot' | 'wait' | 'assert' | 'hover' | 'select';
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
  name?: string;
  fullPage?: boolean;
}

// Interface para resultado de validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

// Interface para testes gerados
export interface GeneratedTest {
  id: string;
  userId: string;
  name: string;
  description: string;
  targetUrl: string;
  testType: TestType;
  llmProvider: LLMProvider;
  model: string;
  originalPrompt: {
    system: string;
    user: string;
    examples?: Record<string, unknown>[];
    context?: string;
  };
  generatedCode: string;
  mcpCommands: MCPCommand[];
  validationResult?: ValidationResult;
  status: TestStatus;
  executionHistory?: TestExecutionResult[];
  metadata: {
    tokensUsed?: number;
    confidence?: number;
    estimatedDuration?: string;
    tags?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Interface para resultado de execução de teste
export interface TestExecutionResult {
  id: string;
  testId: string;
  success: boolean;
  duration: number;
  screenshots: string[];
  errors: string[];
  logs: string[];
  startedAt: Date;
  completedAt?: Date;
  mcpCommandResults: MCPCommandResult[];
}

export interface MCPCommandResult {
  command: MCPCommand;
  success: boolean;
  duration: number;
  error?: string;
  screenshot?: string;
  data?: Record<string, unknown>;
}

// DTOs para requisições da API
export interface StoreApiKeyRequest {
  provider: LLMProvider;
  apiKey: string;
}

export interface GenerateTestRequest {
  targetUrl: string;
  testDescription: string;
  testType: TestType;
  llmProvider: LLMProvider;
  model?: string;
  additionalContext?: string;
}

export interface UpdateTestRequest {
  name?: string;
  description?: string;
  status?: TestStatus;
}

// Respostas da API
export type StoreApiKeyResponse = ApiResponse<{
  provider: LLMProvider;
}>;

export type ListProvidersResponse = ApiResponse<{
  configured: LLMProvider[];
  available: Array<{
    name: string;
    description: string;
    models: string[];
  }>;
}>;

export type GenerateTestResponse = ApiResponse<{
  id: string;
  name: string;
  status: TestStatus;
  testType: TestType;
  targetUrl: string;
  llmProvider: LLMProvider;
  model: string;
  validationResult: ValidationResult;
  metadata: {
    tokensUsed: number;
    confidence: number;
    estimatedDuration: string;
  };
  createdAt: Date;
}>;

export interface TestStatistics {
  total: number;
  byType: Record<TestType, number>;
  byStatus: Record<TestStatus, number>;
  byProvider: Record<LLMProvider, number>;
}

// Interface para configuração do módulo LLM Tests
export interface LLMTestsConfig {
  enabledProviders: LLMProvider[];
  defaultProvider: LLMProvider;
  defaultTestType: TestType;
  maxTestsPerUser: number;
  autoValidation: boolean;
  defaultPromptTemplates: Record<TestType, string>;
}

// Interface para dashboard de estatísticas
export interface LLMTestsDashboard {
  totalTests: number;
  validatedTests: number;
  averageScore: number;
  recentTests: GeneratedTest[];
  topProviders: Array<{
    provider: LLMProvider;
    count: number;
    successRate: number;
  }>;
  testTypeDistribution: Record<TestType, number>;
  weeklyStats: Array<{
    date: string;
    generated: number;
    executed: number;
    success: number;
  }>;
}

// Interface para filtros de busca
export interface TestFilters {
  testType?: TestType;
  status?: TestStatus;
  llmProvider?: LLMProvider;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  limit?: number;
  page?: number;
}

// Interface para configuração de prompts personalizados
export interface CustomPromptTemplate {
  id: string;
  name: string;
  description: string;
  testType: TestType;
  systemPrompt: string;
  userPromptTemplate: string;
  examples?: Record<string, unknown>[];
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para notificações específicas do módulo LLM
export interface LLMTestNotification {
  type: 'test_generated' | 'test_executed' | 'api_key_expired' | 'validation_failed';
  testId?: string;
  provider?: LLMProvider;
  message: string;
  timestamp: Date;
}

// Interface para métricas de uso
export interface UsageMetrics {
  userId: string;
  provider: LLMProvider;
  period: 'daily' | 'weekly' | 'monthly';
  totalRequests: number;
  tokensUsed: number;
  estimatedCost: number;
  averageResponseTime: number;
  successRate: number;
  createdAt: Date;
}

// Interface para configurações avançadas
export interface AdvancedTestConfig {
  enableScreenshots: boolean;
  screenshotFrequency: 'critical' | 'all' | 'errors';
  enablePerformanceMetrics: boolean;
  enableAccessibilityChecks: boolean;
  customSelectors: Record<string, string>;
  waitStrategies: {
    defaultTimeout: number;
    elementTimeout: number;
    navigationTimeout: number;
  };
  retryConfig: {
    maxRetries: number;
    retryDelay: number;
  };
}

// Interface para comparação de testes
export interface TestComparison {
  originalTest: GeneratedTest;
  comparedTest: GeneratedTest;
  differences: {
    commands: {
      added: MCPCommand[];
      removed: MCPCommand[];
      modified: Array<{
        original: MCPCommand;
        updated: MCPCommand;
      }>;
    };
    metadata: {
      scoreDifference: number;
      confidenceDifference: number;
      complexityDifference: number;
    };
  };
  recommendation: 'use_original' | 'use_compared' | 'manual_review';
} 