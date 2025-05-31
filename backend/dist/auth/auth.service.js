"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
const user_entity_1 = require("./entities/user.entity");
const api_key_entity_1 = require("./entities/api-key.entity");
const mcp_client_entity_1 = require("./entities/mcp-client.entity");
let AuthService = AuthService_1 = class AuthService {
    constructor(userRepository, apiKeyRepository, mcpClientRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.apiKeyRepository = apiKeyRepository;
        this.mcpClientRepository = mcpClientRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async onModuleInit() {
        await this.checkDatabaseConnection();
    }
    async checkDatabaseConnection() {
        try {
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
            }
            else {
                this.logger.log('✅ Sistema de autenticação pronto!');
            }
        }
        catch (error) {
            this.logger.error('❌ Erro ao verificar banco de dados:', error.message);
            this.logger.error('💡 Execute: npm run db:migrate para criar as tabelas');
        }
    }
    async validateUser(username, password, clientIP) {
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
            await this.userRepository.update(user.id, {
                lastLogin: new Date(),
                lastLoginIP: clientIP,
            });
            return user;
        }
        catch (error) {
            this.logger.error('Erro na validação do usuário:', error);
            return null;
        }
    }
    async login(username, password, clientIP) {
        const user = await this.validateUser(username, password, clientIP);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
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
    async validateJWT(payload) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: payload.sub, isActive: true }
            });
            return user || null;
        }
        catch (error) {
            this.logger.error('Erro na validação do JWT:', error);
            return null;
        }
    }
    async generateApiKey(userId, name, permissions = [], expiresInDays) {
        try {
            const rawKey = (0, crypto_1.randomBytes)(32).toString('hex');
            const keyHash = (0, crypto_1.createHash)('sha256').update(rawKey).digest('hex');
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
        }
        catch (error) {
            this.logger.error('Erro ao gerar API Key:', error);
            throw error;
        }
    }
    async validateApiKey(key, clientIP) {
        try {
            if (!key.startsWith('ak_')) {
                return null;
            }
            const rawKey = key.substring(3);
            const keyHash = (0, crypto_1.createHash)('sha256').update(rawKey).digest('hex');
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
            if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
                return null;
            }
            await this.apiKeyRepository.update(apiKey.id, {
                lastUsed: new Date(),
                lastUsedIP: clientIP,
            });
            return { user: apiKey.user, apiKey };
        }
        catch (error) {
            this.logger.error('Erro na validação da API Key:', error);
            return null;
        }
    }
    async createMCPClient(name, permissions = [], allowedIPs = []) {
        try {
            const clientId = `mcp_${(0, crypto_1.randomBytes)(16).toString('hex')}`;
            const clientSecret = (0, crypto_1.randomBytes)(32).toString('hex');
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
        }
        catch (error) {
            this.logger.error('Erro ao criar cliente MCP:', error);
            throw error;
        }
    }
    async validateMCPClient(clientId, clientSecret, clientIP) {
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
            if (client.allowedIPs && client.allowedIPs.length > 0 && clientIP) {
                if (!client.allowedIPs.includes(clientIP)) {
                    this.logger.warn(`🚫 IP não autorizado para cliente MCP ${clientId}: ${clientIP}`);
                    return null;
                }
            }
            await this.mcpClientRepository.update(client.id, {
                lastUsed: new Date(),
                lastUsedIP: clientIP,
            });
            return client;
        }
        catch (error) {
            this.logger.error('Erro na validação do cliente MCP:', error);
            return null;
        }
    }
    hasPermission(permissions, requiredPermission) {
        if (permissions.includes('*')) {
            return true;
        }
        if (permissions.includes(requiredPermission)) {
            return true;
        }
        const wildcardPermissions = permissions.filter(p => p.endsWith('*'));
        for (const wildcardPerm of wildcardPermissions) {
            const prefix = wildcardPerm.slice(0, -1);
            if (requiredPermission.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }
    async getUserApiKeys(userId) {
        try {
            const apiKeys = await this.apiKeyRepository.find({
                where: { userId },
                select: ['id', 'name', 'permissions', 'isActive', 'expiresAt', 'lastUsed', 'createdAt', 'updatedAt']
            });
            return apiKeys;
        }
        catch (error) {
            this.logger.error('Erro ao listar API Keys:', error);
            return [];
        }
    }
    async revokeApiKey(apiKeyId, userId) {
        try {
            const result = await this.apiKeyRepository.update({ id: apiKeyId, userId }, { isActive: false });
            if (result.affected && result.affected > 0) {
                this.logger.log(`🗑️ API Key revogada: ${apiKeyId}`);
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error('Erro ao revogar API Key:', error);
            return false;
        }
    }
    async getMCPClients() {
        try {
            const clients = await this.mcpClientRepository.find({
                select: ['id', 'name', 'clientId', 'permissions', 'isActive', 'allowedIPs', 'lastUsed', 'createdAt', 'updatedAt']
            });
            return clients;
        }
        catch (error) {
            this.logger.error('Erro ao listar clientes MCP:', error);
            return [];
        }
    }
    async revokeMCPClient(clientId) {
        try {
            const result = await this.mcpClientRepository.update({ clientId }, { isActive: false });
            if (result.affected && result.affected > 0) {
                this.logger.log(`🗑️ Cliente MCP revogado: ${clientId}`);
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error('Erro ao revogar cliente MCP:', error);
            return false;
        }
    }
    async createUser(username, email, password, role = user_entity_1.UserRole.USER) {
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
        }
        catch (error) {
            this.logger.error('Erro ao criar usuário:', error);
            throw error;
        }
    }
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
                    admin: user_entity_1.UserRole.ADMIN,
                    user: user_entity_1.UserRole.USER,
                    mcp_client: user_entity_1.UserRole.MCP_CLIENT
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
        }
        catch (error) {
            this.logger.error('Erro ao obter estatísticas:', error);
            return {
                users: { total: 0, active: 0, byRole: { admin: 0, user: 0, 'mcp-client': 0 } },
                apiKeys: { total: 0, active: 0, expired: 0 },
                mcpClients: { total: 0, active: 0 },
            };
        }
    }
    async findUserById(id) {
        try {
            return await this.userRepository.findOne({ where: { id, isActive: true } });
        }
        catch (error) {
            this.logger.error('Erro ao buscar usuário:', error);
            return null;
        }
    }
    async updatePassword(userId, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const result = await this.userRepository.update(userId, { password: hashedPassword });
            return result.affected ? result.affected > 0 : false;
        }
        catch (error) {
            this.logger.error('Erro ao atualizar senha:', error);
            return false;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(api_key_entity_1.ApiKey)),
    __param(2, (0, typeorm_1.InjectRepository)(mcp_client_entity_1.MCPClient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map