import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TestFlow } from './test-flow.entity';
import { User } from '../auth/entities/user.entity';

export enum TestExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface ExecutionStep {
  stepId: string;
  status: TestExecutionStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
  result?: any;
  screenshot?: string;
}

@Entity('test_executions')
export class TestExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'test_flow_id' })
  testFlowId: string;

  @ManyToOne(() => TestFlow)
  @JoinColumn({ name: 'test_flow_id' })
  testFlow: TestFlow;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: TestExecutionStatus,
    default: TestExecutionStatus.PENDING
  })
  status: TestExecutionStatus;

  @Column({ name: 'start_time', type: 'timestamp', nullable: true })
  startTime?: Date;

  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime?: Date;

  @Column({ type: 'int', nullable: true })
  duration?: number;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column({ type: 'json', nullable: true })
  result?: any;

  @Column({ type: 'json', nullable: true })
  steps?: ExecutionStep[];

  @Column({ name: 'total_steps', type: 'int', default: 0 })
  totalSteps: number;

  @Column({ name: 'completed_steps', type: 'int', default: 0 })
  completedSteps: number;

  @Column({ name: 'failed_steps', type: 'int', default: 0 })
  failedSteps: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 