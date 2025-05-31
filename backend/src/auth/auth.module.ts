import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { MCPAuthGuard } from './guards/mcp-auth.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { User } from './entities/user.entity';
import { ApiKey } from './entities/api-key.entity';
import { MCPClient } from './entities/mcp-client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ApiKey, MCPClient]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'archicrawler-secret-key-2024',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    ApiKeyStrategy,
    MCPAuthGuard,
    ApiKeyGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, MCPAuthGuard, ApiKeyGuard],
})
export class AuthModule {} 