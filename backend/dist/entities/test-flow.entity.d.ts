import { User } from '../auth/entities/user.entity';
export declare enum TestFlowStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    PAUSED = "paused",
    ARCHIVED = "archived"
}
export interface TestStep {
    id: string;
    type: 'navigate' | 'click' | 'fill' | 'screenshot' | 'assert' | 'extract' | 'wait';
    name: string;
    description?: string;
    config: Record<string, any>;
    timeout?: number;
    retries?: number;
    continueOnError?: boolean;
}
export declare class TestFlow {
    id: string;
    name: string;
    description?: string;
    steps: TestStep[];
    userId: string;
    user: User;
    isActive: boolean;
    status: TestFlowStatus;
    lastRun?: Date;
    createdAt: Date;
    updatedAt: Date;
}
