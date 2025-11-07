import { IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFAQDto {
  @IsOptional()
  @IsString({ message: 'La pregunta debe ser una cadena de texto.' })
  @MinLength(10, { message: 'La pregunta debe tener al menos 10 caracteres.' })
  @MaxLength(100, { message: 'La pregunta no puede superar los 100 caracteres.' })
  @Matches(/^(?!\s*$).+/, { message: 'La pregunta no puede estar vacía o solo contener espacios.' })
  @ApiPropertyOptional({ example: '¿Modifica la pregunta?' })
  Pregunta?: string;

  @IsOptional()
  @IsString({ message: 'La respuesta debe ser una cadena de texto.' })
  @MinLength(10, { message: 'La respuesta debe tener al menos 10 caracteres.' })
  @MaxLength(700, { message: 'La respuesta no puede superar los 700 caracteres.' })
  @Matches(/^(?!\s*$).+/, { message: 'La respuesta no puede estar vacía o solo contener espacios.' })
  @ApiPropertyOptional({ example: 'Modifica la Respuesta' })
  Respuesta?: string;
}
