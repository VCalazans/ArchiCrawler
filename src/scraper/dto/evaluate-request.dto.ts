import { IsUrl, IsEnum, IsOptional, IsObject, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EngineType } from '../../core/constants/engine-types.enum';

export class EvaluateRequestDto {
  @ApiProperty({ 
    description: 'URL to evaluate script on',
    example: 'https://example.com'
  })
  @IsUrl()
  url: string;

  @ApiProperty({ 
    description: 'JavaScript to evaluate in the page context',
    example: 'return Array.from(document.querySelectorAll("h1")).map(el => el.textContent)'
  })
  @IsString()
  script: string;

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