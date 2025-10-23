import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ResponderReporteDto {
  @IsNotEmpty({ message: 'La respuesta es requerida' })
  @IsString({ message: 'La respuesta debe ser un texto' })
  @MaxLength(150, { message: 'La respuesta no puede exceder los 150 caracteres' })
  Respuesta: string;
}
