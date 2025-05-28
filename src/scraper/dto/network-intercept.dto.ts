import { IsUrl, IsEnum, IsOptional, IsObject, IsArray, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EngineType } from '../../core/constants/engine-types.enum';

export class NetworkInterceptDto {
  @ApiProperty({ 
    description: 'URL to monitor network requests for',
    example: 'https://example.com'
  })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ 
    description: 'URL patterns to intercept (wildcards supported)',
    example: ['**/api/**', '**/graphql']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  interceptPatterns?: string[];

  @ApiPropertyOptional({ 
    description: 'Resource types to block',
    example: ['image', 'stylesheet', 'font']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  blockResources?: string[];

  @ApiPropertyOptional({ 
    description: 'Whether to capture request/response data',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  captureData?: boolean;

  @ApiPropertyOptional({ 
    description: 'Maximum time to monitor in milliseconds',
    example: 30000
  })
  @IsOptional()
  monitorDuration?: number;

  @ApiPropertyOptional({ 
    description: 'Actions to perform on the page while monitoring',
    example: [
      { type: 'click', selector: '#load-more' },
      { type: 'wait', duration: 2000 }
    ]
  })
  @IsArray()
  @IsOptional()
  actions?: Array<{
    type: 'click' | 'scroll' | 'wait' | 'type' | 'navigate';
    selector?: string;
    value?: string;
    duration?: number;
    url?: string;
  }>;

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
