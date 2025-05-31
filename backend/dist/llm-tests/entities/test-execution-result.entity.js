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
exports.TestExecutionResult = void 0;
const typeorm_1 = require("typeorm");
let TestExecutionResult = class TestExecutionResult {
};
exports.TestExecutionResult = TestExecutionResult;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TestExecutionResult.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'test_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TestExecutionResult.prototype, "testId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TestExecutionResult.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'started_at' }),
    __metadata("design:type", Date)
], TestExecutionResult.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', nullable: true }),
    __metadata("design:type", Date)
], TestExecutionResult.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TestExecutionResult.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], TestExecutionResult.prototype, "success", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'running' }),
    __metadata("design:type", String)
], TestExecutionResult.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Array)
], TestExecutionResult.prototype, "logs", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Array)
], TestExecutionResult.prototype, "screenshots", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Array)
], TestExecutionResult.prototype, "errors", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { name: 'mcp_command_results', nullable: true }),
    __metadata("design:type", Array)
], TestExecutionResult.prototype, "mcpCommandResults", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TestExecutionResult.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TestExecutionResult.prototype, "updatedAt", void 0);
exports.TestExecutionResult = TestExecutionResult = __decorate([
    (0, typeorm_1.Entity)('test_execution_results'),
    (0, typeorm_1.Index)(['testId', 'userId']),
    (0, typeorm_1.Index)(['userId', 'startedAt'])
], TestExecutionResult);
//# sourceMappingURL=test-execution-result.entity.js.map