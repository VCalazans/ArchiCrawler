import { IsString, IsEnum, IsOptional, IsUrl, IsNotEmpty } from 'class-validator';

export class GenerateTestDto {
  @IsUrl({}, { message: 'URL de destino deve ser válida' })
  @IsNotEmpty({ message: 'URL de destino é obrigatória' })
  targetUrl: string;

  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição do teste é obrigatória' })
  testDescription: string;

  @IsEnum(['e2e', 'visual', 'performance', 'accessibility'], {
    message: 'Tipo de teste deve ser: e2e, visual, performance ou accessibility'
  })
  testType: 'e2e' | 'visual' | 'performance' | 'accessibility';

  @IsString({ message: 'Provedor LLM deve ser uma string' })
  @IsNotEmpty({ message: 'Provedor LLM é obrigatório' })
  llmProvider: string;

  @IsOptional()
  @IsString({ message: 'Modelo deve ser uma string' })
  model?: string;

  @IsOptional()
  @IsString({ message: 'Contexto adicional deve ser uma string' })
  additionalContext?: string;
}

export class UpdateTestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['draft', 'validated', 'active', 'failed', 'archived'])
  status?: 'draft' | 'validated' | 'active' | 'failed' | 'archived';
} 