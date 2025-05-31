"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TestValidatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestValidatorService = void 0;
const common_1 = require("@nestjs/common");
let TestValidatorService = TestValidatorService_1 = class TestValidatorService {
    constructor() {
        this.logger = new common_1.Logger(TestValidatorService_1.name);
    }
    async validateGeneratedTest(generatedTest) {
        const errors = [];
        const warnings = [];
        let score = 100;
        try {
            this.validateBasicStructure(generatedTest, errors);
            this.validateMCPCommands(generatedTest.mcpCommands, errors, warnings);
            this.validateTestCode(generatedTest.testCode, errors, warnings);
            this.validateMetadata(generatedTest.metadata, warnings);
            score = this.calculateScore(errors, warnings);
            this.logger.debug(`Validação concluída - Score: ${score}, Erros: ${errors.length}, Warnings: ${warnings.length}`);
            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                score
            };
        }
        catch (error) {
            this.logger.error(`Erro durante validação: ${error.message}`);
            return {
                isValid: false,
                errors: [`Erro interno de validação: ${error.message}`],
                warnings,
                score: 0
            };
        }
    }
    validateBasicStructure(generatedTest, errors) {
        if (!generatedTest.testCode || typeof generatedTest.testCode !== 'string') {
            errors.push('Código do teste é obrigatório e deve ser uma string');
        }
        if (!generatedTest.mcpCommands || !Array.isArray(generatedTest.mcpCommands)) {
            errors.push('Comandos MCP são obrigatórios e devem ser um array');
        }
        if (!generatedTest.metadata || typeof generatedTest.metadata !== 'object') {
            errors.push('Metadados são obrigatórios e devem ser um objeto');
        }
    }
    validateMCPCommands(commands, errors, warnings) {
        if (!commands || commands.length === 0) {
            errors.push('Pelo menos um comando MCP é obrigatório');
            return;
        }
        const validActions = ['navigate', 'click', 'fill', 'screenshot', 'wait', 'assert', 'hover', 'select'];
        let hasNavigate = false;
        let hasScreenshot = false;
        commands.forEach((command, index) => {
            if (!command.action || !validActions.includes(command.action)) {
                errors.push(`Comando ${index + 1}: Ação inválida '${command.action}'. Ações válidas: ${validActions.join(', ')}`);
            }
            if (command.action === 'navigate') {
                hasNavigate = true;
                if (!command.url) {
                    errors.push(`Comando ${index + 1}: Comando 'navigate' requer URL`);
                }
                else if (!this.isValidUrl(command.url)) {
                    warnings.push(`Comando ${index + 1}: URL pode não ser válida: ${command.url}`);
                }
            }
            if (command.action === 'screenshot') {
                hasScreenshot = true;
                if (!command.name) {
                    warnings.push(`Comando ${index + 1}: Screenshot sem nome definido`);
                }
            }
            if (['click', 'fill', 'hover', 'select', 'wait'].includes(command.action)) {
                if (!command.selector) {
                    errors.push(`Comando ${index + 1}: Comando '${command.action}' requer seletor`);
                }
                else if (!this.isValidSelector(command.selector)) {
                    warnings.push(`Comando ${index + 1}: Seletor pode não ser robusto: ${command.selector}`);
                }
            }
            if (command.timeout && (command.timeout < 1000 || command.timeout > 60000)) {
                warnings.push(`Comando ${index + 1}: Timeout fora do range recomendado (1s-60s): ${command.timeout}ms`);
            }
        });
        if (!hasNavigate) {
            warnings.push('Teste não possui comando de navegação');
        }
        if (!hasScreenshot) {
            warnings.push('Teste não possui capturas de tela para evidência');
        }
    }
    validateTestCode(testCode, errors, warnings) {
        if (!testCode || testCode.trim().length === 0) {
            errors.push('Código do teste não pode estar vazio');
            return;
        }
        if (!testCode.includes('//') && !testCode.includes('/*')) {
            warnings.push('Código do teste não possui comentários explicativos');
        }
        if (testCode.length < 50) {
            warnings.push('Código do teste muito curto, pode estar incompleto');
        }
        if (!testCode.toLowerCase().includes('mcp')) {
            warnings.push('Código do teste não menciona MCP');
        }
    }
    validateMetadata(metadata, warnings) {
        if (!metadata.confidence || metadata.confidence < 0 || metadata.confidence > 100) {
            warnings.push('Nível de confiança inválido ou ausente');
        }
        if (metadata.confidence && metadata.confidence < 70) {
            warnings.push(`Nível de confiança baixo: ${metadata.confidence}%`);
        }
        if (!metadata.description || metadata.description.length < 10) {
            warnings.push('Descrição do teste muito curta ou ausente');
        }
    }
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    isValidSelector(selector) {
        if (selector.includes('[data-testid=') || selector.includes('[data-test=')) {
            return true;
        }
        const genericSelectors = ['div', 'span', 'p', 'a', 'button'];
        const isGeneric = genericSelectors.some(tag => selector === tag);
        return !isGeneric;
    }
    calculateScore(errors, warnings) {
        let score = 100;
        score -= errors.length * 20;
        score -= warnings.length * 5;
        return Math.max(0, score);
    }
    validateMCPCommandStructure(command) {
        const errors = [];
        const validActions = ['navigate', 'click', 'fill', 'screenshot', 'wait', 'assert', 'hover', 'select'];
        if (!command.action || !validActions.includes(command.action)) {
            errors.push(`Ação inválida: ${command.action}`);
        }
        switch (command.action) {
            case 'navigate':
                if (!command.url) {
                    errors.push('Comando navigate requer URL');
                }
                break;
            case 'click':
            case 'fill':
            case 'hover':
            case 'select':
                if (!command.selector) {
                    errors.push(`Comando ${command.action} requer seletor`);
                }
                break;
            case 'screenshot':
                if (!command.name) {
                    errors.push('Comando screenshot requer nome');
                }
                break;
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
};
exports.TestValidatorService = TestValidatorService;
exports.TestValidatorService = TestValidatorService = TestValidatorService_1 = __decorate([
    (0, common_1.Injectable)()
], TestValidatorService);
//# sourceMappingURL=test-validator.service.js.map