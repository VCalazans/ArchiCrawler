export interface TestPrompt {
  system: string;
  user: string;
  examples?: any[];
  context?: string;
}

export interface GeneratedTestResult {
  testCode: string;
  mcpCommands: MCPCommand[];
  metadata: {
    tokensUsed: number;
    model: string;
    provider: string;
    confidence: number;
    estimatedDuration?: string;
    testName?: string;
    description?: string;
    expectedResults?: string[];
    tags?: string[];
    readableCode?: string;
  };
}

export interface LLMProvider {
  readonly name: string;
  readonly apiVersion: string;
  
  generateTest(prompt: TestPrompt, apiKey: string): Promise<GeneratedTestResult>;
  validateApiKey(apiKey: string): Promise<boolean>;
  estimateTokens(prompt: string): number;
  getSupportedModels(): string[];
}

export interface MCPCommand {
  action: 'navigate' | 'click' | 'fill' | 'screenshot' | 'wait' | 'assert' | 'hover' | 'select' | 'press_key' | 'get_text' | 'evaluate';
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
  name?: string;
  fullPage?: boolean;
  description?: string;
  key?: string;
  script?: string;
  captureScreenshot?: boolean;
  waitFor?: string;
} 