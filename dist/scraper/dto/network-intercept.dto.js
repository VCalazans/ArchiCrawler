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
exports.NetworkInterceptDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const engine_types_enum_1 = require("../../core/constants/engine-types.enum");
class NetworkInterceptDto {
}
exports.NetworkInterceptDto = NetworkInterceptDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL to monitor network requests for',
        example: 'https://example.com'
    }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], NetworkInterceptDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL patterns to intercept (wildcards supported)',
        example: ['**/api/**', '**/graphql']
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], NetworkInterceptDto.prototype, "interceptPatterns", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Resource types to block',
        example: ['image', 'stylesheet', 'font']
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], NetworkInterceptDto.prototype, "blockResources", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether to capture request/response data',
        example: true
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], NetworkInterceptDto.prototype, "captureData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum time to monitor in milliseconds',
        example: 30000
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], NetworkInterceptDto.prototype, "monitorDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Actions to perform on the page while monitoring',
        example: [
            { type: 'click', selector: '#load-more' },
            { type: 'wait', duration: 2000 }
        ]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], NetworkInterceptDto.prototype, "actions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: engine_types_enum_1.EngineType,
        description: 'Scraping engine to use',
        default: engine_types_enum_1.EngineType.PLAYWRIGHT
    }),
    (0, class_validator_1.IsEnum)(engine_types_enum_1.EngineType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], NetworkInterceptDto.prototype, "engine", void 0);
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
], NetworkInterceptDto.prototype, "options", void 0);
//# sourceMappingURL=network-intercept.dto.js.map