import { Module } from '@nestjs/common';
import { MCPManagerService } from './mcp-manager.service';
import { MCPController } from './mcp.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [MCPManagerService],
  controllers: [MCPController],
  exports: [MCPManagerService],
})
export class MCPModule {} 