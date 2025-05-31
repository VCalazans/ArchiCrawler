import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DynamicTestAgentService } from '../services/dynamic-test-agent.service';
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
    data?: any;
}
export declare class DynamicTestChatController {
    private readonly dynamicAgent;
    private readonly logger;
    constructor(dynamicAgent: DynamicTestAgentService);
    startChatTest(request: ChatTestRequest): Promise<ChatResponse>;
    streamExecution(executionId: string): Observable<MessageEvent>;
    stopExecution(executionId: string): Promise<ChatResponse>;
    getExecutionStatus(): Promise<ChatResponse>;
    private createMockExecutionStream;
}
