import { TestFlowsService } from './test-flows.service';
import { CreateTestFlowDto } from './dto/create-test-flow.dto';
import { UpdateTestFlowDto } from './dto/update-test-flow.dto';
import { QueryTestFlowDto } from './dto/query-test-flow.dto';
export declare class TestFlowsController {
    private readonly testFlowsService;
    constructor(testFlowsService: TestFlowsService);
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
