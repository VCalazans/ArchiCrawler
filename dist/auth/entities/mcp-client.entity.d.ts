export declare class MCPClient {
    id: string;
    name: string;
    clientId: string;
    clientSecret: string;
    permissions: string[];
    isActive: boolean;
    allowedIPs: string[];
    lastUsed: Date;
    lastUsedIP: string;
    createdAt: Date;
    updatedAt: Date;
}
