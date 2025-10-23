import { IsDefined, IsInt, IsIn } from 'class-validator';

export class UpdateReporteEstadoDto {
  @IsDefined()
  @IsInt()
  @IsIn([1, 2, 3,4])
  IdEstadoReporte: number;
}