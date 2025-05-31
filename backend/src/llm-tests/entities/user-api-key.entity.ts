import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_api_keys')
export class UserApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  provider: string; // 'openai', 'anthropic', 'gemini'

  @Column({ type: 'text' })
  encryptedApiKey: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: {
    lastValidated?: Date;
    modelsAccess?: string[];
    monthlyUsage?: number;
    validationStatus?: 'valid' | 'invalid' | 'pending';
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 