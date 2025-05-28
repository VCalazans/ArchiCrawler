import { ApiProperty } from '@nestjs/swagger';

export class ScrapeResponseDto {
  @ApiProperty({ 
    description: 'Status of the scrape operation',
    example: 'success'
  })
  status: 'success' | 'error';

  @ApiProperty({ 
    description: 'Data extracted from the page',
    example: ['Title 1', 'Title 2']
  })
  data: any;

  @ApiProperty({ 
    description: 'URL that was scraped',
    example: 'https://example.com'
  })
  url: string;

  @ApiProperty({ 
    description: 'Time taken to complete the scrape (ms)',
    example: 1234
  })
  timeTaken: number;

  @ApiProperty({ 
    description: 'Engine used for scraping',
    example: 'playwright'
  })
  engine: string;
}