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
exports.DeleteApiKeyDto = exports.ValidateApiKeyDto = exports.StoreApiKeyDto = void 0;
const class_validator_1 = require("class-validator");
class StoreApiKeyDto {
}
exports.StoreApiKeyDto = StoreApiKeyDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Provedor deve ser uma string' }),
    (0, class_validator_1.IsEnum)(['openai', 'anthropic', 'gemini'], {
        message: 'Provedor deve ser: openai, anthropic ou gemini'
    }),
    __metadata("design:type", String)
], StoreApiKeyDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Chave API deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Chave API é obrigatória' }),
    __metadata("design:type", String)
], StoreApiKeyDto.prototype, "apiKey", void 0);
class ValidateApiKeyDto {
}
exports.ValidateApiKeyDto = ValidateApiKeyDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Provedor deve ser uma string' }),
    (0, class_validator_1.IsEnum)(['openai', 'anthropic', 'gemini'], {
        message: 'Provedor deve ser: openai, anthropic ou gemini'
    }),
    __metadata("design:type", String)
], ValidateApiKeyDto.prototype, "provider", void 0);
class DeleteApiKeyDto {
}
exports.DeleteApiKeyDto = DeleteApiKeyDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Provedor deve ser uma string' }),
    (0, class_validator_1.IsEnum)(['openai', 'anthropic', 'gemini'], {
        message: 'Provedor deve ser: openai, anthropic ou gemini'
    }),
    __metadata("design:type", String)
], DeleteApiKeyDto.prototype, "provider", void 0);
//# sourceMappingURL=api-key.dto.js.map