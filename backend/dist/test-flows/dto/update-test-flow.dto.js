"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTestFlowDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_test_flow_dto_1 = require("./create-test-flow.dto");
class UpdateTestFlowDto extends (0, mapped_types_1.PartialType)(create_test_flow_dto_1.CreateTestFlowDto) {
}
exports.UpdateTestFlowDto = UpdateTestFlowDto;
//# sourceMappingURL=update-test-flow.dto.js.map