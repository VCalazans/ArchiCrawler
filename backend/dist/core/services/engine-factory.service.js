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
exports.EngineFactoryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const engine_types_enum_1 = require("../constants/engine-types.enum");
const playwright_engine_factory_1 = require("../engines/playwright/playwright-engine-factory");
const puppeteer_engine_factory_1 = require("../engines/puppeteer/puppeteer-engine-factory");
let EngineFactoryService = class EngineFactoryService {
    constructor(configService, playwrightFactory, puppeteerFactory) {
        this.configService = configService;
        this.playwrightFactory = playwrightFactory;
        this.puppeteerFactory = puppeteerFactory;
        this.factories = new Map();
        this.factories.set(engine_types_enum_1.EngineType.PLAYWRIGHT, playwrightFactory);
        this.factories.set(engine_types_enum_1.EngineType.PUPPETEER, puppeteerFactory);
        this.defaultEngine =
            this.configService.get('DEFAULT_ENGINE') ||
                engine_types_enum_1.EngineType.PLAYWRIGHT;
    }
    async createEngine(engineType = this.defaultEngine, options) {
        const factory = this.factories.get(engineType);
        if (!factory) {
            throw new Error(`Unsupported engine type: ${engineType}`);
        }
        return factory.create(options);
    }
    getAvailableEngines() {
        return Array.from(this.factories.keys());
    }
    getDefaultEngine() {
        return this.defaultEngine;
    }
};
exports.EngineFactoryService = EngineFactoryService;
exports.EngineFactoryService = EngineFactoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        playwright_engine_factory_1.PlaywrightEngineFactory,
        puppeteer_engine_factory_1.PuppeteerEngineFactory])
], EngineFactoryService);
//# sourceMappingURL=engine-factory.service.js.map