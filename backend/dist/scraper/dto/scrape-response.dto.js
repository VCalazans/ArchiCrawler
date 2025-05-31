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
exports.ScrapeResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ScrapeResponseDto {
}
exports.ScrapeResponseDto = ScrapeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status of the scrape operation',
        example: 'success'
    }),
    __metadata("design:type", String)
], ScrapeResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data extracted from the page',
        example: ['Title 1', 'Title 2']
    }),
    __metadata("design:type", Object)
], ScrapeResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL that was scraped',
        example: 'https://example.com'
    }),
    __metadata("design:type", String)
], ScrapeResponseDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Time taken to complete the scrape (ms)',
        example: 1234
    }),
    __metadata("design:type", Number)
], ScrapeResponseDto.prototype, "timeTaken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Engine used for scraping',
        example: 'playwright'
    }),
    __metadata("design:type", String)
], ScrapeResponseDto.prototype, "engine", void 0);
//# sourceMappingURL=scrape-response.dto.js.map