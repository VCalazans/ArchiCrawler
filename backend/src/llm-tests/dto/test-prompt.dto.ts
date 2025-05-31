import { IsString, IsOptional, IsArray } from 'class-validator';

export class TestPromptDto {
  @IsString({ message: 'Prompt do sistema deve ser uma string' })
  system: string;

  @IsString({ message: 'Prompt do usuário deve ser uma string' })
  user: string;

  @IsOptional()
  @IsArray({ message: 'Exemplos devem ser um array' })
  examples?: any[];

  @IsOptional()
  @IsString({ message: 'Contexto deve ser uma string' })
  context?: string;
}

export class PromptTemplateDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  testType: string;

  @IsString()
  systemPrompt: string;

  @IsString()
  userPromptTemplate: string;

  @IsOptional()
  @IsArray()
  examples?: any[];
} 