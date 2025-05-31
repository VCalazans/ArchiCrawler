import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request, 
  Delete, 
  Param,
  Query,
  Ip
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { MCPAuthGuard } from './guards/mcp-auth.guard';
import { LoginDto, CreateUserDto, CreateApiKeyDto, CreateMCPClientDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login com usuário e senha' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto, @Ip() clientIP: string) {
    return await this.authService.login(loginDto.username, loginDto.password, clientIP);
  }

  @Post('register')
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.createUser(
      createUserDto.username,
      createUserDto.email,
      createUserDto.password,
      createUserDto.role
    );
    
    return {
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil do usuário' })
  async getProfile(@Request() req) {
    return {
      success: true,
      user: req.user,
    };
  }

  @Post('api-keys')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova API Key' })
  @ApiBody({ type: CreateApiKeyDto })
  @ApiResponse({ status: 201, description: 'API Key criada com sucesso' })
  async createApiKey(@Request() req, @Body() createApiKeyDto: CreateApiKeyDto) {
    const result = await this.authService.generateApiKey(
      req.user.id,
      createApiKeyDto.name,
      createApiKeyDto.permissions || [],
      createApiKeyDto.expiresInDays
    );

    return {
      success: true,
      message: 'API Key criada com sucesso',
      apiKey: {
        id: result.apiKey.id,
        name: result.apiKey.name,
        key: result.key, // Mostrar apenas uma vez
        permissions: result.apiKey.permissions,
        expiresAt: result.apiKey.expiresAt,
      },
      warning: 'Guarde esta chave com segurança. Ela não será mostrada novamente.',
    };
  }

  @Get('api-keys')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar API Keys do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de API Keys' })
  async listApiKeys(@Request() req) {
    const apiKeys = await this.authService.getUserApiKeys(req.user.id);
    return {
      success: true,
      apiKeys,
    };
  }

  @Delete('api-keys/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revogar API Key' })
  @ApiResponse({ status: 200, description: 'API Key revogada com sucesso' })
  async revokeApiKey(@Request() req, @Param('id') apiKeyId: string) {
    const success = await this.authService.revokeApiKey(apiKeyId, req.user.id);
    
    if (!success) {
      return {
        success: false,
        message: 'API Key não encontrada',
      };
    }

    return {
      success: true,
      message: 'API Key revogada com sucesso',
    };
  }

  @Post('mcp-clients')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar cliente MCP' })
  @ApiBody({ type: CreateMCPClientDto })
  @ApiResponse({ status: 201, description: 'Cliente MCP criado com sucesso' })
  async createMCPClient(@Body() createMCPClientDto: CreateMCPClientDto) {
    const mcpClient = await this.authService.createMCPClient(
      createMCPClientDto.name,
      createMCPClientDto.permissions || [],
      createMCPClientDto.allowedIPs || []
    );

    return {
      success: true,
      message: 'Cliente MCP criado com sucesso',
      client: {
        id: mcpClient.id,
        name: mcpClient.name,
        clientId: mcpClient.clientId,
        clientSecret: mcpClient.clientSecret, // Mostrar apenas uma vez
        permissions: mcpClient.permissions,
        allowedIPs: mcpClient.allowedIPs,
      },
      warning: 'Guarde estas credenciais com segurança. Elas não serão mostradas novamente.',
    };
  }

  @Get('mcp-clients')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar clientes MCP' })
  @ApiResponse({ status: 200, description: 'Lista de clientes MCP' })
  async listMCPClients() {
    const clients = await this.authService.getMCPClients();
    return {
      success: true,
      clients,
    };
  }

  @Delete('mcp-clients/:clientId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revogar cliente MCP' })
  @ApiResponse({ status: 200, description: 'Cliente MCP revogado com sucesso' })
  async revokeMCPClient(@Param('clientId') clientId: string) {
    const success = await this.authService.revokeMCPClient(clientId);
    
    if (!success) {
      return {
        success: false,
        message: 'Cliente MCP não encontrado',
      };
    }

    return {
      success: true,
      message: 'Cliente MCP revogado com sucesso',
    };
  }

  @Get('test-api-key')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'X-API-Key', description: 'API Key para autenticação' })
  @ApiOperation({ summary: 'Testar autenticação via API Key' })
  @ApiResponse({ status: 200, description: 'API Key válida' })
  async testApiKey(@Request() req) {
    return {
      success: true,
      message: 'API Key válida',
      user: req.user,
      apiKey: {
        id: req.apiKey.id,
        name: req.apiKey.name,
        permissions: req.apiKey.permissions,
        lastUsed: req.apiKey.lastUsed,
      },
    };
  }

  @Get('test-mcp')
  @UseGuards(MCPAuthGuard)
  @ApiHeader({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' })
  @ApiHeader({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' })
  @ApiOperation({ summary: 'Testar autenticação MCP' })
  @ApiResponse({ status: 200, description: 'Cliente MCP válido' })
  async testMCP(@Request() req) {
    return {
      success: true,
      message: 'Cliente MCP válido',
      client: {
        id: req.mcpClient.id,
        name: req.mcpClient.name,
        clientId: req.mcpClient.clientId,
        permissions: req.mcpClient.permissions,
        allowedIPs: req.mcpClient.allowedIPs,
      },
    };
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter estatísticas de autenticação' })
  @ApiResponse({ status: 200, description: 'Estatísticas de autenticação' })
  async getStats() {
    const stats = await this.authService.getAuthStats();
    return {
      success: true,
      stats,
    };
  }

  @Get('check-permission')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'X-API-Key', description: 'API Key para autenticação' })
  @ApiOperation({ summary: 'Verificar permissão específica' })
  @ApiResponse({ status: 200, description: 'Resultado da verificação de permissão' })
  async checkPermission(@Request() req, @Query('permission') permission: string) {
    if (!permission) {
      return {
        success: false,
        message: 'Parâmetro permission é obrigatório',
      };
    }

    const hasPermission = this.authService.hasPermission(
      req.apiKey.permissions,
      permission
    );

    return {
      success: true,
      permission,
      hasPermission,
      userPermissions: req.apiKey.permissions,
    };
  }
} 