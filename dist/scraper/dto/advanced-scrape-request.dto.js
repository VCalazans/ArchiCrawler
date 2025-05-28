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
exports.AdvancedScrapeRequestDto = exports.DataExtractionRule = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const engine_types_enum_1 = require("../../core/constants/engine-types.enum");
class DataExtractionRule {
}
exports.DataExtractionRule = DataExtractionRule;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name/key for the extracted data',
        example: 'title'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DataExtractionRule.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'CSS selector for data extraction',
        example: 'h1'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DataExtractionRule.prototype, "selector", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Type of data to extract',
        enum: ['text', 'html', 'attribute', 'property', 'count'],
        example: 'text'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DataExtractionRule.prototype, "extractType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Attribute name (when extractType is "attribute")',
        example: 'href'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DataExtractionRule.prototype, "attributeName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Property name (when extractType is "property")',
        example: 'value'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DataExtractionRule.prototype, "propertyName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether to extract from all matching elements or just the first',
        example: false
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], DataExtractionRule.prototype, "multiple", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Transform function to apply to extracted data',
        example: 'trim'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DataExtractionRule.prototype, "transform", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Default value if extraction fails',
        example: ''
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], DataExtractionRule.prototype, "defaultValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Regular expression to apply to extracted text',
        example: '\\d+'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DataExtractionRule.prototype, "regex", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Regex flags',
        example: 'gi'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DataExtractionRule.prototype, "regexFlags", void 0);
class AdvancedScrapeRequestDto {
}
exports.AdvancedScrapeRequestDto = AdvancedScrapeRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL to scrape',
        example: 'https://example.com'
    }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], AdvancedScrapeRequestDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data extraction rules',
        type: [DataExtractionRule]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DataExtractionRule),
    __metadata("design:type", Array)
], AdvancedScrapeRequestDto.prototype, "extractionRules", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Wait conditions before extraction',
        example: {
            selector: '.content-loaded',
            timeout: 10000,
            waitFor: 'visible'
        }
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], AdvancedScrapeRequestDto.prototype, "waitConditions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Actions to perform before extraction',
        example: [
            { type: 'click', selector: '#load-more' },
            { type: 'scroll', selector: '.infinite-scroll' },
            { type: 'wait', duration: 2000 }
        ]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], AdvancedScrapeRequestDto.prototype, "preActions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Pagination settings for multi-page scraping',
        example: {
            nextButtonSelector: '.next-page',
            maxPages: 10,
            waitBetweenPages: 2000
        }
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], AdvancedScrapeRequestDto.prototype, "pagination", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Screenshot options',
        example: {
            enabled: true,
            fullPage: true,
            quality: 80
        }
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], AdvancedScrapeRequestDto.prototype, "screenshot", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: engine_types_enum_1.EngineType,
        description: 'Scraping engine to use',
        default: engine_types_enum_1.EngineType.PLAYWRIGHT
    }),
    (0, class_validator_1.IsEnum)(engine_types_enum_1.EngineType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdvancedScrapeRequestDto.prototype, "engine", void 0);
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
], AdvancedScrapeRequestDto.prototype, "options", void 0);
//# sourceMappingURL=advanced-scrape-request.dto.js.map