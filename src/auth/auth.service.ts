import { Injectable, UnauthorizedException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { User, UserRole } from './entities/user.entity';
import { ApiKey } from './entities/api-key.entity';
import { MCPClient } from './entities/mcp-client.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(MCPClient)
    private mcpClientRepository: Repository<MCPClient>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.checkDatabaseConnection();
  }

  private async checkDatabaseConnection() {
    try {
      // Verificar se as tabelas existem e têm dados
      const [userCount, apiKeyCount, mcpClientCount] = await Promise.all([
        this.userRepository.count(),
        this.apiKeyRepository.count(),
        this.mcpClientRepository.count()
      ]);

      this.logger.log('📊 Estado do banco de dados:');
      this.logger.log(`   👤 Usuários: ${userCount}`);
      this.logger.log(`   🔑 API Keys: ${apiKeyCount}`);
      this.logger.log(`   🤖 Clientes MCP: ${mcpClientCount}`);

      if (userCount === 0) {
        this.logger.warn('⚠️  Nenhum usuário encontrado! Execute: npm run db:migrate');
      } else {
        this.logger.log('✅ Sistema de autenticação pronto!');
      }
    } catch (error) {
      this.logger.error('❌ Erro ao verificar banco de dados:', error.message);
      this.logger.error('💡 Execute: npm run db:migrate para criar as tabelas');
    }
  }

  /**
   * Autenticação por usuário/senha
   */
  async validateUser(username: string, password: string, clientIP?: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { username, isActive: true }
      });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      // Atualizar último login
      await this.userRepository.update(user.id, {
        lastLogin: new Date(),
        lastLoginIP: clientIP,
      });

      return user;
    } catch (error) {
      this.logger.error('Erro na validação do usuário:', error);
      return null;
    }
  }

  /**
   * Login e geração de JWT
   */
  async login(username: string, password: string, clientIP?: string) {
    const user = await this.validateUser(username, password, clientIP);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    
    this.logger.log(`✅ Login realizado: ${user.username} de ${clientIP}`);
    
    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: '24h',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Validação de JWT
   */
  async validateJWT(payload: any): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: payload.sub, isActive: true }
      });
      return user || null;
    } catch (error) {
      this.logger.error('Erro na validação do JWT:', error);
      return null;
    }
  }

  /**
   * Geração de API Key
   */
  async generateApiKey(
    userId: string,
    name: string,
    permissions: string[] = [],
    expiresInDays?: number
  ): Promise<{ key: string; apiKey: ApiKey }> {
    try {
      const rawKey = randomBytes(32).toString('hex');
      const keyHash = createHash('sha256').update(rawKey).digest('hex');
      
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : undefined;

      const apiKey = this.apiKeyRepository.create({
        name,
        keyHash,
        userId,
        permissions,
        isActive: true,
        expiresAt,
      });

      const savedApiKey = await this.apiKeyRepository.save(apiKey);
      
      this.logger.log(`🔑 API Key criada: ${name} para usuário ${userId}`);
      
      return {
        key: `ak_${rawKey}`,
        apiKey: savedApiKey,
      };
    } catch (error) {
      this.logger.error('Erro ao gerar API Key:', error);
      throw error;
    }
  }

  /**
   * Validação de API Key
   */
  async validateApiKey(key: string, clientIP?: string): Promise<{ user: User; apiKey: ApiKey } | null> {
    try {
      if (!key.startsWith('ak_')) {
        return null;
      }

      const rawKey = key.substring(3);
      const keyHash = createHash('sha256').update(rawKey).digest('hex');
      
      const apiKey = await this.apiKeyRepository.findOne({
        where: { 
          keyHash, 
          isActive: true 
        },
        relations: ['user']
      });

      if (!apiKey || !apiKey.user || !apiKey.user.isActive) {
        return null;
      }

      // Verificar expiração
      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return null;
      }

      // Atualizar último uso
      await this.apiKeyRepository.update(apiKey.id, {
        lastUsed: new Date(),
        lastUsedIP: clientIP,
      });
      
      return { user: apiKey.user, apiKey };
    } catch (error) {
      this.logger.error('Erro na validação da API Key:', error);
      return null;
    }
  }

  /**
   * Criação de cliente MCP
   */
  async createMCPClient(
    name: string,
    permissions: string[] = [],
    allowedIPs: string[] = []
  ): Promise<MCPClient> {
    try {
      const clientId = `mcp_${randomBytes(16).toString('hex')}`;
      const clientSecret = randomBytes(32).toString('hex');

      const mcpClient = this.mcpClientRepository.create({
        name,
        clientId,
        clientSecret,
        permissions,
        isActive: true,
        allowedIPs,
      });

      const savedClient = await this.mcpClientRepository.save(mcpClient);
      
      this.logger.log(`🤖 Cliente MCP criado: ${name}`);
      
      return savedClient;
    } catch (error) {
      this.logger.error('Erro ao criar cliente MCP:', error);
      throw error;
    }
  }

  /**
   * Validação de cliente MCP
   */
  async validateMCPClient(
    clientId: string,
    clientSecret: string,
    clientIP?: string
  ): Promise<MCPClient | null> {
    try {
      const client = await this.mcpClientRepository.findOne({
        where: { 
          clientId, 
          clientSecret, 
          isActive: true 
        }
      });

      if (!client) {
        return null;
      }

      // Verificar IP se configurado
      if (client.allowedIPs && client.allowedIPs.length > 0 && clientIP) {
        if (!client.allowedIPs.includes(clientIP)) {
          this.logger.warn(`🚫 IP não autorizado para cliente MCP ${clientId}: ${clientIP}`);
          return null;
        }
      }

      // Atualizar último uso
      await this.mcpClientRepository.update(client.id, {
        lastUsed: new Date(),
        lastUsedIP: clientIP,
      });

      return client;
    } catch (error) {
      this.logger.error('Erro na validação do cliente MCP:', error);
      return null;
    }
  }

  /**
   * Verificação de permissões
   */
  hasPermission(permissions: string[], requiredPermission: string): boolean {
    // Permissão total
    if (permissions.includes('*')) {
      return true;
    }

    // Permissão exata
    if (permissions.includes(requiredPermission)) {
      return true;
    }

    // Permissão com wildcard
    const wildcardPermissions = permissions.filter(p => p.endsWith('*'));
    for (const wildcardPerm of wildcardPermissions) {
      const prefix = wildcardPerm.slice(0, -1);
      if (requiredPermission.startsWith(prefix)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Listar API Keys do usuário
   */
  async getUserApiKeys(userId: string): Promise<Omit<ApiKey, 'keyHash'>[]> {
    try {
      const apiKeys = await this.apiKeyRepository.find({
        where: { userId },
        select: ['id', 'name', 'permissions', 'isActive', 'expiresAt', 'lastUsed', 'createdAt', 'updatedAt']
      });
      return apiKeys;
    } catch (error) {
      this.logger.error('Erro ao listar API Keys:', error);
      return [];
    }
  }

  /**
   * Revogar API Key
   */
  async revokeApiKey(apiKeyId: string, userId: string): Promise<boolean> {
    try {
      const result = await this.apiKeyRepository.update(
        { id: apiKeyId, userId },
        { isActive: false }
      );
      
      if (result.affected && result.affected > 0) {
        this.logger.log(`🗑️ API Key revogada: ${apiKeyId}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Erro ao revogar API Key:', error);
      return false;
    }
  }

  /**
   * Listar clientes MCP
   */
  async getMCPClients(): Promise<Omit<MCPClient, 'clientSecret'>[]> {
    try {
      const clients = await this.mcpClientRepository.find({
        select: ['id', 'name', 'clientId', 'permissions', 'isActive', 'allowedIPs', 'lastUsed', 'createdAt', 'updatedAt']
      });
      return clients;
    } catch (error) {
      this.logger.error('Erro ao listar clientes MCP:', error);
      return [];
    }
  }

  /**
   * Revogar cliente MCP
   */
  async revokeMCPClient(clientId: string): Promise<boolean> {
    try {
      const result = await this.mcpClientRepository.update(
        { clientId },
        { isActive: false }
      );
      
      if (result.affected && result.affected > 0) {
        this.logger.log(`🗑️ Cliente MCP revogado: ${clientId}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Erro ao revogar cliente MCP:', error);
      return false;
    }
  }

  /**
   * Criar usuário
   */
  async createUser(
    username: string,
    email: string,
    password: string,
    role: UserRole = UserRole.USER
  ): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = this.userRepository.create({
        username,
        email,
        password: hashedPassword,
        role,
        isActive: true,
      });

      const savedUser = await this.userRepository.save(user);
      
      this.logger.log(`👤 Usuário criado: ${username}`);
      
      return savedUser;
    } catch (error) {
      this.logger.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de autenticação
   */
  async getAuthStats() {
    try {
      const [userStats, apiKeyStats, mcpClientStats] = await Promise.all([
        this.userRepository.createQueryBuilder('user')
          .select([
            'COUNT(*) as total',
            'COUNT(CASE WHEN "isActive" = true THEN 1 END) as active',
            'COUNT(CASE WHEN role = :admin THEN 1 END) as admin_count',
            'COUNT(CASE WHEN role = :user THEN 1 END) as user_count',
            'COUNT(CASE WHEN role = :mcp_client THEN 1 END) as mcp_client_count'
          ])
          .setParameters({
            admin: UserRole.ADMIN,
            user: UserRole.USER,
            mcp_client: UserRole.MCP_CLIENT
          })
          .getRawOne(),

        this.apiKeyRepository.createQueryBuilder('apiKey')
          .select([
            'COUNT(*) as total',
            'COUNT(CASE WHEN "isActive" = true THEN 1 END) as active',
            'COUNT(CASE WHEN "expiresAt" IS NOT NULL AND "expiresAt" < NOW() THEN 1 END) as expired'
          ])
          .getRawOne(),

        this.mcpClientRepository.createQueryBuilder('mcpClient')
          .select([
            'COUNT(*) as total',
            'COUNT(CASE WHEN "isActive" = true THEN 1 END) as active'
          ])
          .getRawOne()
      ]);

      return {
        users: {
          total: parseInt(userStats.total),
          active: parseInt(userStats.active),
          byRole: {
            admin: parseInt(userStats.admin_count),
            user: parseInt(userStats.user_count),
            'mcp-client': parseInt(userStats.mcp_client_count),
          },
        },
        apiKeys: {
          total: parseInt(apiKeyStats.total),
          active: parseInt(apiKeyStats.active),
          expired: parseInt(apiKeyStats.expired),
        },
        mcpClients: {
          total: parseInt(mcpClientStats.total),
          active: parseInt(mcpClientStats.active),
        },
      };
    } catch (error) {
      this.logger.error('Erro ao obter estatísticas:', error);
      return {
        users: { total: 0, active: 0, byRole: { admin: 0, user: 0, 'mcp-client': 0 } },
        apiKeys: { total: 0, active: 0, expired: 0 },
        mcpClients: { total: 0, active: 0 },
      };
    }
  }

  /**
   * Buscar usuário por ID
   */
  async findUserById(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { id, isActive: true } });
    } catch (error) {
      this.logger.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  /**
   * Atualizar senha do usuário
   */
  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const result = await this.userRepository.update(userId, { password: hashedPassword });
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      this.logger.error('Erro ao atualizar senha:', error);
      return false;
    }
  }
} 