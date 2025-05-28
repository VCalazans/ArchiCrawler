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
exports.PdfRequestDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const engine_types_enum_1 = require("../../core/constants/engine-types.enum");
class PdfRequestDto {
}
exports.PdfRequestDto = PdfRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL to generate PDF from',
        example: 'https://example.com'
    }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], PdfRequestDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: engine_types_enum_1.EngineType,
        description: 'Scraping engine to use',
        default: engine_types_enum_1.EngineType.PLAYWRIGHT
    }),
    (0, class_validator_1.IsEnum)(engine_types_enum_1.EngineType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PdfRequestDto.prototype, "engine", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'PDF options',
        example: {
            format: 'A4',
            printBackground: true,
            margin: {
                top: '1cm',
                right: '1cm',
                bottom: '1cm',
                left: '1cm'
            }
        }
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PdfRequestDto.prototype, "pdfOptions", void 0);
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
], PdfRequestDto.prototype, "options", void 0);
//# sourceMappingURL=pdf-request.dto.js.map