import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { MCPCommandResult } from '../interfaces/mcp-command.interface';

@Entity('test_execution_results')
@Index(['testId', 'userId'])
@Index(['userId', 'startedAt'])
export class TestExecutionResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'test_id' })
  @Index()
  testId: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt?: Date;

  @Column()
  duration: number;

  @Column()
  success: boolean;

  @Column({ length: 50, default: 'running' })
  status: 'running' | 'completed' | 'failed' | 'stopped';

  @Column('json', { nullable: true })
  logs: string[];

  @Column('json', { nullable: true })
  screenshots: string[];

  @Column('json', { nullable: true })
  errors: string[];

  @Column('json', { name: 'mcp_command_results', nullable: true })
  mcpCommandResults: MCPCommandResult[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 