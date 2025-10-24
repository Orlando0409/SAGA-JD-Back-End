import { IsDefined, IsInt, IsIn } from 'class-validator';

export class UpdateReporteEstadoDto {
  @IsDefined()
  @IsInt()
  @IsIn([1, 2])
  IdEstadoReporte: number;
}
