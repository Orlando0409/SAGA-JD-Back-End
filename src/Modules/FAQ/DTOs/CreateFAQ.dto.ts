import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFAQDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  Pregunta: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  Respuesta: string;
}
