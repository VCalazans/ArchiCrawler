import { 
  Controller, 
  Post, 
  Get, 
  Put,
  Delete,
  Body, 
  Param, 
  Query,
  Request,
  HttpStatus,
  HttpCode,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { LLMTestGeneratorService } from '../services/llm-test-generator.service';
import { GenerateTestDto, UpdateTestDto } from '../dto/generate-test.dto';
import { TestGenerationRequest } from '../interfaces/test-generation.interface';

@Controller('llm-tests/generate')
export class TestGenerationController {
  constructor(
    private readonly testGenerator: LLMTestGeneratorService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async generateTest(@Body() dto: GenerateTestDto, @Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    
    try {
      const request: TestGenerationRequest = {
        ...dto,
        userId
      };

      const generatedTest = await this.testGenerator.generateTest(request);

      return {
        success: true,
        message: 'Teste gerado com sucesso',
        data: {
          id: generatedTest.id,
          name: generatedTest.name,
          status: generatedTest.status,
          testType: generatedTest.testType,
          targetUrl: generatedTest.targetUrl,
          llmProvider: generatedTest.llmProvider,
          model: generatedTest.model,
          validationResult: generatedTest.validationResult,
          metadata: generatedTest.metadata,
          createdAt: generatedTest.createdAt
        }
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message
      });
    }
  }

  @Get()
  async getTests(
    @Request() req: any,
    @Query('testType') testType?: string,
    @Query('status') status?: string,
    @Query('llmProvider') llmProvider?: string,
    @Query('limit') limit?: string
  ) {
    const userId = req.user?.id || 'demo-user';
    
    try {
      const filters = {
        testType,
        status,
        llmProvider,
        limit: limit ? parseInt(limit) : undefined
      };

      const tests = await this.testGenerator.getGeneratedTests(userId, filters);

      return {
        success: true,
        data: tests.map(test => ({
          id: test.id,
          name: test.name,
          description: test.description,
          status: test.status,
          testType: test.testType,
          targetUrl: test.targetUrl,
          llmProvider: test.llmProvider,
          model: test.model,
          validationResult: test.validationResult,
          metadata: test.metadata,
          createdAt: test.createdAt,
          updatedAt: test.updatedAt
        }))
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message
      });
    }
  }

  @Get('statistics')
  async getStatistics(@Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    
    try {
      const stats = await this.testGenerator.getTestStatistics(userId);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message
      });
    }
  }

  @Get(':id')
  async getTestById(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    
    try {
      const test = await this.testGenerator.getTestById(id, userId);

      return {
        success: true,
        data: {
          id: test.id,
          name: test.name,
          description: test.description,
          status: test.status,
          testType: test.testType,
          targetUrl: test.targetUrl,
          llmProvider: test.llmProvider,
          model: test.model,
          originalPrompt: test.originalPrompt,
          generatedCode: test.generatedCode,
          mcpCommands: test.mcpCommands,
          validationResult: test.validationResult,
          executionHistory: test.executionHistory,
          metadata: test.metadata,
          createdAt: test.createdAt,
          updatedAt: test.updatedAt
        }
      };
    } catch (error) {
      throw new NotFoundException({
        success: false,
        message: error.message
      });
    }
  }

  @Put(':id')
  async updateTest(
    @Param('id') id: string, 
    @Body() dto: UpdateTestDto, 
    @Request() req: any
  ) {
    const userId = req.user?.id || 'demo-user';
    
    try {
      if (dto.status) {
        const updatedTest = await this.testGenerator.updateTestStatus(id, userId, dto.status);
        
        return {
          success: true,
          message: 'Status do teste atualizado',
          data: {
            id: updatedTest.id,
            status: updatedTest.status,
            updatedAt: updatedTest.updatedAt
          }
        };
      }

      throw new BadRequestException('Nenhuma atualização válida fornecida');
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message
      });
    }
  }

  @Post(':id/regenerate')
  async regenerateTest(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    
    try {
      const newTest = await this.testGenerator.regenerateTest(id, userId);

      return {
        success: true,
        message: 'Teste regenerado com sucesso',
        data: {
          originalId: id,
          newId: newTest.id,
          name: newTest.name,
          status: newTest.status,
          validationResult: newTest.validationResult,
          metadata: newTest.metadata,
          createdAt: newTest.createdAt
        }
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message
      });
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTest(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    
    try {
      await this.testGenerator.deleteTest(id, userId);
      
      return {
        success: true,
        message: 'Teste removido com sucesso'
      };
    } catch (error) {
      throw new NotFoundException({
        success: false,
        message: error.message
      });
    }
  }

  @Get(':id/mcp-commands')
  async getMCPCommands(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    
    try {
      const test = await this.testGenerator.getTestById(id, userId);

      return {
        success: true,
        data: {
          testId: test.id,
          testName: test.name,
          mcpCommands: test.mcpCommands,
          commandCount: test.mcpCommands?.length || 0
        }
      };
    } catch (error) {
      throw new NotFoundException({
        success: false,
        message: error.message
      });
    }
  }
} 