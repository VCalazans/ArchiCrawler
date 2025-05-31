import { TestFlow } from './test-flow.entity';
import { User } from '../auth/entities/user.entity';
export declare enum TestExecutionStatus {
    PENDING = "pending",
    RUNNING = "running",
    SUCCESS = "success",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export interface ExecutionStep {
    stepId: string;
    status: TestExecutionStatus;
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    error?: string;
    result?: any;
    screenshot?: string;
}
export declare class TestExecution {
    id: string;
    testFlowId: string;
    testFlow: TestFlow;
    userId: string;
    user: User;
    status: TestExecutionStatus;
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    error?: string;
    result?: any;
    steps?: ExecutionStep[];
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    createdAt: Date;
    updatedAt: Date;
}
