import { IsUrl, IsEnum, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EngineType } from '../../core/constants/engine-types.enum';

export class ScreenshotRequestDto {
  @ApiProperty({ 
    description: 'URL to take a screenshot of',
    example: 'https://example.com'
  })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ 
    enum: EngineType,
    description: 'Scraping engine to use',
    default: EngineType.PLAYWRIGHT
  })
  @IsEnum(EngineType)
  @IsOptional()
  engine?: EngineType;

  @ApiPropertyOptional({ 
    description: 'Screenshot options',
    example: {
      fullPage: true,
      type: 'jpeg',
      quality: 80
    }
  })
  @IsObject()
  @IsOptional()
  screenshotOptions?: {
    fullPage?: boolean;
    type?: 'png' | 'jpeg';
    quality?: number;
    clip?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    [key: string]: any;
  };

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