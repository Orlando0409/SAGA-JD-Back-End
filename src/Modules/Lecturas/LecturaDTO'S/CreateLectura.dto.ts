import { ApiProperty } from "@nestjs/swagger";
import { IsDecimal, IsDefined, IsInt, Max, Min } from "class-validator";

export class CreateLecturaDTO {
    @ApiProperty({ example: 12345 })
    @IsInt({ message: 'El número de medidor debe ser un número entero' })
    @Min(100, { message: 'El número de medidor debe ser mayor o igual a 100' })
    @Max(99999, { message: 'El número de medidor debe ser menor o igual a 99,999' })
    @IsDefined({ message: 'El número de medidor no puede estar vacío' })
    Numero_Medidor: number;

    @ApiProperty({ example: 100 })
    @Min(1, { message: 'El valor debe ser mayor o igual a 1' })
    @Max(100000, { message: 'El valor debe ser menor o igual a 100,000' })
    @IsDefined({ message: 'El valor no puede estar vacío' })
    Valor_Lectura: number;
}