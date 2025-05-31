import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { UserApiKey } from '../entities/user-api-key.entity';

@Injectable()
export class ApiKeyManagerService {
  private readonly logger = new Logger(ApiKeyManagerService.name);
  private readonly encryptionKey: string;

  constructor(
    @InjectRepository(UserApiKey)
    private userApiKeyRepository: Repository<UserApiKey>,
    private configService: ConfigService,
  ) {
    this.encryptionKey = this.configService.get<string>('API_KEY_ENCRYPTION_SECRET') || 'default-key-change-me';
  }

  encrypt(text: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async storeApiKey(userId: string, provider: string, apiKey: string): Promise<void> {
    const encryptedKey = this.encrypt(apiKey);
    
    const existingKey = await this.userApiKeyRepository.findOne({
      where: { userId, provider }
    });

    if (existingKey) {
      existingKey.encryptedApiKey = encryptedKey;
      await this.userApiKeyRepository.save(existingKey);
    } else {
      const newApiKey = this.userApiKeyRepository.create({
        userId,
        provider,
        encryptedApiKey: encryptedKey,
        isActive: true
      });
      await this.userApiKeyRepository.save(newApiKey);
    }
  }

  async getDecryptedApiKey(userId: string, provider: string): Promise<string | null> {
    const apiKeyRecord = await this.userApiKeyRepository.findOne({
      where: { userId, provider, isActive: true }
    });

    if (!apiKeyRecord) {
      return null;
    }

    return this.decrypt(apiKeyRecord.encryptedApiKey);
  }

  async deleteApiKey(userId: string, provider: string): Promise<void> {
    await this.userApiKeyRepository.delete({ userId, provider });
  }

  async listUserProviders(userId: string): Promise<string[]> {
    const apiKeys = await this.userApiKeyRepository.find({
      where: { userId, isActive: true }
    });
    return apiKeys.map(key => key.provider);
  }

  async validateApiKey(userId: string, provider: string): Promise<boolean> {
    try {
      const apiKey = await this.getDecryptedApiKey(userId, provider);
      if (!apiKey) {
        return false;
      }

      // Aqui você pode adicionar validação com o provider real
      // Por enquanto, apenas verifica se a chave existe
      return true;
    } catch (error) {
      this.logger.error(`Erro ao validar chave API: ${error.message}`);
      return false;
    }
  }
} 