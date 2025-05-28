import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: Request) {
    const apiKey = this.extractApiKey(req);
    if (!apiKey) {
      throw new UnauthorizedException('API Key não fornecida');
    }

    // Obter IP do cliente
    const clientIP = this.getClientIP(req);

    const result = await this.authService.validateApiKey(apiKey, clientIP);
    if (!result) {
      throw new UnauthorizedException('API Key inválida');
    }

    // Adicionar informações da API Key ao request
    req['apiKey'] = result.apiKey;
    return result.user;
  }

  private extractApiKey(req: Request): string | null {
    // Tentar extrair da header Authorization
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ak_')) {
      return authHeader.substring(7); // Remove "Bearer "
    }

    // Tentar extrair da header X-API-Key
    const apiKeyHeader = req.headers['x-api-key'] as string;
    if (apiKeyHeader && apiKeyHeader.startsWith('ak_')) {
      return apiKeyHeader;
    }

    // Tentar extrair do query parameter
    const queryApiKey = req.query.api_key as string;
    if (queryApiKey && queryApiKey.startsWith('ak_')) {
      return queryApiKey;
    }

    return null;
  }

  private getClientIP(req: Request): string {
    return (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection as any)?.socket?.remoteAddress ||
      '127.0.0.1'
    );
  }
} 