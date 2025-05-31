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
exports.FormInteractionDto = exports.FormFieldDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const engine_types_enum_1 = require("../../core/constants/engine-types.enum");
class FormFieldDto {
}
exports.FormFieldDto = FormFieldDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'CSS selector for the form field',
        example: '#email'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FormFieldDto.prototype, "selector", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Action to perform on the field',
        enum: ['fill', 'click', 'select', 'check', 'uncheck', 'upload'],
        example: 'fill'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FormFieldDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Value to use for the action',
        example: 'user@example.com'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], FormFieldDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Wait time after action in milliseconds',
        example: 1000
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FormFieldDto.prototype, "waitAfter", void 0);
class FormInteractionDto {
}
exports.FormInteractionDto = FormInteractionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL of the page with the form',
        example: 'https://example.com/contact'
    }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], FormInteractionDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Form fields to interact with',
        type: [FormFieldDto]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FormFieldDto),
    __metadata("design:type", Array)
], FormInteractionDto.prototype, "fields", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'CSS selector for form submission button',
        example: 'button[type="submit"]'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FormInteractionDto.prototype, "submitSelector", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether to wait for navigation after form submission',
        example: true
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], FormInteractionDto.prototype, "waitForNavigation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: engine_types_enum_1.EngineType,
        description: 'Scraping engine to use',
        default: engine_types_enum_1.EngineType.PLAYWRIGHT
    }),
    (0, class_validator_1.IsEnum)(engine_types_enum_1.EngineType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FormInteractionDto.prototype, "engine", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Engine options',
        example: {
            headless: true,
            timeout: 30000
        }
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], FormInteractionDto.prototype, "options", void 0);
//# sourceMappingURL=form-interaction.dto.js.map