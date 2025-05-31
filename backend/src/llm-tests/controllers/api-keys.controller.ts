import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ApiKeyManagerService } from '../services/api-key-manager.service';
import { LLMProviderFactory } from '../services/llm-provider.factory';
import { StoreApiKeyDto, ValidateApiKeyDto, DeleteApiKeyDto } from '../dto/api-key.dto';

@Controller('llm-tests/api-keys')
export class ApiKeysController {
  constructor(
    private readonly apiKeyManager: ApiKeyManagerService,
    private readonly providerFactory: LLMProviderFactory,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async storeApiKey(@Body() dto: StoreApiKeyDto, @Request() req: any) {
    const userId = req.user?.id || 'demo-user'; // TODO: Implementar autenticação real
    
    try {
      // Validar se o provider é suportado
      const isSupported = await this.providerFactory.validateProviderSupport(dto.provider);
      if (!isSupported) {
        throw new Error(`Provedor não suportado: ${dto.provider}`);
      }

      // Validar a chave API
      const provider = this.providerFactory.createProvider(dto.provider);
      const isValid = await provider.validateApiKey(dto.apiKey);
      
      if (!isValid) {
        return {
          success: false,
          message: 'Chave API inválida',
          provider: dto.provider
        };
      }

      // Armazenar a chave
      await this.apiKeyManager.storeApiKey(userId, dto.provider, dto.apiKey);

      return {
        success: true,
        message: 'Chave API armazenada com sucesso',
        provider: dto.provider
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        provider: dto.provider
      };
    }
  }

  @Get()
  async listProviders(@Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    
    try {
      const userProviders = await this.apiKeyManager.listUserProviders(userId);
      const availableProviders = this.providerFactory.getAvailableProviders();

      return {
        success: true,
        data: {
          configured: userProviders,
          available: availableProviders.map(p => ({
            name: p.name,
            description: p.description,
            models: p.models
          }))
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Post(':provider/validate')
  async validateApiKey(@Param('provider') provider: string, @Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    
    try {
      const isValid = await this.apiKeyManager.validateApiKey(userId, provider);
      
      return {
        success: true,
        data: {
          provider,
          isValid,
          message: isValid ? 'Chave API válida' : 'Chave API inválida ou não encontrada'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        provider
      };
    }
  }

  @Delete(':provider')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteApiKey(@Param('provider') provider: string, @Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    
    try {
      await this.apiKeyManager.deleteApiKey(userId, provider);
      return {
        success: true,
        message: 'Chave API removida com sucesso',
        provider
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        provider
      };
    }
  }

  @Get('status')
  async getApiKeysStatus(@Request() req: any) {
    const userId = req.user?.id || 'demo-user';
    
    try {
      const userProviders = await this.apiKeyManager.listUserProviders(userId);
      const statusPromises = userProviders.map(async (provider) => {
        const isValid = await this.apiKeyManager.validateApiKey(userId, provider);
        return {
          provider,
          isValid,
          lastChecked: new Date().toISOString()
        };
      });

      const statuses = await Promise.all(statusPromises);

      return {
        success: true,
        data: statuses
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
} 