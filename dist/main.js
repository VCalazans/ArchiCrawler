"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        skipMissingProperties: false,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('ArchiCrawler API')
        .setDescription('API unificada para web scraping com múltiplos engines e sistema MCP')
        .setVersion('1.0')
        .addTag('scraping')
        .addTag('auth')
        .addTag('mcp')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(3001);
    console.log(`🚀 ArchiCrawler rodando em: ${await app.getUrl()}`);
    console.log(`📚 Documentação Swagger: ${await app.getUrl()}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map