import { IsDefined, IsInt } from 'class-validator';

export class UpdateQuejaEstadoDto {
  @IsDefined({ message: 'Id_Estado_Queja es requerido' })
  @IsInt({ message: 'Id_Estado_Queja debe ser un número entero' })
  Id_Estado_Queja: number;
}
