export interface MCPCommand {
  action: string;
  selector?: string;
  value?: string;
  url?: string;
  description?: string;
  waitFor?: string;
  timeout?: number;
  captureScreenshot?: boolean;
}

export interface MCPCommandResult {
  command: MCPCommand;
  success: boolean;
  duration: number;
  result?: any;
  error?: string;
} 