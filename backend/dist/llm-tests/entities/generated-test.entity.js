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
exports.GeneratedTest = void 0;
const typeorm_1 = require("typeorm");
let GeneratedTest = class GeneratedTest {
};
exports.GeneratedTest = GeneratedTest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GeneratedTest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeneratedTest.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeneratedTest.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], GeneratedTest.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeneratedTest.prototype, "targetUrl", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeneratedTest.prototype, "testType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeneratedTest.prototype, "llmProvider", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeneratedTest.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Object)
], GeneratedTest.prototype, "originalPrompt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Object)
], GeneratedTest.prototype, "generatedCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Object)
], GeneratedTest.prototype, "mcpCommands", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GeneratedTest.prototype, "validationResult", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'draft' }),
    __metadata("design:type", String)
], GeneratedTest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GeneratedTest.prototype, "executionHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_execution_at', nullable: true }),
    __metadata("design:type", Date)
], GeneratedTest.prototype, "lastExecutionAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_successful_execution_at', nullable: true }),
    __metadata("design:type", Date)
], GeneratedTest.prototype, "lastSuccessfulExecutionAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'execution_count', default: 0 }),
    __metadata("design:type", Number)
], GeneratedTest.prototype, "executionCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GeneratedTest.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GeneratedTest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GeneratedTest.prototype, "updatedAt", void 0);
exports.GeneratedTest = GeneratedTest = __decorate([
    (0, typeorm_1.Entity)('generated_tests')
], GeneratedTest);
//# sourceMappingURL=generated-test.entity.js.map