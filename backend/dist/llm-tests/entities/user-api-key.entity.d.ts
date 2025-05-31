export declare class UserApiKey {
    id: string;
    userId: string;
    provider: string;
    encryptedApiKey: string;
    isActive: boolean;
    metadata: {
        lastValidated?: Date;
        modelsAccess?: string[];
        monthlyUsage?: number;
        validationStatus?: 'valid' | 'invalid' | 'pending';
    };
    createdAt: Date;
    updatedAt: Date;
}
