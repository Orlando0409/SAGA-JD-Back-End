import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFAQDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  Pregunta?: string;

  @IsOptional()
  @IsString()
  Respuesta?: string;
}
