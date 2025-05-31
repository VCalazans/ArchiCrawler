import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestFlowsService } from './test-flows.service';
import { TestFlowsController, TestExecutionsController } from './test-flows.controller';
import { TestFlow } from '../entities/test-flow.entity';
import { TestExecution } from '../entities/test-execution.entity';
import { PlaywrightExecutorService } from './playwright-executor.service';
import { MCPModule } from '../mcp/mcp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestFlow, TestExecution]),
    MCPModule,
  ],
  controllers: [TestFlowsController, TestExecutionsController],
  providers: [
    TestFlowsService,
    PlaywrightExecutorService,
  ],
  exports: [TestFlowsService, PlaywrightExecutorService],
})
export class TestFlowsModule {} 