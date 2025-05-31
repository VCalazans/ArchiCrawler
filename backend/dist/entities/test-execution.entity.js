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
exports.TestExecution = exports.TestExecutionStatus = void 0;
const typeorm_1 = require("typeorm");
const test_flow_entity_1 = require("./test-flow.entity");
const user_entity_1 = require("../auth/entities/user.entity");
var TestExecutionStatus;
(function (TestExecutionStatus) {
    TestExecutionStatus["PENDING"] = "pending";
    TestExecutionStatus["RUNNING"] = "running";
    TestExecutionStatus["SUCCESS"] = "success";
    TestExecutionStatus["FAILED"] = "failed";
    TestExecutionStatus["CANCELLED"] = "cancelled";
})(TestExecutionStatus || (exports.TestExecutionStatus = TestExecutionStatus = {}));
let TestExecution = class TestExecution {
};
exports.TestExecution = TestExecution;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TestExecution.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'test_flow_id' }),
    __metadata("design:type", String)
], TestExecution.prototype, "testFlowId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => test_flow_entity_1.TestFlow),
    (0, typeorm_1.JoinColumn)({ name: 'test_flow_id' }),
    __metadata("design:type", test_flow_entity_1.TestFlow)
], TestExecution.prototype, "testFlow", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], TestExecution.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], TestExecution.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TestExecutionStatus,
        default: TestExecutionStatus.PENDING
    }),
    __metadata("design:type", String)
], TestExecution.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_time', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TestExecution.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_time', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TestExecution.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TestExecution.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TestExecution.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], TestExecution.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], TestExecution.prototype, "steps", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_steps', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TestExecution.prototype, "totalSteps", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_steps', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TestExecution.prototype, "completedSteps", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_steps', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TestExecution.prototype, "failedSteps", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TestExecution.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TestExecution.prototype, "updatedAt", void 0);
exports.TestExecution = TestExecution = __decorate([
    (0, typeorm_1.Entity)('test_executions')
], TestExecution);
//# sourceMappingURL=test-execution.entity.js.map