import { TestFlowStatus, TestStep } from '../../entities/test-flow.entity';
export declare class CreateTestStepDto {
    id: string;
    type: 'navigate' | 'click' | 'fill' | 'screenshot' | 'assert' | 'extract' | 'wait';
    name: string;
    description?: string;
    config?: Record<string, any>;
    timeout?: number;
    retries?: number;
    continueOnError?: boolean;
}
export declare class CreateTestFlowDto {
    name: string;
    description?: string;
    steps: TestStep[];
    userId: string;
    isActive?: boolean;
    status?: TestFlowStatus;
}
