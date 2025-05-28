import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Apply global middleware
  app.use(helmet());
  app.enableCors();
  
  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      skipMissingProperties: false,
    }),
  );
  
  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('ArchiCrawler API')
    .setDescription('API unificada para web scraping com múltiplos engines e sistema MCP')
    .setVersion('1.0')
    .addTag('scraping')
    .addTag('auth')
    .addTag('mcp')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3001);
  console.log(`🚀 ArchiCrawler rodando em: ${await app.getUrl()}`);
  console.log(`📚 Documentação Swagger: ${await app.getUrl()}/api`);
}
bootstrap();