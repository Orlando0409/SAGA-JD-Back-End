import { IsNotEmpty, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateFAQDto {
  @IsNotEmpty({ message: 'La pregunta es obligatoria.' })
  @IsString({ message: 'La pregunta debe ser una cadena de texto.' })
  @MinLength(10, { message: 'La pregunta debe tener al menos 10 caracteres.' })
  @MaxLength(100, { message: 'La pregunta no puede superar los 100 caracteres.' })
  @Matches(/^(?!\s*$).+/, { message: 'La pregunta no puede estar vacía o solo contener espacios.' })
  Pregunta: string;

  @IsNotEmpty({ message: 'La respuesta es obligatoria.' })
  @IsString({ message: 'La respuesta debe ser una cadena de texto.' })
  @MinLength(10, { message: 'La respuesta debe tener al menos 10 caracteres.' })
  @MaxLength(200, { message: 'La respuesta no puede superar los 200 caracteres.' })
  @Matches(/^(?!\s*$).+/, { message: 'La respuesta no puede estar vacía o solo contener espacios.' })
  Respuesta: string;
}
