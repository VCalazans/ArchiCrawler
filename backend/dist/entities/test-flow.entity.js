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
exports.TestFlow = exports.TestFlowStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../auth/entities/user.entity");
var TestFlowStatus;
(function (TestFlowStatus) {
    TestFlowStatus["DRAFT"] = "draft";
    TestFlowStatus["ACTIVE"] = "active";
    TestFlowStatus["PAUSED"] = "paused";
    TestFlowStatus["ARCHIVED"] = "archived";
})(TestFlowStatus || (exports.TestFlowStatus = TestFlowStatus = {}));
let TestFlow = class TestFlow {
};
exports.TestFlow = TestFlow;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TestFlow.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], TestFlow.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TestFlow.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], TestFlow.prototype, "steps", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], TestFlow.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], TestFlow.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], TestFlow.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TestFlowStatus,
        default: TestFlowStatus.DRAFT
    }),
    __metadata("design:type", String)
], TestFlow.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_run', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TestFlow.prototype, "lastRun", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TestFlow.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TestFlow.prototype, "updatedAt", void 0);
exports.TestFlow = TestFlow = __decorate([
    (0, typeorm_1.Entity)('test_flows')
], TestFlow);
//# sourceMappingURL=test-flow.entity.js.map