import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestFlowsService } from './test-flows.service';
import { TestFlowsController, TestExecutionsController } from './test-flows.controller';
import { TestFlow } from '../entities/test-flow.entity';
import { TestExecution } from '../entities/test-execution.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestFlow, TestExecution]),
  ],
  controllers: [TestFlowsController, TestExecutionsController],
  providers: [TestFlowsService],
  exports: [TestFlowsService],
})
export class TestFlowsModule {} 