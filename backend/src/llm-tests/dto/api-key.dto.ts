import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class StoreApiKeyDto {
  @IsString({ message: 'Provedor deve ser uma string' })
  @IsEnum(['openai', 'anthropic', 'gemini'], {
    message: 'Provedor deve ser: openai, anthropic ou gemini'
  })
  provider: string;

  @IsString({ message: 'Chave API deve ser uma string' })
  @IsNotEmpty({ message: 'Chave API é obrigatória' })
  apiKey: string;
}

export class ValidateApiKeyDto {
  @IsString({ message: 'Provedor deve ser uma string' })
  @IsEnum(['openai', 'anthropic', 'gemini'], {
    message: 'Provedor deve ser: openai, anthropic ou gemini'
  })
  provider: string;
}

export class DeleteApiKeyDto {
  @IsString({ message: 'Provedor deve ser uma string' })
  @IsEnum(['openai', 'anthropic', 'gemini'], {
    message: 'Provedor deve ser: openai, anthropic ou gemini'
  })
  provider: string;
} 