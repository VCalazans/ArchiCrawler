import { IsString, IsEmail, IsOptional, IsArray, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Nome de usuário' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'admin123', description: 'Senha do usuário' })
  @IsString()
  password: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'newuser', description: 'Nome de usuário único' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Senha do usuário' })
  @IsString()
  password: string;

  @ApiProperty({ 
    example: 'user', 
    description: 'Papel do usuário',
    enum: UserRole,
    required: false 
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class CreateApiKeyDto {
  @ApiProperty({ example: 'My API Key', description: 'Nome da API Key' })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: ['scraper:read', 'mcp:execute'], 
    description: 'Lista de permissões',
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiProperty({ 
    example: 30, 
    description: 'Dias até expiração (opcional)',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  expiresInDays?: number;
}

export class CreateMCPClientDto {
  @ApiProperty({ example: 'My MCP Client', description: 'Nome do cliente MCP' })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: ['mcp:*', 'playwright:*'], 
    description: 'Lista de permissões',
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiProperty({ 
    example: ['127.0.0.1', '192.168.1.0/24'], 
    description: 'IPs autorizados',
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedIPs?: string[];
} 