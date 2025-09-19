import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateEstadoProveedorDto {

  @ApiProperty({ example: 1})
  @IsNumber({}, { message: "El estado debe ser un numero" })
  @IsNotEmpty({ message: "El estado no puede estar vacio" })
  Id_EstadoProveedor: number;
}
