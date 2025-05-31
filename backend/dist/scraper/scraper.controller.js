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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const scraper_service_1 = require("./scraper.service");
const scrape_request_dto_1 = require("./dto/scrape-request.dto");
const scrape_response_dto_1 = require("./dto/scrape-response.dto");
const screenshot_request_dto_1 = require("./dto/screenshot-request.dto");
const pdf_request_dto_1 = require("./dto/pdf-request.dto");
const evaluate_request_dto_1 = require("./dto/evaluate-request.dto");
const form_interaction_dto_1 = require("./dto/form-interaction.dto");
const network_intercept_dto_1 = require("./dto/network-intercept.dto");
const advanced_scrape_request_dto_1 = require("./dto/advanced-scrape-request.dto");
const monitoring_request_dto_1 = require("./dto/monitoring-request.dto");
let ScraperController = class ScraperController {
    constructor(scraperService) {
        this.scraperService = scraperService;
    }
    async getEngines() {
        return this.scraperService.getAvailableEngines();
    }
    async extract(scrapeRequest) {
        try {
            return await this.scraperService.extract(scrapeRequest);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async screenshot(request, res) {
        try {
            const { buffer, contentType } = await this.scraperService.screenshot(request);
            res.set({
                'Content-Type': contentType,
                'Content-Length': buffer.length,
                'Content-Disposition': `inline; filename="screenshot.${contentType === 'image/jpeg' ? 'jpg' : 'png'}"`,
            });
            res.send(buffer);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async pdf(request, res) {
        try {
            const result = await this.scraperService.pdf(request);
            res.set({
                'Content-Type': result.contentType,
                'Content-Length': result.buffer.length,
                'Content-Disposition': 'inline; filename="webpage.pdf"',
            });
            res.send(result.buffer);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async evaluate(request) {
        try {
            return await this.scraperService.evaluate(request);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async advancedExtract(request) {
        try {
            return await this.scraperService.advancedExtract(request);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async formInteraction(request) {
        try {
            return await this.scraperService.formInteraction(request);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async networkIntercept(request) {
        try {
            return await this.scraperService.networkIntercept(request);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async monitor(request) {
        try {
            return await this.scraperService.monitor(request);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    monitorStream(url, selectors, interval) {
        return this.scraperService.monitorStream(url, selectors.split(','), interval);
    }
    async getDevices() {
        return this.scraperService.getAvailableDevices();
    }
    async batchScrape(request) {
        try {
            return await this.scraperService.batchScrape(request);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ScraperController = ScraperController;
__decorate([
    (0, common_1.Get)('engines'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available scraping engines' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of available engines',
        schema: {
            type: 'object',
            properties: {
                availableEngines: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['playwright', 'puppeteer']
                },
                defaultEngine: {
                    type: 'string',
                    example: 'playwright'
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "getEngines", null);
__decorate([
    (0, common_1.Post)('extract'),
    (0, swagger_1.ApiOperation)({ summary: 'Extract data from a webpage' }),
    (0, swagger_1.ApiBody)({ type: scrape_request_dto_1.ScrapeRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data successfully extracted',
        type: scrape_response_dto_1.ScrapeResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request'
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [scrape_request_dto_1.ScrapeRequestDto]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "extract", null);
__decorate([
    (0, common_1.Post)('screenshot'),
    (0, swagger_1.ApiOperation)({ summary: 'Take a screenshot of a webpage' }),
    (0, swagger_1.ApiBody)({ type: screenshot_request_dto_1.ScreenshotRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Screenshot successfully generated',
        content: {
            'image/png': {},
            'image/jpeg': {},
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request'
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error'
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [screenshot_request_dto_1.ScreenshotRequestDto, Object]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "screenshot", null);
__decorate([
    (0, common_1.Post)('pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a PDF of a webpage' }),
    (0, swagger_1.ApiBody)({ type: pdf_request_dto_1.PdfRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'PDF successfully generated',
        content: {
            'application/pdf': {},
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request'
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error'
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pdf_request_dto_1.PdfRequestDto, Object]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "pdf", null);
__decorate([
    (0, common_1.Post)('evaluate'),
    (0, swagger_1.ApiOperation)({ summary: 'Evaluate JavaScript on a webpage' }),
    (0, swagger_1.ApiBody)({ type: evaluate_request_dto_1.EvaluateRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Script successfully evaluated',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'success' },
                data: { type: 'object', example: {} },
                url: { type: 'string', example: 'https://example.com' },
                timeTaken: { type: 'number', example: 1234 },
                engine: { type: 'string', example: 'playwright' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request'
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [evaluate_request_dto_1.EvaluateRequestDto]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "evaluate", null);
__decorate([
    (0, common_1.Post)('advanced-extract'),
    (0, swagger_1.ApiOperation)({ summary: 'Advanced data extraction with multiple rules and transformations' }),
    (0, swagger_1.ApiBody)({ type: advanced_scrape_request_dto_1.AdvancedScrapeRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data successfully extracted using advanced rules',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'success' },
                data: {
                    type: 'object',
                    example: {
                        title: 'Page Title',
                        prices: ['$10.99', '$15.99'],
                        images: ['image1.jpg', 'image2.jpg']
                    }
                },
                screenshots: {
                    type: 'array',
                    items: { type: 'string' }
                },
                url: { type: 'string', example: 'https://example.com' },
                timeTaken: { type: 'number', example: 2500 },
                pagesScraped: { type: 'number', example: 3 },
                engine: { type: 'string', example: 'playwright' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request'
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [advanced_scrape_request_dto_1.AdvancedScrapeRequestDto]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "advancedExtract", null);
__decorate([
    (0, common_1.Post)('form-interaction'),
    (0, swagger_1.ApiOperation)({ summary: 'Interact with forms on a webpage' }),
    (0, swagger_1.ApiBody)({ type: form_interaction_dto_1.FormInteractionDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Form interaction completed successfully',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'success' },
                data: {
                    type: 'object',
                    example: {
                        fieldsInteracted: 3,
                        formSubmitted: true,
                        finalUrl: 'https://example.com/success'
                    }
                },
                url: { type: 'string', example: 'https://example.com/contact' },
                timeTaken: { type: 'number', example: 3500 },
                engine: { type: 'string', example: 'playwright' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request'
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [form_interaction_dto_1.FormInteractionDto]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "formInteraction", null);
__decorate([
    (0, common_1.Post)('network-intercept'),
    (0, swagger_1.ApiOperation)({ summary: 'Monitor and intercept network requests' }),
    (0, swagger_1.ApiBody)({ type: network_intercept_dto_1.NetworkInterceptDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Network monitoring completed',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'success' },
                data: {
                    type: 'object',
                    example: {
                        requests: [
                            {
                                url: 'https://api.example.com/data',
                                method: 'GET',
                                headers: {},
                                timestamp: '2023-10-18T12:34:56.789Z'
                            }
                        ],
                        interceptedRequests: 15,
                        blockedResources: 45
                    }
                },
                url: { type: 'string', example: 'https://example.com' },
                timeTaken: { type: 'number', example: 30000 },
                engine: { type: 'string', example: 'playwright' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request'
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [network_intercept_dto_1.NetworkInterceptDto]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "networkIntercept", null);
__decorate([
    (0, common_1.Post)('monitor'),
    (0, swagger_1.ApiOperation)({ summary: 'Monitor webpage changes in real-time' }),
    (0, swagger_1.ApiBody)({ type: monitoring_request_dto_1.MonitoringRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Monitoring completed',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'success' },
                data: {
                    type: 'object',
                    example: {
                        changes: [
                            {
                                selector: '.live-data',
                                changeType: 'text',
                                oldValue: 'Loading...',
                                newValue: '42',
                                timestamp: '2023-10-18T12:34:56.789Z'
                            }
                        ],
                        totalChanges: 5,
                        monitoringDuration: 60000
                    }
                },
                url: { type: 'string', example: 'https://example.com' },
                timeTaken: { type: 'number', example: 60000 },
                engine: { type: 'string', example: 'playwright' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request'
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monitoring_request_dto_1.MonitoringRequestDto]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "monitor", null);
__decorate([
    (0, common_1.Sse)('monitor-stream'),
    (0, swagger_1.ApiOperation)({ summary: 'Monitor webpage changes with real-time streaming' }),
    (0, swagger_1.ApiQuery)({ name: 'url', description: 'URL to monitor' }),
    (0, swagger_1.ApiQuery)({ name: 'selectors', description: 'CSS selectors to monitor (comma-separated)' }),
    (0, swagger_1.ApiQuery)({ name: 'interval', description: 'Check interval in milliseconds', required: false }),
    __param(0, (0, common_1.Query)('url')),
    __param(1, (0, common_1.Query)('selectors')),
    __param(2, (0, common_1.Query)('interval')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", rxjs_1.Observable)
], ScraperController.prototype, "monitorStream", null);
__decorate([
    (0, common_1.Get)('devices'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of available device emulations' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of available devices',
        schema: {
            type: 'object',
            properties: {
                devices: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            userAgent: { type: 'string' },
                            viewport: {
                                type: 'object',
                                properties: {
                                    width: { type: 'number' },
                                    height: { type: 'number' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "getDevices", null);
__decorate([
    (0, common_1.Post)('batch-scrape'),
    (0, swagger_1.ApiOperation)({ summary: 'Scrape multiple URLs in batch' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                urls: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['https://example1.com', 'https://example2.com']
                },
                extractionRules: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            selector: { type: 'string' },
                            extractType: { type: 'string' }
                        }
                    }
                },
                concurrent: { type: 'number', example: 3 },
                delay: { type: 'number', example: 1000 },
                engine: { type: 'string', enum: ['playwright', 'puppeteer'] },
                options: { type: 'object' }
            },
            required: ['urls', 'extractionRules']
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Batch scraping completed',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'success' },
                results: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            url: { type: 'string' },
                            data: { type: 'object' },
                            success: { type: 'boolean' },
                            error: { type: 'string' },
                            timeTaken: { type: 'number' }
                        }
                    }
                },
                totalUrls: { type: 'number' },
                successful: { type: 'number' },
                failed: { type: 'number' },
                totalTimeTaken: { type: 'number' }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "batchScrape", null);
exports.ScraperController = ScraperController = __decorate([
    (0, swagger_1.ApiTags)('scraper'),
    (0, common_1.Controller)('scraper'),
    __metadata("design:paramtypes", [scraper_service_1.ScraperService])
], ScraperController);
//# sourceMappingURL=scraper.controller.js.map