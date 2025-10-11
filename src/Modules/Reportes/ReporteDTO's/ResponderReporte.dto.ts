import { IsDefined, IsString } from 'class-validator';

export class ResponderReporteDto {
  @IsDefined({ message: 'La respuesta es requerida' })
  @IsString({ message: 'La respuesta debe ser un string' })
  Respuesta: string;
}