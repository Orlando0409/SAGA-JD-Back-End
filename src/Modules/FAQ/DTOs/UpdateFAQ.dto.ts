import { IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';

export class UpdateFAQDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  Pregunta?: string;

  @IsOptional()
  @IsString()
  Respuesta?: string;

  @IsOptional()
  @IsBoolean()
  Visible?: boolean;
}
