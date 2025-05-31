import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TestFlowsService } from './test-flows.service';
import { CreateTestFlowDto } from './dto/create-test-flow.dto';
import { UpdateTestFlowDto } from './dto/update-test-flow.dto';
import { QueryTestFlowDto } from './dto/query-test-flow.dto';

@Controller('test-flows')
export class TestFlowsController {
  constructor(private readonly testFlowsService: TestFlowsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTestFlowDto: CreateTestFlowDto) {
    // TODO: Usar userId do usuário autenticado quando autenticação estiver implementada
    if (!createTestFlowDto.userId) {
      createTestFlowDto.userId = 'default-user';
    }
    
    const testFlow = await this.testFlowsService.create(createTestFlowDto);
    
    return {
      success: true,
      data: testFlow,
      message: 'TestFlow criado com sucesso',
    };
  }

  @Get()
  async findAll(@Query() query: QueryTestFlowDto) {
    const result = await this.testFlowsService.findAll(query);
    
    return {
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const testFlow = await this.testFlowsService.findOne(id);
    
    return {
      success: true,
      data: testFlow,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTestFlowDto: UpdateTestFlowDto,
  ) {
    const updatedFlow = await this.testFlowsService.update(id, updateTestFlowDto);
    
    return {
      success: true,
      data: updatedFlow,
      message: 'TestFlow atualizado com sucesso',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.testFlowsService.remove(id);
    
    return {
      success: true,
      message: 'TestFlow removido com sucesso',
    };
  }

  @Post(':id/execute')
  @HttpCode(HttpStatus.ACCEPTED)
  async execute(@Param('id') id: string) {
    const execution = await this.testFlowsService.execute(id, 'default-user');
    
    return {
      success: true,
      data: execution,
      message: 'Execução iniciada com sucesso',
    };
  }
}

@Controller('test-executions')
export class TestExecutionsController {
  constructor(private readonly testFlowsService: TestFlowsService) {}

  @Get()
  async findAll(@Query('flowId') flowId?: string) {
    const result = await this.testFlowsService.getExecutions(flowId);
    
    return {
      success: true,
      data: result.data,
      meta: {
        total: result.total,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const execution = await this.testFlowsService.getExecution(id);
    
    return {
      success: true,
      data: execution,
    };
  }
} 