export interface TestGenerationRequest {
  targetUrl: string;
  testDescription: string;
  testType: 'e2e' | 'visual' | 'performance' | 'accessibility';
  llmProvider: string;
  model?: string;
  additionalContext?: string;
  userId: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

export interface TestExecutionResult {
  success: boolean;
  duration: number;
  screenshots: string[];
  errors: string[];
  logs: string[];
} 