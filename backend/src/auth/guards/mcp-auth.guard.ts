import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class MCPAuthGuard implements CanActivate {
  private readonly logger = new Logger(MCPAuthGuard.name);

  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Extrair credenciais MCP
    const clientId = this.extractClientId(request);
    const clientSecret = this.extractClientSecret(request);
    
    if (!clientId || !clientSecret) {
      this.logger.warn('🚫 Credenciais MCP não fornecidas');
      throw new UnauthorizedException('Credenciais MCP obrigatórias');
    }

    // Obter IP do cliente
    const clientIP = this.getClientIP(request);
    
    // Validar cliente MCP
    const mcpClient = await this.authService.validateMCPClient(clientId, clientSecret, clientIP);
    
    if (!mcpClient) {
      this.logger.warn(`🚫 Cliente MCP inválido: ${clientId} de ${clientIP}`);
      throw new UnauthorizedException('Cliente MCP inválido');
    }

    // Adicionar informações do cliente ao request
    request['mcpClient'] = mcpClient;
    
    this.logger.log(`✅ Cliente MCP autenticado: ${mcpClient.name} de ${clientIP}`);
    return true;
  }

  private extractClientId(request: Request): string | null {
    // Header X-MCP-Client-ID
    const headerClientId = request.headers['x-mcp-client-id'] as string;
    if (headerClientId) {
      return headerClientId;
    }

    // Authorization header (Basic auth)
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Basic ')) {
      try {
        const credentials = Buffer.from(authHeader.substring(6), 'base64').toString();
        const [clientId] = credentials.split(':');
        return clientId;
      } catch (error) {
        return null;
      }
    }

    // Query parameter
    const queryClientId = request.query.client_id as string;
    if (queryClientId) {
      return queryClientId;
    }

    return null;
  }

  private extractClientSecret(request: Request): string | null {
    // Header X-MCP-Client-Secret
    const headerClientSecret = request.headers['x-mcp-client-secret'] as string;
    if (headerClientSecret) {
      return headerClientSecret;
    }

    // Authorization header (Basic auth)
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Basic ')) {
      try {
        const credentials = Buffer.from(authHeader.substring(6), 'base64').toString();
        const [, clientSecret] = credentials.split(':');
        return clientSecret;
      } catch (error) {
        return null;
      }
    }

    // Query parameter
    const queryClientSecret = request.query.client_secret as string;
    if (queryClientSecret) {
      return queryClientSecret;
    }

    return null;
  }

  private getClientIP(request: Request): string {
    return (
      request.headers['x-forwarded-for'] as string ||
      request.headers['x-real-ip'] as string ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      (request.connection as any)?.socket?.remoteAddress ||
      '127.0.0.1'
    );
  }
} 