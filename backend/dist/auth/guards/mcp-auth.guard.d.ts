import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../auth.service';
export declare class MCPAuthGuard implements CanActivate {
    private authService;
    private readonly logger;
    constructor(authService: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractClientId;
    private extractClientSecret;
    private getClientIP;
}
