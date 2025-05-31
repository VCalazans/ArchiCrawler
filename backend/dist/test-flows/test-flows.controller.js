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
exports.TestExecutionsController = exports.TestFlowsController = void 0;
const common_1 = require("@nestjs/common");
const test_flows_service_1 = require("./test-flows.service");
const create_test_flow_dto_1 = require("./dto/create-test-flow.dto");
const update_test_flow_dto_1 = require("./dto/update-test-flow.dto");
const query_test_flow_dto_1 = require("./dto/query-test-flow.dto");
let TestFlowsController = class TestFlowsController {
    constructor(testFlowsService) {
        this.testFlowsService = testFlowsService;
    }
    async create(createTestFlowDto) {
        if (!createTestFlowDto.userId || createTestFlowDto.userId.trim() === '') {
            createTestFlowDto.userId = '00000000-0000-0000-0000-000000000001';
        }
        const testFlow = await this.testFlowsService.create(createTestFlowDto);
        return {
            success: true,
            data: testFlow,
            message: 'TestFlow criado com sucesso',
        };
    }
    async findAll(query) {
        const result = await this.testFlowsService.findAll(query);
        return {
            success: true,
            data: result.data,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit),
            },
        };
    }
    async findOne(id) {
        const testFlow = await this.testFlowsService.findOne(id);
        return {
            success: true,
            data: testFlow,
        };
    }
    async update(id, updateTestFlowDto) {
        const updatedFlow = await this.testFlowsService.update(id, updateTestFlowDto);
        return {
            success: true,
            data: updatedFlow,
            message: 'TestFlow atualizado com sucesso',
        };
    }
    async remove(id) {
        await this.testFlowsService.remove(id);
        return {
            success: true,
            message: 'TestFlow removido com sucesso',
        };
    }
    async execute(id) {
        const execution = await this.testFlowsService.execute(id, '00000000-0000-0000-0000-000000000001');
        return {
            success: true,
            data: execution,
            message: 'Execução iniciada com sucesso',
        };
    }
};
exports.TestFlowsController = TestFlowsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_test_flow_dto_1.CreateTestFlowDto]),
    __metadata("design:returntype", Promise)
], TestFlowsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_test_flow_dto_1.QueryTestFlowDto]),
    __metadata("design:returntype", Promise)
], TestFlowsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestFlowsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_test_flow_dto_1.UpdateTestFlowDto]),
    __metadata("design:returntype", Promise)
], TestFlowsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestFlowsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/execute'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestFlowsController.prototype, "execute", null);
exports.TestFlowsController = TestFlowsController = __decorate([
    (0, common_1.Controller)('test-flows'),
    __metadata("design:paramtypes", [test_flows_service_1.TestFlowsService])
], TestFlowsController);
let TestExecutionsController = class TestExecutionsController {
    constructor(testFlowsService) {
        this.testFlowsService = testFlowsService;
    }
    async findAll(flowId) {
        const result = await this.testFlowsService.getExecutions(flowId);
        return {
            success: true,
            data: result.data,
            meta: {
                total: result.total,
            },
        };
    }
    async findOne(id) {
        const execution = await this.testFlowsService.getExecution(id);
        return {
            success: true,
            data: execution,
        };
    }
};
exports.TestExecutionsController = TestExecutionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('flowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestExecutionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestExecutionsController.prototype, "findOne", null);
exports.TestExecutionsController = TestExecutionsController = __decorate([
    (0, common_1.Controller)('test-executions'),
    __metadata("design:paramtypes", [test_flows_service_1.TestFlowsService])
], TestExecutionsController);
//# sourceMappingURL=test-flows.controller.js.map