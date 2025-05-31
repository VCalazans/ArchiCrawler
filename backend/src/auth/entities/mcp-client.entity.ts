import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('mcp_clients')
export class MCPClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  clientId: string;

  @Column({ length: 255 })
  clientSecret: string;

  @Column('text', { array: true, default: [] })
  permissions: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column('text', { array: true, default: [] })
  allowedIPs: string[];

  @Column({ nullable: true })
  lastUsed: Date;

  @Column({ nullable: true, length: 45 })
  lastUsedIP: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 