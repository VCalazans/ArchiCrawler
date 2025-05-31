import { IsString, IsOptional, IsBoolean, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TestFlowStatus, TestStep } from '../../entities/test-flow.entity';

export class CreateTestStepDto {
  @IsString()
  id: string;

  @IsString()
  type: 'navigate' | 'click' | 'fill' | 'screenshot' | 'assert' | 'extract' | 'wait';

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  config?: Record<string, any>;

  @IsOptional()
  timeout?: number;

  @IsOptional()
  retries?: number;

  @IsOptional()
  @IsBoolean()
  continueOnError?: boolean;
}

export class CreateTestFlowDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestStepDto)
  steps: TestStep[];

  @IsString()
  userId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(TestFlowStatus)
  status?: TestFlowStatus;
} 