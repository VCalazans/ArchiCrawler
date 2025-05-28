import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from './entities/user.entity';
import { ApiKey } from './entities/api-key.entity';
import { MCPClient } from './entities/mcp-client.entity';
export declare class AuthService implements OnModuleInit {
    private userRepository;
    private apiKeyRepository;
    private mcpClientRepository;
    private jwtService;
    private configService;
    private readonly logger;
    constructor(userRepository: Repository<User>, apiKeyRepository: Repository<ApiKey>, mcpClientRepository: Repository<MCPClient>, jwtService: JwtService, configService: ConfigService);
    onModuleInit(): Promise<void>;
    private checkDatabaseConnection;
    validateUser(username: string, password: string, clientIP?: string): Promise<User | null>;
    login(username: string, password: string, clientIP?: string): Promise<{
        access_token: string;
        token_type: string;
        expires_in: string;
        user: {
            id: string;
            username: string;
            email: string;
            role: UserRole;
        };
    }>;
    validateJWT(payload: any): Promise<User | null>;
    generateApiKey(userId: string, name: string, permissions?: string[], expiresInDays?: number): Promise<{
        key: string;
        apiKey: ApiKey;
    }>;
    validateApiKey(key: string, clientIP?: string): Promise<{
        user: User;
        apiKey: ApiKey;
    } | null>;
    createMCPClient(name: string, permissions?: string[], allowedIPs?: string[]): Promise<MCPClient>;
    validateMCPClient(clientId: string, clientSecret: string, clientIP?: string): Promise<MCPClient | null>;
    hasPermission(permissions: string[], requiredPermission: string): boolean;
    getUserApiKeys(userId: string): Promise<Omit<ApiKey, 'keyHash'>[]>;
    revokeApiKey(apiKeyId: string, userId: string): Promise<boolean>;
    getMCPClients(): Promise<Omit<MCPClient, 'clientSecret'>[]>;
    revokeMCPClient(clientId: string): Promise<boolean>;
    createUser(username: string, email: string, password: string, role?: UserRole): Promise<User>;
    getAuthStats(): Promise<{
        users: {
            total: number;
            active: number;
            byRole: {
                admin: number;
                user: number;
                'mcp-client': number;
            };
        };
        apiKeys: {
            total: number;
            active: number;
            expired: number;
        };
        mcpClients: {
            total: number;
            active: number;
        };
    }>;
    findUserById(id: string): Promise<User | null>;
    updatePassword(userId: string, newPassword: string): Promise<boolean>;
}
