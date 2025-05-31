import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  HttpException, 
  HttpStatus, 
  Res,
  Query,
  Sse,
  MessageEvent
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiQuery 
} from '@nestjs/swagger';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { ScraperService } from './scraper.service';
import { ScrapeRequestDto } from './dto/scrape-request.dto';
import { ScrapeResponseDto } from './dto/scrape-response.dto';
import { ScreenshotRequestDto } from './dto/screenshot-request.dto';
import { PdfRequestDto } from './dto/pdf-request.dto';
import { EvaluateRequestDto } from './dto/evaluate-request.dto';
import { FormInteractionDto } from './dto/form-interaction.dto';
import { NetworkInterceptDto } from './dto/network-intercept.dto';
import { AdvancedScrapeRequestDto } from './dto/advanced-scrape-request.dto';
import { MonitoringRequestDto } from './dto/monitoring-request.dto';
import { EngineType } from '../core/constants/engine-types.enum';

@ApiTags('scraper')
@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('engines')
  @ApiOperation({ summary: 'Get available scraping engines' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of available engines',
    schema: {
      type: 'object',
      properties: {
        availableEngines: {
          type: 'array',
          items: { type: 'string' },
          example: ['playwright', 'puppeteer']
        },
        defaultEngine: {
          type: 'string',
          example: 'playwright'
        }
      }
    }
  })
  async getEngines() {
    return this.scraperService.getAvailableEngines();
  }

  @Post('extract')
  @ApiOperation({ summary: 'Extract data from a webpage' })
  @ApiBody({ type: ScrapeRequestDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Data successfully extracted',
    type: ScrapeResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async extract(@Body() scrapeRequest: ScrapeRequestDto): Promise<ScrapeResponseDto> {
    try {
      return await this.scraperService.extract(scrapeRequest);
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('screenshot')
  @ApiOperation({ summary: 'Take a screenshot of a webpage' })
  @ApiBody({ type: ScreenshotRequestDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Screenshot successfully generated',
    content: {
      'image/png': {},
      'image/jpeg': {},
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async screenshot(
    @Body() request: ScreenshotRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { buffer, contentType } = await this.scraperService.screenshot(request);
      
      res.set({
        'Content-Type': contentType,
        'Content-Length': buffer.length,
        'Content-Disposition': `inline; filename="screenshot.${contentType === 'image/jpeg' ? 'jpg' : 'png'}"`,
      });
      
      res.send(buffer);
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('pdf')
  @ApiOperation({ summary: 'Generate a PDF of a webpage' })
  @ApiBody({ type: PdfRequestDto })
  @ApiResponse({ 
    status: 200, 
    description: 'PDF successfully generated',
    content: {
      'application/pdf': {},
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async pdf(
    @Body() request: PdfRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const result = await this.scraperService.pdf(request);
      
      res.set({
        'Content-Type': result.contentType,
        'Content-Length': result.buffer.length,
        'Content-Disposition': 'inline; filename="webpage.pdf"',
      });
      
      res.send(result.buffer);
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('evaluate')
  @ApiOperation({ summary: 'Evaluate JavaScript on a webpage' })
  @ApiBody({ type: EvaluateRequestDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Script successfully evaluated',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: { type: 'object', example: {} },
        url: { type: 'string', example: 'https://example.com' },
        timeTaken: { type: 'number', example: 1234 },
        engine: { type: 'string', example: 'playwright' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async evaluate(@Body() request: EvaluateRequestDto): Promise<ScrapeResponseDto> {
    try {
      return await this.scraperService.evaluate(request);
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('advanced-extract')
  @ApiOperation({ summary: 'Advanced data extraction with multiple rules and transformations' })
  @ApiBody({ type: AdvancedScrapeRequestDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Data successfully extracted using advanced rules',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: { 
          type: 'object',
          example: {
            title: 'Page Title',
            prices: ['$10.99', '$15.99'],
            images: ['image1.jpg', 'image2.jpg']
          }
        },
        screenshots: {
          type: 'array',
          items: { type: 'string' }
        },
        url: { type: 'string', example: 'https://example.com' },
        timeTaken: { type: 'number', example: 2500 },
        pagesScraped: { type: 'number', example: 3 },
        engine: { type: 'string', example: 'playwright' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async advancedExtract(@Body() request: AdvancedScrapeRequestDto): Promise<any> {
    try {
      return await this.scraperService.advancedExtract(request);
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('form-interaction')
  @ApiOperation({ summary: 'Interact with forms on a webpage' })
  @ApiBody({ type: FormInteractionDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Form interaction completed successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: { 
          type: 'object',
          example: {
            fieldsInteracted: 3,
            formSubmitted: true,
            finalUrl: 'https://example.com/success'
          }
        },
        url: { type: 'string', example: 'https://example.com/contact' },
        timeTaken: { type: 'number', example: 3500 },
        engine: { type: 'string', example: 'playwright' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async formInteraction(@Body() request: FormInteractionDto): Promise<ScrapeResponseDto> {
    try {
      return await this.scraperService.formInteraction(request);
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('network-intercept')
  @ApiOperation({ summary: 'Monitor and intercept network requests' })
  @ApiBody({ type: NetworkInterceptDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Network monitoring completed',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: { 
          type: 'object',
          example: {
            requests: [
              {
                url: 'https://api.example.com/data',
                method: 'GET',
                headers: {},
                timestamp: '2023-10-18T12:34:56.789Z'
              }
            ],
            interceptedRequests: 15,
            blockedResources: 45
          }
        },
        url: { type: 'string', example: 'https://example.com' },
        timeTaken: { type: 'number', example: 30000 },
        engine: { type: 'string', example: 'playwright' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async networkIntercept(@Body() request: NetworkInterceptDto): Promise<ScrapeResponseDto> {
    try {
      return await this.scraperService.networkIntercept(request);
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('monitor')
  @ApiOperation({ summary: 'Monitor webpage changes in real-time' })
  @ApiBody({ type: MonitoringRequestDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Monitoring completed',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: { 
          type: 'object',
          example: {
            changes: [
              {
                selector: '.live-data',
                changeType: 'text',
                oldValue: 'Loading...',
                newValue: '42',
                timestamp: '2023-10-18T12:34:56.789Z'
              }
            ],
            totalChanges: 5,
            monitoringDuration: 60000
          }
        },
        url: { type: 'string', example: 'https://example.com' },
        timeTaken: { type: 'number', example: 60000 },
        engine: { type: 'string', example: 'playwright' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async monitor(@Body() request: MonitoringRequestDto): Promise<ScrapeResponseDto> {
    try {
      return await this.scraperService.monitor(request);
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Sse('monitor-stream')
  @ApiOperation({ summary: 'Monitor webpage changes with real-time streaming' })
  @ApiQuery({ name: 'url', description: 'URL to monitor' })
  @ApiQuery({ name: 'selectors', description: 'CSS selectors to monitor (comma-separated)' })
  @ApiQuery({ name: 'interval', description: 'Check interval in milliseconds', required: false })
  monitorStream(
    @Query('url') url: string,
    @Query('selectors') selectors: string,
    @Query('interval') interval?: number
  ): Observable<MessageEvent> {
    return this.scraperService.monitorStream(url, selectors.split(','), interval);
  }

  @Get('devices')
  @ApiOperation({ summary: 'Get list of available device emulations' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of available devices',
    schema: {
      type: 'object',
      properties: {
        devices: {
          type: 'array',
          items: { 
            type: 'object',
            properties: {
              name: { type: 'string' },
              userAgent: { type: 'string' },
              viewport: {
                type: 'object',
                properties: {
                  width: { type: 'number' },
                  height: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  })
  async getDevices() {
    return this.scraperService.getAvailableDevices();
  }

  @Post('batch-scrape')
  @ApiOperation({ summary: 'Scrape multiple URLs in batch' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        urls: {
          type: 'array',
          items: { type: 'string' },
          example: ['https://example1.com', 'https://example2.com']
        },
        extractionRules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              selector: { type: 'string' },
              extractType: { type: 'string' }
            }
          }
        },
        concurrent: { type: 'number', example: 3 },
        delay: { type: 'number', example: 1000 },
        engine: { type: 'string', enum: ['playwright', 'puppeteer'] },
        options: { type: 'object' }
      },
      required: ['urls', 'extractionRules']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Batch scraping completed',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              data: { type: 'object' },
              success: { type: 'boolean' },
              error: { type: 'string' },
              timeTaken: { type: 'number' }
            }
          }
        },
        totalUrls: { type: 'number' },
        successful: { type: 'number' },
        failed: { type: 'number' },
        totalTimeTaken: { type: 'number' }
      }
    }
  })
  async batchScrape(@Body() request: any): Promise<any> {
    try {
      return await this.scraperService.batchScrape(request);
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}