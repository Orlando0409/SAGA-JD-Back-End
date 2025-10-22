import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFAQDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  Pregunta: string;

  @IsNotEmpty()
  @IsString()
  Respuesta: string;
}
