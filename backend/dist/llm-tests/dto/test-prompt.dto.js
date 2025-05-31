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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptTemplateDto = exports.TestPromptDto = void 0;
const class_validator_1 = require("class-validator");
class TestPromptDto {
}
exports.TestPromptDto = TestPromptDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Prompt do sistema deve ser uma string' }),
    __metadata("design:type", String)
], TestPromptDto.prototype, "system", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Prompt do usuário deve ser uma string' }),
    __metadata("design:type", String)
], TestPromptDto.prototype, "user", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Exemplos devem ser um array' }),
    __metadata("design:type", Array)
], TestPromptDto.prototype, "examples", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Contexto deve ser uma string' }),
    __metadata("design:type", String)
], TestPromptDto.prototype, "context", void 0);
class PromptTemplateDto {
}
exports.PromptTemplateDto = PromptTemplateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptTemplateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptTemplateDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptTemplateDto.prototype, "testType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptTemplateDto.prototype, "systemPrompt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptTemplateDto.prototype, "userPromptTemplate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], PromptTemplateDto.prototype, "examples", void 0);
//# sourceMappingURL=test-prompt.dto.js.map