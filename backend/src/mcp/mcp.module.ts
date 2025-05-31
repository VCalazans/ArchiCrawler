import { Module } from '@nestjs/common';
import { MCPManagerService } from './mcp-manager.service';
import { MCPController } from './mcp.controller';
import { PlaywrightMCPService } from './services/playwright-mcp.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [
    MCPManagerService,
    PlaywrightMCPService,
  ],
  controllers: [MCPController],
  exports: [
    MCPManagerService,
    PlaywrightMCPService,
  ],
})
export class MCPModule {} 