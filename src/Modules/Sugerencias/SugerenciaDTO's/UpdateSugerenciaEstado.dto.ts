import { IsDefined, IsInt } from 'class-validator';

export class UpdateSugerenciaEstadoDto {
  @IsDefined({ message: 'Id_Estado_Sugerencia es requerido' })
  @IsInt({ message: 'Id_Estado_Sugerencia debe ser un número entero' })
  Id_Estado_Sugerencia: number;
}
