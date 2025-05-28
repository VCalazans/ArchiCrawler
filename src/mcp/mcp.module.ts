import { Module } from '@nestjs/common';
import { MCPManagerService } from './mcp-manager.service';
import { MCPController } from './mcp.controller';

@Module({
  providers: [MCPManagerService],
  controllers: [MCPController],
  exports: [MCPManagerService],
})
export class MCPModule {} 