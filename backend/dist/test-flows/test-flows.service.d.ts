import { Repository } from 'typeorm';
import { TestFlow } from '../entities/test-flow.entity';
import { TestExecution } from '../entities/test-execution.entity';
import { CreateTestFlowDto } from './dto/create-test-flow.dto';
import { UpdateTestFlowDto } from './dto/update-test-flow.dto';
import { QueryTestFlowDto } from './dto/query-test-flow.dto';
export declare class TestFlowsService {
    private testFlowRepository;
    private testExecutionRepository;
    private readonly logger;
    constructor(testFlowRepository: Repository<TestFlow>, testExecutionRepository: Repository<TestExecution>);
    create(createTestFlowDto: CreateTestFlowDto): Promise<TestFlow>;
    findAll(query: QueryTestFlowDto): Promise<{
        data: TestFlow[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<TestFlow>;
    update(id: string, updateTestFlowDto: UpdateTestFlowDto): Promise<TestFlow>;
    remove(id: string): Promise<void>;
    execute(id: string, userId: string): Promise<TestExecution>;
    private executeSteps;
    private executeStep;
    getExecutions(flowId?: string): Promise<{
        data: TestExecution[];
        total: number;
    }>;
    getExecution(id: string): Promise<TestExecution>;
}
