import { MCPCommandResult } from '../interfaces/mcp-command.interface';
export declare class TestExecutionResult {
    id: string;
    testId: string;
    userId: string;
    startedAt: Date;
    completedAt?: Date;
    duration: number;
    success: boolean;
    status: 'running' | 'completed' | 'failed' | 'stopped';
    logs: string[];
    screenshots: string[];
    errors: string[];
    mcpCommandResults: MCPCommandResult[];
    createdAt: Date;
    updatedAt: Date;
}
