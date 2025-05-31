import { TestFlowStatus } from '../../entities/test-flow.entity';
export declare class QueryTestFlowDto {
    page?: number;
    limit?: number;
    status?: TestFlowStatus;
    search?: string;
    userId?: string;
}
