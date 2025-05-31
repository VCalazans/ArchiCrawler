import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('llm_provider_configs')
export class LLMProviderConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  provider: string; // 'openai', 'anthropic', 'gemini'

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json' })
  supportedModels: string[];

  @Column({ type: 'json', nullable: true })
  defaultSettings: {
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
  };

  @Column({ type: 'json', nullable: true })
  pricing: {
    inputTokenCost?: number;
    outputTokenCost?: number;
    currency?: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  apiVersion: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 