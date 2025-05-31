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
exports.UpdateTestDto = exports.GenerateTestDto = void 0;
const class_validator_1 = require("class-validator");
class GenerateTestDto {
}
exports.GenerateTestDto = GenerateTestDto;
__decorate([
    (0, class_validator_1.IsUrl)({}, { message: 'URL de destino deve ser válida' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'URL de destino é obrigatória' }),
    __metadata("design:type", String)
], GenerateTestDto.prototype, "targetUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Descrição deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Descrição do teste é obrigatória' }),
    __metadata("design:type", String)
], GenerateTestDto.prototype, "testDescription", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['e2e', 'visual', 'performance', 'accessibility'], {
        message: 'Tipo de teste deve ser: e2e, visual, performance ou accessibility'
    }),
    __metadata("design:type", String)
], GenerateTestDto.prototype, "testType", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Provedor LLM deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Provedor LLM é obrigatório' }),
    __metadata("design:type", String)
], GenerateTestDto.prototype, "llmProvider", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Modelo deve ser uma string' }),
    __metadata("design:type", String)
], GenerateTestDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Contexto adicional deve ser uma string' }),
    __metadata("design:type", String)
], GenerateTestDto.prototype, "additionalContext", void 0);
class UpdateTestDto {
}
exports.UpdateTestDto = UpdateTestDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTestDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTestDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['draft', 'validated', 'active', 'failed', 'archived']),
    __metadata("design:type", String)
], UpdateTestDto.prototype, "status", void 0);
//# sourceMappingURL=generate-test.dto.js.map