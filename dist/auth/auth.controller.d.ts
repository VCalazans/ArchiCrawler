import { AuthService } from './auth.service';
import { LoginDto, CreateUserDto, CreateApiKeyDto, CreateMCPClientDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, clientIP: string): Promise<{
        access_token: string;
        token_type: string;
        expires_in: string;
        user: {
            id: string;
            username: string;
            email: string;
            role: import("./entities/user.entity").UserRole;
        };
    }>;
    register(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        message: string;
        user: {
            id: string;
            username: string;
            email: string;
            role: import("./entities/user.entity").UserRole;
        };
    }>;
    getProfile(req: any): Promise<{
        success: boolean;
        user: any;
    }>;
    createApiKey(req: any, createApiKeyDto: CreateApiKeyDto): Promise<{
        success: boolean;
        message: string;
        apiKey: {
            id: string;
            name: string;
            key: string;
            permissions: string[];
            expiresAt: Date;
        };
        warning: string;
    }>;
    listApiKeys(req: any): Promise<{
        success: boolean;
        apiKeys: Omit<import("./entities/api-key.entity").ApiKey, "keyHash">[];
    }>;
    revokeApiKey(req: any, apiKeyId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    createMCPClient(createMCPClientDto: CreateMCPClientDto): Promise<{
        success: boolean;
        message: string;
        client: {
            id: string;
            name: string;
            clientId: string;
            clientSecret: string;
            permissions: string[];
            allowedIPs: string[];
        };
        warning: string;
    }>;
    listMCPClients(): Promise<{
        success: boolean;
        clients: Omit<import("./entities/mcp-client.entity").MCPClient, "clientSecret">[];
    }>;
    revokeMCPClient(clientId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    testApiKey(req: any): Promise<{
        success: boolean;
        message: string;
        user: any;
        apiKey: {
            id: any;
            name: any;
            permissions: any;
            lastUsed: any;
        };
    }>;
    testMCP(req: any): Promise<{
        success: boolean;
        message: string;
        client: {
            id: any;
            name: any;
            clientId: any;
            permissions: any;
            allowedIPs: any;
        };
    }>;
    getStats(): Promise<{
        success: boolean;
        stats: {
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
        };
    }>;
    checkPermission(req: any, permission: string): Promise<{
        success: boolean;
        message: string;
        permission?: undefined;
        hasPermission?: undefined;
        userPermissions?: undefined;
    } | {
        success: boolean;
        permission: string;
        hasPermission: boolean;
        userPermissions: any;
        message?: undefined;
    }>;
}
