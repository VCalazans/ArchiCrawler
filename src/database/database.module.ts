import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../auth/entities/user.entity';
import { ApiKey } from '../auth/entities/api-key.entity';
import { MCPClient } from '../auth/entities/mcp-client.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') || '145.223.79.190',
        port: configService.get('DB_PORT') || 5432,
        username: configService.get('DB_USERNAME') || 'archicode',
        password: configService.get('DB_PASSWORD') || '#Archicode2025',
        database: configService.get('DB_DATABASE') || 'archicrawler',
        entities: [User, ApiKey, MCPClient],
        synchronize: false, // Desabilitado - usar migrações manuais
        logging: configService.get('NODE_ENV') === 'development',
        ssl: false, // Desabilitar SSL
        extra: {
          connectionTimeoutMillis: 30000,
          idleTimeoutMillis: 30000,
          max: 20, // Máximo de conexões no pool
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {} 