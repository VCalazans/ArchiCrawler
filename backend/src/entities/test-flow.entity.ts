import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/entities/user.entity';

export enum TestFlowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived'
}

export interface TestStep {
  id: string;
  type: 'navigate' | 'click' | 'fill' | 'screenshot' | 'assert' | 'extract' | 'wait';
  name: string;
  description?: string;
  config: Record<string, any>;
  timeout?: number;
  retries?: number;
  continueOnError?: boolean;
}

@Entity('test_flows')
export class TestFlow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'json' })
  steps: TestStep[];

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: TestFlowStatus,
    default: TestFlowStatus.DRAFT
  })
  status: TestFlowStatus;

  @Column({ name: 'last_run', type: 'timestamp', nullable: true })
  lastRun?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 