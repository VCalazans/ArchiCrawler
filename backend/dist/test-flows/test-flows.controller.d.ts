import { TestFlowsService } from './test-flows.service';
import { CreateTestFlowDto } from './dto/create-test-flow.dto';
import { UpdateTestFlowDto } from './dto/update-test-flow.dto';
import { QueryTestFlowDto } from './dto/query-test-flow.dto';
import { PlaywrightExecutorService } from './playwright-executor.service';
export declare class TestFlowsController {
    private readonly testFlowsService;
    private readonly playwrightExecutor;
    constructor(testFlowsService: TestFlowsService, playwrightExecutor: PlaywrightExecutorService);
    create(createTestFlowDto: CreateTestFlowDto): Promise<{
        success: boolean;
        data: import("../entities/test-flow.entity").TestFlow;
        message: string;
    }>;
    findAll(query: QueryTestFlowDto): Promise<{
        success: boolean;
        data: import("../entities/test-flow.entity").TestFlow[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("../entities/test-flow.entity").TestFlow;
    }>;
    update(id: string, updateTestFlowDto: UpdateTestFlowDto): Promise<{
        success: boolean;
        data: import("../entities/test-flow.entity").TestFlow;
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    execute(id: string): Promise<{
        success: boolean;
        data: import("../entities/test-execution.entity").TestExecution;
        message: string;
    }>;
    getPlaywrightStatus(): Promise<{
        success: boolean;
        data: {
            playwrightAvailable: boolean;
            executionMode: string;
            message: string;
        };
    }>;
    getDebugData(): Promise<{
        success: boolean;
        data: {
            flows: {
                id: string;
                name: string;
                stepsCount: number;
                steps: import("../entities/test-flow.entity").TestStep[];
                status: import("../entities/test-flow.entity").TestFlowStatus;
                isActive: boolean;
            }[];
            executions: {
                id: string;
                testFlowId: string;
                status: import("../entities/test-execution.entity").TestExecutionStatus;
                totalSteps: number;
                completedSteps: number;
                failedSteps: number;
                stepsDetails: import("../entities/test-execution.entity").ExecutionStep[];
                duration: number;
            }[];
        };
        error?: undefined;
        stack?: undefined;
    } | {
        success: boolean;
        error: any;
        stack: any;
        data?: undefined;
    }>;
    testExecution(): Promise<{
        success: boolean;
        data: {
            timestamp: string;
            playwrightAvailable: boolean;
            executionMode: string;
            testFlow: {
                id: string;
                name: string;
                stepsConfigured: number;
            };
            execution: {
                id: string;
                status: import("../entities/test-execution.entity").TestExecutionStatus;
                totalSteps: number;
                completedSteps: number;
                failedSteps: number;
                duration: number;
                working: boolean;
            };
            steps: {
                stepId: string;
                status: import("../entities/test-execution.entity").TestExecutionStatus;
                duration: number;
                success: boolean;
                error: string;
            }[];
            summary: {
                totalSteps: number;
                successfulSteps: number;
                successRate: string;
                executionWorking: boolean;
                playwrightIntegration: string;
                overallStatus: string;
            };
        };
        message: string;
        error?: undefined;
        stack?: undefined;
    } | {
        success: boolean;
        error: any;
        stack: any;
        message: string;
        data?: undefined;
    }>;
}
export declare class TestExecutionsController {
    private readonly testFlowsService;
    constructor(testFlowsService: TestFlowsService);
    findAll(flowId?: string): Promise<{
        success: boolean;
        data: import("../entities/test-execution.entity").TestExecution[];
        meta: {
            total: number;
        };
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("../entities/test-execution.entity").TestExecution;
    }>;
}
