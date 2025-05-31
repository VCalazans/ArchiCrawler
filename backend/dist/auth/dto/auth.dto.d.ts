import { UserRole } from '../entities/user.entity';
export declare class LoginDto {
    username: string;
    password: string;
}
export declare class CreateUserDto {
    username: string;
    email: string;
    password: string;
    role?: UserRole;
}
export declare class CreateApiKeyDto {
    name: string;
    permissions?: string[];
    expiresInDays?: number;
}
export declare class CreateMCPClientDto {
    name: string;
    permissions?: string[];
    allowedIPs?: string[];
}
