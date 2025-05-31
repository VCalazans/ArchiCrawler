import { 
  Controller, 
  Post, 
  Body, 
  Logger, 
  Get, 
  Param, 
  Delete,
  Sse,
  MessageEvent
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { DynamicTestAgentService, TestGoal, AgentStep } from '../services/dynamic-test-agent.service';

export interface ChatTestRequest {
  message: string;
  targetUrl: string;
  llmProvider: string;
  model?: string;
}

export interface ChatResponse {
  success: boolean;
  executionId?: string;
  message: string;
  data?: any;
}

@Controller('llm-tests/chat')
export class DynamicTestChatController {
  private readonly logger = new Logger(DynamicTestChatController.name);

  constructor(
    private readonly dynamicAgent: DynamicTestAgentService,
  ) {}

  /**
   * 💬 Inicia execução de teste via chat
   */
  @Post('execute')
  async startChatTest(@Body() request: ChatTestRequest): Promise<ChatResponse> {
    try {
      this.logger.log(`💬 Nova solicitação de teste via chat: ${request.message}`);

      const testGoal: TestGoal = {
        description: request.message,
        targetUrl: request.targetUrl,
        userId: 'demo-user', // TODO: Implementar autenticação
        llmProvider: request.llmProvider,
        model: request.model
      };

      // Iniciar execução dinâmica
      const executionStream = await this.dynamicAgent.executeTestGoal(testGoal);
      
      // Gerar ID único para esta execução
      const executionId = `chat-${Date.now()}`;

      return {
        success: true,
        executionId,
        message: `🚀 Iniciando teste: "${request.message}". Use o executionId para acompanhar o progresso via SSE.`,
        data: { streamEndpoint: `/llm-tests/chat/stream/${executionId}` }
      };

    } catch (error) {
      this.logger.error(`❌ Erro ao iniciar teste via chat: ${error.message}`);
      return {
        success: false,
        message: `Erro ao iniciar teste: ${error.message}`
      };
    }
  }

  /**
   * 📡 Stream de execução em tempo real via Server-Sent Events
   */
  @Sse('stream/:executionId')
  streamExecution(@Param('executionId') executionId: string): Observable<MessageEvent> {
    this.logger.log(`📡 Iniciando stream para execução: ${executionId}`);

    // TODO: Implementar mapeamento de executionId para Observable
    // Por enquanto, criar um stream mock para demonstração
    return this.createMockExecutionStream().pipe(
      map((step: AgentStep) => ({
        type: 'agent-step',
        data: {
          id: step.id,
          description: step.description,
          timestamp: step.timestamp,
          duration: step.duration,
          success: step.result.success,
          screenshot: step.result.screenshot,
          thoughts: step.context.llmThoughts,
          confidence: step.context.confidence
        }
      }))
    );
  }

  /**
   * 🛑 Para execução em andamento
   */
  @Delete('execution/:executionId')
  async stopExecution(@Param('executionId') executionId: string): Promise<ChatResponse> {
    try {
      await this.dynamicAgent.stopExecution(executionId);
      
      return {
        success: true,
        message: `Execução ${executionId} interrompida com sucesso`
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao interromper execução: ${error.message}`
      };
    }
  }

  /**
   * 📊 Obter status das execuções ativas
   */
  @Get('status')
  async getExecutionStatus(): Promise<ChatResponse> {
    return {
      success: true,
      message: 'Status das execuções',
      data: {
        activeExecutions: [], // TODO: Implementar tracking de execuções
        totalExecutions: 0
      }
    };
  }

  /**
   * 🎭 Stream mock para demonstração (remover quando implementação real estiver pronta)
   */
  private createMockExecutionStream(): Observable<AgentStep> {
    return new Observable(subscriber => {
      let stepCount = 0;
      const maxSteps = 5;

      const mockSteps = [
        '🌐 Navegando para o site...',
        '📱 Analisando página carregada...',
        '🔍 Procurando elementos de login...',
        '✏️ Preenchendo formulário...',
        '✅ Teste concluído com sucesso!'
      ];

      const interval = setInterval(() => {
        if (stepCount >= maxSteps) {
          subscriber.complete();
          clearInterval(interval);
          return;
        }

        const mockStep: AgentStep = {
          id: `mock-step-${stepCount + 1}`,
          action: {
            type: 'navigate',
            description: mockSteps[stepCount],
            reasoning: 'Demonstração do sistema dinâmico'
          },
          result: {
            success: true,
            duration: 1500 + Math.random() * 1000,
            pageContext: {
              url: 'https://example.com',
              title: 'Página de Teste',
              visibleText: 'Conteúdo da página...',
              forms: [],
              buttons: [],
              links: [],
              errors: [],
              loadingState: 'complete' as const,
              hasChanges: stepCount > 0
            },
            changes: [],
            screenshot: `data:image/png;base64,mock-screenshot-${stepCount}`
          },
          context: {
            goal: 'Teste de demonstração',
            targetUrl: 'https://example.com',
            currentUrl: 'https://example.com',
            currentStrategy: {
              approach: 'direct' as const,
              currentObjective: mockSteps[stepCount],
              expectedElements: [],
              fallbackPlan: []
            },
            pageState: {
              url: 'https://example.com',
              title: 'Página de Teste',
              visibleText: 'Conteúdo da página...',
              forms: [],
              buttons: [],
              links: [],
              errors: [],
              loadingState: 'complete' as const,
              hasChanges: false
            },
            executionHistory: [],
            isComplete: stepCount === maxSteps - 1,
            confidence: 85 + stepCount * 3,
            nextPossibleActions: [],
            llmThoughts: `Executando passo ${stepCount + 1}: ${mockSteps[stepCount]}`
          },
          timestamp: new Date(),
          duration: 1500 + Math.random() * 1000,
          description: mockSteps[stepCount]
        };

        subscriber.next(mockStep);
        stepCount++;
      }, 2000);

      // Cleanup
      return () => {
        clearInterval(interval);
      };
    });
  }
} 