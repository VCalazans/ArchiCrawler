import { ApiKey } from './api-key.entity';
export declare enum UserRole {
    ADMIN = "admin",
    USER = "user",
    MCP_CLIENT = "mcp-client"
}
export declare class User {
    id: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    lastLogin: Date;
    lastLoginIP: string;
    createdAt: Date;
    updatedAt: Date;
    apiKeys: ApiKey[];
}
