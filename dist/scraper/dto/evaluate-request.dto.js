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
exports.EvaluateRequestDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const engine_types_enum_1 = require("../../core/constants/engine-types.enum");
class EvaluateRequestDto {
}
exports.EvaluateRequestDto = EvaluateRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL to evaluate script on',
        example: 'https://example.com'
    }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], EvaluateRequestDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'JavaScript to evaluate in the page context',
        example: 'return Array.from(document.querySelectorAll("h1")).map(el => el.textContent)'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EvaluateRequestDto.prototype, "script", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: engine_types_enum_1.EngineType,
        description: 'Scraping engine to use',
        default: engine_types_enum_1.EngineType.PLAYWRIGHT
    }),
    (0, class_validator_1.IsEnum)(engine_types_enum_1.EngineType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EvaluateRequestDto.prototype, "engine", void 0);
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
], EvaluateRequestDto.prototype, "options", void 0);
//# sourceMappingURL=evaluate-request.dto.js.map