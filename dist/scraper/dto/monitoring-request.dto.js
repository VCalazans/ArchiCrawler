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
exports.MonitoringRequestDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const engine_types_enum_1 = require("../../core/constants/engine-types.enum");
class MonitoringRequestDto {
}
exports.MonitoringRequestDto = MonitoringRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL to monitor for changes',
        example: 'https://example.com/live-feed'
    }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], MonitoringRequestDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'CSS selectors to monitor for changes',
        example: ['.live-data', '#counter', '.status']
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], MonitoringRequestDto.prototype, "selectors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Monitoring duration in milliseconds',
        example: 60000
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MonitoringRequestDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Interval between checks in milliseconds',
        example: 5000
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MonitoringRequestDto.prototype, "interval", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Types of changes to detect',
        example: ['text', 'attribute', 'visibility']
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], MonitoringRequestDto.prototype, "changeTypes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Specific attributes to monitor',
        example: ['class', 'data-value', 'src']
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], MonitoringRequestDto.prototype, "monitorAttributes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Actions to perform when changes are detected',
        example: [
            { type: 'screenshot', path: './change-detected.png' },
            { type: 'extract', selector: '.new-data' }
        ]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], MonitoringRequestDto.prototype, "onChangeActions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether to capture screenshots of changes',
        example: true
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], MonitoringRequestDto.prototype, "captureScreenshots", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum number of changes to capture',
        example: 50
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MonitoringRequestDto.prototype, "maxChanges", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: engine_types_enum_1.EngineType,
        description: 'Scraping engine to use',
        default: engine_types_enum_1.EngineType.PLAYWRIGHT
    }),
    (0, class_validator_1.IsEnum)(engine_types_enum_1.EngineType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MonitoringRequestDto.prototype, "engine", void 0);
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
], MonitoringRequestDto.prototype, "options", void 0);
//# sourceMappingURL=monitoring-request.dto.js.map