import { IsDefined, IsInt } from 'class-validator';

export class UpdateSugerenciaEstadoDto {
  @IsDefined({ message: 'Id_EstadoSugerencia es requerido' })
  @IsInt({ message: 'Id_EstadoSugerencia debe ser un número entero' })
  Id_EstadoSugerencia: number;
}
