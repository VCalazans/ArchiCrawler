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
import { PlaywrightExecutorService } from './playwright-executor.service';

@Controller('test-flows')
export class TestFlowsController {
  constructor(
    private readonly testFlowsService: TestFlowsService,
    private readonly playwrightExecutor: PlaywrightExecutorService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTestFlowDto: CreateTestFlowDto) {
    // Se userId não for fornecido ou for vazio, usar o admin padrão
    if (!createTestFlowDto.userId || createTestFlowDto.userId.trim() === '') {
      createTestFlowDto.userId = '00000000-0000-0000-0000-000000000001'; // UUID do admin
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
    const execution = await this.testFlowsService.execute(id, '00000000-0000-0000-0000-000000000001'); // UUID do admin
    
    return {
      success: true,
      data: execution,
      message: 'Execução iniciada com sucesso',
    };
  }

  @Get('playwright/status')
  async getPlaywrightStatus() {
    const isAvailable = await this.playwrightExecutor.isPlaywrightAvailable();
    
    return {
      success: true,
      data: {
        playwrightAvailable: isAvailable,
        executionMode: isAvailable ? 'real' : 'simulation',
        message: isAvailable 
          ? 'Playwright MCP está ativo - execuções reais disponíveis' 
          : 'Playwright MCP não está ativo - execuções em modo simulação'
      }
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