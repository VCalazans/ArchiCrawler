import { IsString, IsUrl, IsEnum, IsOptional, IsObject, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EngineType } from '../../core/constants/engine-types.enum';

export class ScrapeRequestDto {
  @ApiProperty({ 
    description: 'URL to scrape',
    example: 'https://example.com'
  })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ 
    description: 'CSS selector to extract text from',
    example: 'h1, .product-title'
  })
  @IsString()
  @IsOptional()
  selector?: string;

  @ApiPropertyOptional({ 
    enum: EngineType,
    description: 'Scraping engine to use',
    default: EngineType.PLAYWRIGHT
  })
  @IsEnum(EngineType)
  @IsOptional()
  engine?: EngineType;

  @ApiPropertyOptional({ 
    description: 'Wait for selector before scraping',
    example: '.content-loaded'
  })
  @IsString()
  @IsOptional()
  waitForSelector?: string;

  @ApiPropertyOptional({ 
    description: 'Engine options',
    example: {
      headless: true,
      timeout: 30000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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