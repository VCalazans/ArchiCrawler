import { Controller, Post, Get, Body, Param, Query, OnModuleInit, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { MCPManagerService } from './mcp-manager.service';
import { MCP_SERVERS_CONFIG, getNetworkServers } from './mcp-servers.config';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { MCPAuthGuard } from '../auth/guards/mcp-auth.guard';

class CallToolDto {
  serverName: string;
  toolName: string;
  arguments: any;
}

class StartServerDto {
  serverName: string;
}

@ApiTags('mcp')
@Controller('mcp')
export class MCPController implements OnModuleInit {
  constructor(private readonly mcpManager: MCPManagerService) {}

  async onModuleInit() {
    // Registrar todos os servidores MCP configurados
    for (const config of MCP_SERVERS_CONFIG) {
      this.mcpManager.registerServer(config);
    }

    // Iniciar automaticamente o servidor Playwright interno
    try {
      await this.mcpManager.startServer('playwright');
    } catch (error) {
      console.error('Erro ao iniciar servidor Playwright:', error);
    }
  }

  @Get('servers')
  @ApiOperation({ summary: 'Listar todos os servidores MCP disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de servidores MCP' })
  getServers() {
    const servers = this.mcpManager.getRegisteredServers();
    return {
      success: true,
      servers: servers.map(server => ({
        name: server.name,
        description: server.description,
        isRunning: this.mcpManager.isServerRunning(server.name),
        networkMode: (server as any).networkMode || 'stdio',
        connectionInfo: this.getServerConnectionInfo(server as any)
      }))
    };
  }

  @Get('connections')
  @ApiOperation({ summary: 'Obter informações de conexão para clientes MCP externos' })
  @ApiResponse({ status: 200, description: 'Informações de conexão MCP' })
  getConnectionsInfo() {
    const networkServers = getNetworkServers();
    const connections = networkServers.map(server => ({
      name: server.name,
      description: server.description,
      isRunning: this.mcpManager.isServerRunning(server.name),
      connectionType: server.networkMode,
      host: server.host || 'localhost',
      port: server.port,
      url: server.networkMode === 'tcp' 
        ? `tcp://${server.host || 'localhost'}:${server.port}`
        : server.networkMode === 'http'
        ? `http://${server.host || 'localhost'}:${server.port}`
        : null,
      clientConfig: this.generateClientConfig(server)
    }));

    return {
      success: true,
      message: 'Informações de conexão para clientes MCP externos',
      connections,
      instructions: {
        claude: 'Para conectar no Claude Desktop, adicione a configuração no arquivo claude_desktop_config.json',
        cursor: 'Para conectar no Cursor, adicione a configuração nas configurações MCP',
        generic: 'Para outros clientes MCP, use as URLs de conexão fornecidas'
      }
    };
  }

  @Post('servers/:serverName/start')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'X-API-Key', description: 'API Key para autenticação' })
  @ApiOperation({ summary: 'Iniciar um servidor MCP específico' })
  @ApiParam({ name: 'serverName', description: 'Nome do servidor MCP' })
  @ApiResponse({ status: 200, description: 'Servidor iniciado com sucesso' })
  async startServer(@Param('serverName') serverName: string) {
    try {
      await this.mcpManager.startServer(serverName);
      const server = this.mcpManager.getRegisteredServers().find(s => s.name === serverName);
      const connectionInfo = server ? this.getServerConnectionInfo(server as any) : null;
      
      return {
        success: true,
        message: `Servidor ${serverName} iniciado com sucesso`,
        connectionInfo
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  @Post('servers/:serverName/stop')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'X-API-Key', description: 'API Key para autenticação' })
  @ApiOperation({ summary: 'Parar um servidor MCP específico' })
  @ApiParam({ name: 'serverName', description: 'Nome do servidor MCP' })
  @ApiResponse({ status: 200, description: 'Servidor parado com sucesso' })
  async stopServer(@Param('serverName') serverName: string) {
    try {
      await this.mcpManager.stopServer(serverName);
      return {
        success: true,
        message: `Servidor ${serverName} parado com sucesso`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  @Get('servers/:serverName/status')
  @ApiOperation({ summary: 'Verificar status de um servidor MCP' })
  @ApiParam({ name: 'serverName', description: 'Nome do servidor MCP' })
  @ApiResponse({ status: 200, description: 'Status do servidor' })
  getServerStatus(@Param('serverName') serverName: string) {
    const isRunning = this.mcpManager.isServerRunning(serverName);
    const server = this.mcpManager.getRegisteredServers().find(s => s.name === serverName);
    
    return {
      success: true,
      serverName,
      isRunning,
      connectionInfo: server ? this.getServerConnectionInfo(server as any) : null
    };
  }

  @Get('servers/:serverName/tools')
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'X-API-Key', description: 'API Key para autenticação' })
  @ApiOperation({ summary: 'Listar ferramentas de um servidor MCP' })
  @ApiParam({ name: 'serverName', description: 'Nome do servidor MCP' })
  @ApiResponse({ status: 200, description: 'Lista de ferramentas' })
  async listTools(@Param('serverName') serverName: string) {
    try {
      const result = await this.mcpManager.listTools(serverName);
      return {
        success: true,
        serverName,
        tools: result.tools || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  @Post('call-tool')
  @UseGuards(MCPAuthGuard)
  @ApiHeader({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' })
  @ApiHeader({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' })
  @ApiOperation({ summary: 'Chamar uma ferramenta de um servidor MCP' })
  @ApiBody({ type: CallToolDto })
  @ApiResponse({ status: 200, description: 'Ferramenta executada com sucesso' })
  async callTool(@Body() callToolDto: CallToolDto) {
    try {
      const result = await this.mcpManager.callTool(
        callToolDto.serverName,
        callToolDto.toolName,
        callToolDto.arguments
      );
      return {
        success: true,
        serverName: callToolDto.serverName,
        toolName: callToolDto.toolName,
        result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Métodos específicos para Playwright (com autenticação)
  @Post('playwright/navigate')
  @UseGuards(MCPAuthGuard)
  @ApiHeader({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' })
  @ApiHeader({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' })
  @ApiOperation({ summary: 'Navegar para uma URL usando Playwright' })
  @ApiResponse({ status: 200, description: 'Navegação realizada com sucesso' })
  async playwrightNavigate(@Body() body: { url: string }) {
    return this.callTool({
      serverName: 'playwright',
      toolName: 'browser_navigate',
      arguments: { url: body.url }
    });
  }

  @Post('playwright/click')
  @UseGuards(MCPAuthGuard)
  @ApiHeader({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' })
  @ApiHeader({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' })
  @ApiOperation({ summary: 'Clicar em um elemento usando Playwright' })
  @ApiResponse({ status: 200, description: 'Clique realizado com sucesso' })
  async playwrightClick(@Body() body: { element: string }) {
    return this.callTool({
      serverName: 'playwright',
      toolName: 'browser_click',
      arguments: { element: body.element }
    });
  }

  @Post('playwright/fill')
  @UseGuards(MCPAuthGuard)
  @ApiHeader({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' })
  @ApiHeader({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' })
  @ApiOperation({ summary: 'Preencher um campo usando Playwright' })
  @ApiResponse({ status: 200, description: 'Campo preenchido com sucesso' })
  async playwrightFill(@Body() body: { element: string; text: string }) {
    return this.callTool({
      serverName: 'playwright',
      toolName: 'browser_fill',
      arguments: { element: body.element, text: body.text }
    });
  }

  @Get('playwright/snapshot')
  @UseGuards(MCPAuthGuard)
  @ApiHeader({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' })
  @ApiHeader({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' })
  @ApiOperation({ summary: 'Obter snapshot da página usando Playwright' })
  @ApiResponse({ status: 200, description: 'Snapshot obtido com sucesso' })
  async playwrightSnapshot() {
    return this.callTool({
      serverName: 'playwright',
      toolName: 'browser_snapshot',
      arguments: {}
    });
  }

  @Post('playwright/screenshot')
  @UseGuards(MCPAuthGuard)
  @ApiHeader({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' })
  @ApiHeader({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' })
  @ApiOperation({ summary: 'Tirar screenshot usando Playwright' })
  @ApiResponse({ status: 200, description: 'Screenshot realizado com sucesso' })
  async playwrightScreenshot(@Body() body: { filename?: string; raw?: boolean }) {
    return this.callTool({
      serverName: 'playwright',
      toolName: 'browser_take_screenshot',
      arguments: body
    });
  }

  @Get('playwright/tabs')
  @UseGuards(MCPAuthGuard)
  @ApiHeader({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' })
  @ApiHeader({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' })
  @ApiOperation({ summary: 'Listar abas usando Playwright' })
  @ApiResponse({ status: 200, description: 'Abas listadas com sucesso' })
  async playwrightListTabs() {
    return this.callTool({
      serverName: 'playwright',
      toolName: 'browser_tab_list',
      arguments: {}
    });
  }

  @Post('playwright/close')
  @UseGuards(MCPAuthGuard)
  @ApiHeader({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' })
  @ApiHeader({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' })
  @ApiOperation({ summary: 'Fechar navegador usando Playwright' })
  @ApiResponse({ status: 200, description: 'Navegador fechado com sucesso' })
  async playwrightClose() {
    return this.callTool({
      serverName: 'playwright',
      toolName: 'browser_close',
      arguments: {}
    });
  }

  private getServerConnectionInfo(server: any) {
    if (!server.networkMode || server.networkMode === 'stdio') {
      return {
        type: 'internal',
        message: 'Servidor interno - acesse via API REST',
        apiUrl: `http://localhost:3001/mcp/servers/${server.name}`
      };
    }

    if (server.networkMode === 'tcp') {
      return {
        type: 'tcp',
        host: server.host || 'localhost',
        port: server.port,
        url: `tcp://${server.host || 'localhost'}:${server.port}`,
        message: 'Conecte clientes MCP via TCP'
      };
    }

    if (server.networkMode === 'http') {
      return {
        type: 'http',
        host: server.host || 'localhost',
        port: server.port,
        url: `http://${server.host || 'localhost'}:${server.port}`,
        message: 'Conecte clientes MCP via HTTP'
      };
    }

    return null;
  }

  private generateClientConfig(server: any) {
    if (server.networkMode === 'tcp') {
      return {
        claude_desktop: {
          mcpServers: {
            [server.name]: {
              command: "nc",
              args: [server.host || 'localhost', String(server.port)]
            }
          }
        },
        cursor: {
          mcp: {
            servers: {
              [server.name]: {
                transport: "tcp",
                host: server.host || 'localhost',
                port: server.port
              }
            }
          }
        }
      };
    }

    return {
      note: 'Configuração específica depende do tipo de transporte'
    };
  }
} 