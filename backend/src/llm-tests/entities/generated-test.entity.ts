import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('generated_tests')
export class GeneratedTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  targetUrl: string;

  @Column()
  testType: string;

  @Column()
  llmProvider: string;

  @Column()
  model: string;

  @Column({ type: 'json' })
  originalPrompt: any;

  @Column({ type: 'json' })
  generatedCode: any;

  @Column({ type: 'json' })
  mcpCommands: any;

  @Column({ type: 'json', nullable: true })
  validationResult: any;

  @Column({ default: 'draft' })
  status: 'draft' | 'validated' | 'active' | 'failed' | 'archived';

  @Column({ type: 'json', nullable: true })
  executionHistory: any;

  @Column({ type: 'json', nullable: true })
  metadata: {
    tokensUsed?: number;
    confidence?: number;
    estimatedDuration?: string;
    tags?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 