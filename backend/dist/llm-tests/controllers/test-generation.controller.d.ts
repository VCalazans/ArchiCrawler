import { LLMTestGeneratorService } from '../services/llm-test-generator.service';
import { LLMTestExecutionService } from '../services/llm-test-execution.service';
import { GenerateTestDto, UpdateTestDto } from '../dto/generate-test.dto';
import { TestExecutionStatus } from '../../entities/test-execution.entity';
export declare class TestGenerationController {
    private readonly testGenerator;
    private readonly testExecution;
    private readonly DEMO_USER_ID;
    constructor(testGenerator: LLMTestGeneratorService, testExecution: LLMTestExecutionService);
    private getUserId;
    generateTest(dto: GenerateTestDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            status: "draft" | "active" | "archived" | "failed" | "validated";
            testType: string;
            targetUrl: string;
            llmProvider: string;
            model: string;
            validationResult: any;
            metadata: {
                tokensUsed?: number;
                confidence?: number;
                estimatedDuration?: string;
                tags?: string[];
            };
            createdAt: Date;
        };
    }>;
    getTests(req: any, testType?: string, status?: string, llmProvider?: string, limit?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            description: string;
            status: "draft" | "active" | "archived" | "failed" | "validated";
            testType: string;
            targetUrl: string;
            llmProvider: string;
            model: string;
            validationResult: any;
            metadata: {
                tokensUsed?: number;
                confidence?: number;
                estimatedDuration?: string;
                tags?: string[];
            };
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    getStatistics(req: any): Promise<{
        success: boolean;
        data: {
            total: number;
            byType: Record<string, number>;
            byStatus: Record<string, number>;
            byProvider: Record<string, number>;
        };
    }>;
    getTestById(id: string, req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            description: string;
            status: "draft" | "active" | "archived" | "failed" | "validated";
            testType: string;
            targetUrl: string;
            llmProvider: string;
            model: string;
            originalPrompt: any;
            generatedCode: any;
            mcpCommands: any;
            validationResult: any;
            executionHistory: any;
            metadata: {
                tokensUsed?: number;
                confidence?: number;
                estimatedDuration?: string;
                tags?: string[];
            };
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    updateTest(id: string, dto: UpdateTestDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            status: "draft" | "active" | "archived" | "failed" | "validated";
            updatedAt: Date;
        };
    }>;
    regenerateTest(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            originalId: string;
            newId: string;
            name: string;
            status: "draft" | "active" | "archived" | "failed" | "validated";
            validationResult: any;
            metadata: {
                tokensUsed?: number;
                confidence?: number;
                estimatedDuration?: string;
                tags?: string[];
            };
            createdAt: Date;
        };
    }>;
    deleteTest(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getMCPCommands(id: string, req: any): Promise<{
        success: boolean;
        data: {
            testId: string;
            testName: string;
            mcpCommands: any;
            commandCount: any;
        };
    }>;
    executeTest(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            executionId: string;
            testId: string;
            status: TestExecutionStatus;
            success: boolean;
            duration: number;
            totalSteps: number;
            completedSteps: number;
            failedSteps: number;
            startedAt: Date;
            completedAt: Date;
        };
    }>;
    getTestExecutions(id: string, req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            testId: string;
            status: TestExecutionStatus;
            success: boolean;
            duration: number;
            totalSteps: number;
            completedSteps: number;
            failedSteps: number;
            startedAt: Date;
            completedAt: Date;
        }[];
    }>;
    getExecutionDetails(executionId: string, req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            testId: string;
            status: TestExecutionStatus;
            success: boolean;
            duration: number;
            totalSteps: number;
            completedSteps: number;
            failedSteps: number;
            steps: import("../../entities/test-execution.entity").ExecutionStep[];
            error: string;
            startedAt: Date;
            completedAt: Date;
        };
    }>;
    stopExecution(executionId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
