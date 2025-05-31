"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LLMTestExecutionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMTestExecutionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const generated_test_entity_1 = require("../entities/generated-test.entity");
const test_execution_entity_1 = require("../../entities/test-execution.entity");
const playwright_mcp_service_1 = require("../../mcp/services/playwright-mcp.service");
let LLMTestExecutionService = LLMTestExecutionService_1 = class LLMTestExecutionService {
    constructor(generatedTestRepository, executionRepository, playwrightMCPService) {
        this.generatedTestRepository = generatedTestRepository;
        this.executionRepository = executionRepository;
        this.playwrightMCPService = playwrightMCPService;
        this.logger = new common_1.Logger(LLMTestExecutionService_1.name);
    }
    async executeTest(testId, userId) {
        this.logger.log(`🚀 Iniciando execução do teste LLM ${testId} para usuário ${userId}`);
        const test = await this.generatedTestRepository.findOne({
            where: { id: testId },
        });
        if (!test) {
            throw new common_1.NotFoundException('Teste não encontrado');
        }
        await this.verifyMCPHealth();
        const mcpCommands = this.convertLLMTestToMCPCommands(test);
        this.logger.log(`📝 Convertido para ${mcpCommands.length} comandos MCP`);
        const execution = this.executionRepository.create({
            testFlowId: testId,
            userId,
            status: test_execution_entity_1.TestExecutionStatus.RUNNING,
            startTime: new Date(),
            totalSteps: mcpCommands.length,
            completedSteps: 0,
            failedSteps: 0,
            steps: [],
        });
        const savedExecution = await this.executionRepository.save(execution);
        try {
            const executionSteps = await this.executeMCPCommandsWithBestPractices(mcpCommands);
            await this.finalizeExecution(savedExecution, test, executionSteps);
            this.logger.log(`✅ Execução do teste LLM ${testId} finalizada: ${savedExecution.status}`);
            return savedExecution;
        }
        catch (error) {
            await this.handleExecutionError(savedExecution, error);
            throw error;
        }
    }
    async verifyMCPHealth() {
        try {
            this.logger.debug('🏥 Verificando saúde do serviço MCP...');
            const health = await this.playwrightMCPService.checkHealth();
            if (!health.healthy) {
                throw new Error(`MCP não está saudável: ${health.message}`);
            }
            this.logger.debug('✅ MCP está saudável e pronto');
        }
        catch (error) {
            this.logger.error('❌ Falha na verificação de saúde do MCP:', error.message);
            throw new Error(`Serviço MCP não disponível: ${error.message}`);
        }
    }
    async executeMCPCommandsWithBestPractices(mcpCommands) {
        const executionSteps = [];
        let hasErrors = false;
        this.logger.log(`🔄 Iniciando execução de ${mcpCommands.length} comandos MCP...`);
        for (let i = 0; i < mcpCommands.length; i++) {
            const command = mcpCommands[i];
            const stepId = `step-${i + 1}`;
            this.logger.debug(`🎯 Executando passo ${i + 1}/${mcpCommands.length}: ${command.action}`);
            const step = {
                stepId,
                status: test_execution_entity_1.TestExecutionStatus.RUNNING,
                startTime: new Date(),
            };
            try {
                const result = await this.executeMCPCommandWithRetry(command, 3);
                step.endTime = new Date();
                step.duration = step.endTime.getTime() - step.startTime.getTime();
                step.status = test_execution_entity_1.TestExecutionStatus.SUCCESS;
                step.result = {
                    action: command.action,
                    description: command.description,
                    data: result.data,
                    duration: result.duration
                };
                if (command.captureScreenshot) {
                    try {
                        const screenshot = await this.captureScreenshotSafely();
                        if (screenshot) {
                            step.screenshot = screenshot;
                        }
                    }
                    catch (screenshotError) {
                        this.logger.warn(`📷 Screenshot falhou: ${screenshotError.message}`);
                    }
                }
                this.logger.debug(`✅ Passo ${i + 1} concluído em ${step.duration}ms`);
            }
            catch (error) {
                hasErrors = true;
                step.endTime = new Date();
                step.duration = step.endTime.getTime() - step.startTime.getTime();
                step.status = test_execution_entity_1.TestExecutionStatus.FAILED;
                step.error = error.message;
                this.logger.error(`❌ Passo ${i + 1} falhou: ${error.message}`);
                try {
                    const errorScreenshot = await this.captureScreenshotSafely();
                    if (errorScreenshot) {
                        step.screenshot = errorScreenshot;
                    }
                }
                catch (screenshotError) {
                    this.logger.warn(`📷 Screenshot de erro falhou: ${screenshotError.message}`);
                }
                if (this.isCriticalError(error)) {
                    this.logger.error(`🛑 Erro crítico detectado, parando execução`);
                    break;
                }
            }
            executionSteps.push(step);
            if (i < mcpCommands.length - 1) {
                await this.wait(500);
            }
        }
        return executionSteps;
    }
    async executeMCPCommandWithRetry(command, maxRetries = 3) {
        let lastError = null;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.logger.debug(`🔄 Tentativa ${attempt}/${maxRetries} para comando ${command.action}`);
                return await this.executeMCPCommand(command);
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`⚠️ Tentativa ${attempt} falhou: ${error.message}`);
                if (attempt < maxRetries) {
                    const delay = 1000 * Math.pow(2, attempt - 1);
                    this.logger.debug(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
                    await this.wait(delay);
                }
            }
        }
        throw lastError || new Error(`Falha após ${maxRetries} tentativas`);
    }
    async executeMCPCommand(command) {
        const startTime = Date.now();
        let result;
        switch (command.action) {
            case 'navigate':
                this.logger.debug(`🌐 Navegando para: ${command.url}`);
                result = await this.playwrightMCPService.navigate(command.url);
                break;
            case 'click':
                this.logger.debug(`👆 Clicando em: ${command.selector}`);
                result = await this.playwrightMCPService.click(command.selector);
                break;
            case 'fill':
                this.logger.debug(`✏️ Preenchendo ${command.selector} com: ${command.value}`);
                result = await this.playwrightMCPService.fill(command.selector, command.value);
                break;
            case 'wait':
                this.logger.debug(`⏳ Aguardando ${command.value}ms`);
                result = await this.playwrightMCPService.wait(parseInt(command.value));
                break;
            case 'screenshot':
                this.logger.debug(`📷 Capturando screenshot`);
                result = await this.playwrightMCPService.screenshot();
                break;
            case 'hover':
                this.logger.debug(`🎯 Hover em: ${command.selector}`);
                result = await this.playwrightMCPService.hover(command.selector);
                break;
            case 'select':
                this.logger.debug(`🔽 Selecionando ${command.value} em: ${command.selector}`);
                result = await this.playwrightMCPService.select(command.selector, command.value);
                break;
            default:
                throw new Error(`Ação MCP não suportada: ${command.action}`);
        }
        const duration = Date.now() - startTime;
        return { duration, data: result };
    }
    async captureScreenshotSafely() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotName = `llm-test-${timestamp}`;
            const result = await this.playwrightMCPService.screenshot(screenshotName);
            return result?.path || screenshotName;
        }
        catch (error) {
            this.logger.warn(`📷 Screenshot falhou: ${error.message}`);
            return null;
        }
    }
    isCriticalError(error) {
        const criticalKeywords = [
            'MCP not available',
            'Server crashed',
            'Connection lost',
            'Browser crashed',
            'Critical timeout'
        ];
        return criticalKeywords.some(keyword => error.message.toLowerCase().includes(keyword.toLowerCase()));
    }
    async finalizeExecution(execution, test, steps) {
        const hasErrors = steps.some(step => step.status === test_execution_entity_1.TestExecutionStatus.FAILED);
        execution.endTime = new Date();
        execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
        execution.status = hasErrors ? test_execution_entity_1.TestExecutionStatus.FAILED : test_execution_entity_1.TestExecutionStatus.SUCCESS;
        execution.steps = steps;
        execution.completedSteps = steps.filter(s => s.status === test_execution_entity_1.TestExecutionStatus.SUCCESS).length;
        execution.failedSteps = steps.filter(s => s.status === test_execution_entity_1.TestExecutionStatus.FAILED).length;
        test.lastExecutionAt = new Date();
        test.executionCount = (test.executionCount || 0) + 1;
        if (!hasErrors) {
            test.lastSuccessfulExecutionAt = new Date();
        }
        await Promise.all([
            this.executionRepository.save(execution),
            this.generatedTestRepository.save(test),
        ]);
    }
    async handleExecutionError(execution, error) {
        execution.endTime = new Date();
        execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
        execution.status = test_execution_entity_1.TestExecutionStatus.FAILED;
        execution.error = `Erro geral na execução: ${error.message}`;
        await this.executionRepository.save(execution);
        this.logger.error(`💥 Erro na execução do teste LLM ${execution.testFlowId}: ${error.message}`);
    }
    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    convertLLMTestToMCPCommands(test) {
        try {
            if (test.generatedCode.trim().startsWith('{') || test.generatedCode.trim().startsWith('[')) {
                return this.parseJSONCommands(test);
            }
            else {
                return this.parseJavaScriptCommands(test);
            }
        }
        catch (error) {
            this.logger.error(`❌ Erro ao converter teste para comandos MCP: ${error.message}`);
            throw new Error(`Falha ao processar comandos do teste: ${error.message}`);
        }
    }
    parseJSONCommands(test) {
        const jsonCode = JSON.parse(test.generatedCode);
        const commands = [];
        if (jsonCode.steps) {
            jsonCode.steps.forEach((step, index) => {
                const command = {
                    action: step.action,
                    description: step.description || `Passo ${index + 1}`,
                    captureScreenshot: step.captureScreenshot || false
                };
                if (step.url)
                    command.url = step.url;
                if (step.selector)
                    command.selector = step.selector;
                if (step.value)
                    command.value = step.value;
                commands.push(command);
            });
        }
        return commands;
    }
    parseJavaScriptCommands(test) {
        const commands = [];
        const lines = test.generatedCode.split('\n');
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (trimmedLine.includes('navigate(')) {
                const urlMatch = trimmedLine.match(/navigate\(['"`]([^'"`]+)['"`]\)/);
                if (urlMatch) {
                    commands.push({
                        action: 'navigate',
                        url: urlMatch[1],
                        description: `Navegar para ${urlMatch[1]}`,
                        captureScreenshot: true
                    });
                }
            }
            else if (trimmedLine.includes('click(')) {
                const selectorMatch = trimmedLine.match(/click\(['"`]([^'"`]+)['"`]\)/);
                if (selectorMatch) {
                    commands.push({
                        action: 'click',
                        selector: selectorMatch[1],
                        description: `Clicar em ${selectorMatch[1]}`,
                        captureScreenshot: true
                    });
                }
            }
            else if (trimmedLine.includes('fill(')) {
                const fillMatch = trimmedLine.match(/fill\(['"`]([^'"`]+)['"`],\s*['"`]([^'"`]+)['"`]\)/);
                if (fillMatch) {
                    commands.push({
                        action: 'fill',
                        selector: fillMatch[1],
                        value: fillMatch[2],
                        description: `Preencher ${fillMatch[1]} com ${fillMatch[2]}`
                    });
                }
            }
            else if (trimmedLine.includes('wait(')) {
                const waitMatch = trimmedLine.match(/wait\((\d+)\)/);
                if (waitMatch) {
                    commands.push({
                        action: 'wait',
                        value: waitMatch[1],
                        description: `Aguardar ${waitMatch[1]}ms`
                    });
                }
            }
            else if (trimmedLine.includes('screenshot(')) {
                commands.push({
                    action: 'screenshot',
                    description: 'Capturar screenshot'
                });
            }
        });
        return commands;
    }
    async getTestExecutions(testId, userId) {
        return this.executionRepository.find({
            where: { testFlowId: testId },
            order: { startTime: 'DESC' },
            take: 10
        });
    }
    async getExecutionResult(executionId, userId) {
        const execution = await this.executionRepository.findOne({
            where: { id: executionId }
        });
        if (!execution) {
            throw new common_1.NotFoundException('Execução não encontrada');
        }
        return execution;
    }
    async stopExecution(executionId, userId) {
        const execution = await this.executionRepository.findOne({
            where: { id: executionId }
        });
        if (!execution) {
            throw new common_1.NotFoundException('Execução não encontrada');
        }
        if (execution.status === test_execution_entity_1.TestExecutionStatus.RUNNING) {
            execution.status = test_execution_entity_1.TestExecutionStatus.FAILED;
            execution.endTime = new Date();
            execution.error = 'Execução interrompida pelo usuário';
            await this.executionRepository.save(execution);
        }
    }
};
exports.LLMTestExecutionService = LLMTestExecutionService;
exports.LLMTestExecutionService = LLMTestExecutionService = LLMTestExecutionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(generated_test_entity_1.GeneratedTest)),
    __param(1, (0, typeorm_1.InjectRepository)(test_execution_entity_1.TestExecution)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        playwright_mcp_service_1.PlaywrightMCPService])
], LLMTestExecutionService);
//# sourceMappingURL=llm-test-execution.service.js.map