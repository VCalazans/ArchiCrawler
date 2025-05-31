import { IsUrl, IsEnum, IsOptional, IsObject, IsArray, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EngineType } from '../../core/constants/engine-types.enum';

export class FormFieldDto {
  @ApiProperty({ 
    description: 'CSS selector for the form field',
    example: '#email'
  })
  @IsString()
  selector: string;

  @ApiProperty({ 
    description: 'Action to perform on the field',
    enum: ['fill', 'click', 'select', 'check', 'uncheck', 'upload'],
    example: 'fill'
  })
  @IsString()
  action: 'fill' | 'click' | 'select' | 'check' | 'uncheck' | 'upload';

  @ApiPropertyOptional({ 
    description: 'Value to use for the action',
    example: 'user@example.com'
  })
  @IsOptional()
  value?: string | string[] | boolean;

  @ApiPropertyOptional({ 
    description: 'Wait time after action in milliseconds',
    example: 1000
  })
  @IsOptional()
  waitAfter?: number;
}

export class FormInteractionDto {
  @ApiProperty({ 
    description: 'URL of the page with the form',
    example: 'https://example.com/contact'
  })
  @IsUrl()
  url: string;

  @ApiProperty({ 
    description: 'Form fields to interact with',
    type: [FormFieldDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields: FormFieldDto[];

  @ApiPropertyOptional({ 
    description: 'CSS selector for form submission button',
    example: 'button[type="submit"]'
  })
  @IsString()
  @IsOptional()
  submitSelector?: string;

  @ApiPropertyOptional({ 
    description: 'Whether to wait for navigation after form submission',
    example: true
  })
  @IsOptional()
  waitForNavigation?: boolean;

  @ApiPropertyOptional({ 
    enum: EngineType,
    description: 'Scraping engine to use',
    default: EngineType.PLAYWRIGHT
  })
  @IsEnum(EngineType)
  @IsOptional()
  engine?: EngineType;

  @ApiPropertyOptional({ 
    description: 'Engine options',
    example: {
      headless: true,
      timeout: 30000
    }
  })
  @IsObject()
  @IsOptional()
  options?: {
    headless?: boolean;
    timeout?: number;
    userAgent?: string;
    width?: number;
    height?: number;
    ignoreHTTPSErrors?: boolean;
    [key: string]: any;
  };
}
