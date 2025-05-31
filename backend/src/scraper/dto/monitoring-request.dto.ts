import { IsUrl, IsEnum, IsOptional, IsObject, IsArray, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EngineType } from '../../core/constants/engine-types.enum';

export class MonitoringRequestDto {
  @ApiProperty({ 
    description: 'URL to monitor for changes',
    example: 'https://example.com/live-feed'
  })
  @IsUrl()
  url: string;

  @ApiProperty({ 
    description: 'CSS selectors to monitor for changes',
    example: ['.live-data', '#counter', '.status']
  })
  @IsArray()
  @IsString({ each: true })
  selectors: string[];

  @ApiPropertyOptional({ 
    description: 'Monitoring duration in milliseconds',
    example: 60000
  })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ 
    description: 'Interval between checks in milliseconds',
    example: 5000
  })
  @IsNumber()
  @IsOptional()
  interval?: number;

  @ApiPropertyOptional({ 
    description: 'Types of changes to detect',
    example: ['text', 'attribute', 'visibility']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  changeTypes?: ('text' | 'attribute' | 'visibility' | 'count' | 'position')[];

  @ApiPropertyOptional({ 
    description: 'Specific attributes to monitor',
    example: ['class', 'data-value', 'src']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  monitorAttributes?: string[];

  @ApiPropertyOptional({ 
    description: 'Actions to perform when changes are detected',
    example: [
      { type: 'screenshot', path: './change-detected.png' },
      { type: 'extract', selector: '.new-data' }
    ]
  })
  @IsArray()
  @IsOptional()
  onChangeActions?: Array<{
    type: 'screenshot' | 'extract' | 'click' | 'scroll';
    selector?: string;
    path?: string;
    [key: string]: any;
  }>;

  @ApiPropertyOptional({ 
    description: 'Whether to capture screenshots of changes',
    example: true
  })
  @IsOptional()
  captureScreenshots?: boolean;

  @ApiPropertyOptional({ 
    description: 'Maximum number of changes to capture',
    example: 50
  })
  @IsNumber()
  @IsOptional()
  maxChanges?: number;

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
