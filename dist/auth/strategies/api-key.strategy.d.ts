import { Strategy } from 'passport-custom';
import { AuthService } from '../auth.service';
import { Request } from 'express';
declare const ApiKeyStrategy_base: new (...args: any[]) => Strategy;
export declare class ApiKeyStrategy extends ApiKeyStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(req: Request): Promise<import("../entities/user.entity").User>;
    private extractApiKey;
    private getClientIP;
}
export {};
