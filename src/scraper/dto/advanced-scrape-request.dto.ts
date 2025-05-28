import { IsUrl, IsEnum, IsOptional, IsObject, IsArray, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EngineType } from '../../core/constants/engine-types.enum';

export class DataExtractionRule {
  @ApiProperty({ 
    description: 'Name/key for the extracted data',
    example: 'title'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'CSS selector for data extraction',
    example: 'h1'
  })
  @IsString()
  selector: string;

  @ApiPropertyOptional({ 
    description: 'Type of data to extract',
    enum: ['text', 'html', 'attribute', 'property', 'count'],
    example: 'text'
  })
  @IsString()
  @IsOptional()
  extractType?: 'text' | 'html' | 'attribute' | 'property' | 'count';

  @ApiPropertyOptional({ 
    description: 'Attribute name (when extractType is "attribute")',
    example: 'href'
  })
  @IsString()
  @IsOptional()
  attributeName?: string;

  @ApiPropertyOptional({ 
    description: 'Property name (when extractType is "property")',
    example: 'value'
  })
  @IsString()
  @IsOptional()
  propertyName?: string;

  @ApiPropertyOptional({ 
    description: 'Whether to extract from all matching elements or just the first',
    example: false
  })
  @IsOptional()
  multiple?: boolean;

  @ApiPropertyOptional({ 
    description: 'Transform function to apply to extracted data',
    example: 'trim'
  })
  @IsString()
  @IsOptional()
  transform?: 'trim' | 'uppercase' | 'lowercase' | 'parseNumber' | 'parseDate' | 'removeWhitespace';

  @ApiPropertyOptional({ 
    description: 'Default value if extraction fails',
    example: ''
  })
  @IsOptional()
  defaultValue?: any;

  @ApiPropertyOptional({ 
    description: 'Regular expression to apply to extracted text',
    example: '\\d+'
  })
  @IsString()
  @IsOptional()
  regex?: string;

  @ApiPropertyOptional({ 
    description: 'Regex flags',
    example: 'gi'
  })
  @IsString()
  @IsOptional()
  regexFlags?: string;
}

export class AdvancedScrapeRequestDto {
  @ApiProperty({ 
    description: 'URL to scrape',
    example: 'https://example.com'
  })
  @IsUrl()
  url: string;

  @ApiProperty({ 
    description: 'Data extraction rules',
    type: [DataExtractionRule]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DataExtractionRule)
  extractionRules: DataExtractionRule[];

  @ApiPropertyOptional({ 
    description: 'Wait conditions before extraction',
    example: {
      selector: '.content-loaded',
      timeout: 10000,
      waitFor: 'visible'
    }
  })
  @IsObject()
  @IsOptional()
  waitConditions?: {
    selector?: string;
    timeout?: number;
    waitFor?: 'visible' | 'hidden' | 'attached' | 'detached';
    networkIdle?: boolean;
  };

  @ApiPropertyOptional({ 
    description: 'Actions to perform before extraction',
    example: [
      { type: 'click', selector: '#load-more' },
      { type: 'scroll', selector: '.infinite-scroll' },
      { type: 'wait', duration: 2000 }
    ]
  })
  @IsArray()
  @IsOptional()
  preActions?: Array<{
    type: 'click' | 'scroll' | 'wait' | 'type' | 'hover' | 'press';
    selector?: string;
    value?: string;
    duration?: number;
    key?: string;
  }>;

  @ApiPropertyOptional({ 
    description: 'Pagination settings for multi-page scraping',
    example: {
      nextButtonSelector: '.next-page',
      maxPages: 10,
      waitBetweenPages: 2000
    }
  })
  @IsObject()
  @IsOptional()
  pagination?: {
    nextButtonSelector: string;
    maxPages?: number;
    waitBetweenPages?: number;
    stopCondition?: string; // CSS selector that indicates no more pages
  };

  @ApiPropertyOptional({ 
    description: 'Screenshot options',
    example: {
      enabled: true,
      fullPage: true,
      quality: 80
    }
  })
  @IsObject()
  @IsOptional()
  screenshot?: {
    enabled: boolean;
    fullPage?: boolean;
    type?: 'png' | 'jpeg';
    quality?: number;
    path?: string;
  };

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
    device?: string;
    geolocation?: {
      latitude: number;
      longitude: number;
    };
    blockResources?: string[];
    [key: string]: any;
  };
}
