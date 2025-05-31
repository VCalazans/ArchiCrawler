// Tipos de Usuário e Autenticação
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  lastLoginIP?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MCP_CLIENT = 'mcp-client'
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: string;
  user: User;
}

export interface ApiKey {
  id: string;
  name: string;
  key?: string; // Só retornado na criação
  permissions: string[];
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface MCPClient {
  id: string;
  name: string;
  clientId: string;
  clientSecret?: string; // Só retornado na criação
  permissions: string[];
  allowedIPs: string[];
  isActive: boolean;
  createdAt: Date;
}

// Tipos de Scraping
export interface ScrapeRequest {
  url: string;
  selector?: string;
  engine?: EngineType;
  waitForSelector?: string;
  options?: ScrapeOptions;
}

export interface ScrapeOptions {
  headless?: boolean;
  timeout?: number;
  userAgent?: string;
  width?: number;
  height?: number;
  ignoreHTTPSErrors?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export enum EngineType {
  PLAYWRIGHT = 'playwright',
  PUPPETEER = 'puppeteer'
}

export interface ScrapeResponse {
  status: string;
  data: Record<string, unknown> | string | number | boolean | null;
  url: string;
  timeTaken: number;
  engine: string;
}

export interface ScreenshotRequest {
  url: string;
  selector?: string;
  engine?: EngineType;
  options?: ScreenshotOptions;
}

export interface ScreenshotOptions extends ScrapeOptions {
  fullPage?: boolean;
  quality?: number;
  format?: 'png' | 'jpeg';
}

// Tipos de Teste de Interface
export interface TestFlow {
  id: string;
  name: string;
  description?: string;
  steps: TestStep[];
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  status: TestFlowStatus;
}

export enum TestFlowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived'
}

export interface TestStep {
  id: string;
  type: TestStepType;
  name: string;
  description?: string;
  config: TestStepConfig;
  order: number;
  isEnabled: boolean;
}

export enum TestStepType {
  NAVIGATE = 'navigate',
  CLICK = 'click',
  FILL = 'fill',
  WAIT = 'wait',
  SCREENSHOT = 'screenshot',
  EXTRACT = 'extract',
  ASSERT = 'assert',
  CUSTOM_SCRIPT = 'custom_script'
}

export interface TestStepConfig {
  url?: string;
  selector?: string;
  value?: string;
  timeout?: number;
  assertion?: AssertionConfig;
  script?: string;
  [key: string]: string | number | boolean | AssertionConfig | undefined;
}

export interface AssertionConfig {
  type: 'text' | 'attribute' | 'visible' | 'count';
  expected: string | number | boolean;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
}

export interface TestExecution {
  id: string;
  flowId: string;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  results: TestStepResult[];
  error?: string;
  screenshots: string[];
}

export enum ExecutionStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface TestStepResult {
  stepId: string;
  status: 'success' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  data?: Record<string, unknown> | string | number | boolean | null;
  screenshot?: string;
}

// Tipos de MCP
export interface MCPServer {
  name: string;
  description: string;
  isRunning: boolean;
  networkMode?: string;
  connectionInfo?: MCPConnectionInfo;
}

export interface MCPConnectionInfo {
  type: string;
  host?: string;
  port?: number;
  url?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

// Tipos de UI/UX
export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

// Tipos de Resposta da API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos de Formulário
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: Record<string, unknown>;
}

// Tipos de Notificação
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
}

// Tipos de Dashboard
export interface DashboardStats {
  totalFlows: number;
  activeFlows: number;
  totalExecutions: number;
  successRate: number;
  avgExecutionTime: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
} 