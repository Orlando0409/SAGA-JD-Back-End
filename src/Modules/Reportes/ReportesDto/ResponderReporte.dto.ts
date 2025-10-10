import { IsDefined, IsString } from 'class-validator';

export class ResponderReporteDto {
  @IsDefined()
  @IsString()
  Respuesta: string;
}
