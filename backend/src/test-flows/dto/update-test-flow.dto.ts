import { PartialType } from '@nestjs/mapped-types';
import { CreateTestFlowDto } from './create-test-flow.dto';

export class UpdateTestFlowDto extends PartialType(CreateTestFlowDto) {} 