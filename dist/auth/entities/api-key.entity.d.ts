import { User } from './user.entity';
export declare class ApiKey {
    id: string;
    name: string;
    keyHash: string;
    userId: string;
    permissions: string[];
    isActive: boolean;
    expiresAt: Date;
    lastUsed: Date;
    lastUsedIP: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
