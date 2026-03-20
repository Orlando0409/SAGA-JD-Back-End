import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt, Max, Min } from "class-validator";

export class CreateLecturaDTO {
    @ApiProperty({ example: 'Residencial' })
    @IsInt({ message: 'El tipo de tarifa debe ser un número entero' })
    @IsDefined({ message: 'El tipo de tarifa no puede estar vacío' })
    Id_Tipo_Tarifa: number;

    @ApiProperty({ example: 123456 })
    @IsInt({ message: 'El número de medidor debe ser un número entero' })
    @Min(1, { message: 'El número de medidor debe ser mayor o igual a 1' })
    @Max(99999999, { message: 'El número de medidor debe ser menor o igual a 99999999' })
    @IsDefined({ message: 'El número de medidor no puede estar vacío' })
    Numero_Medidor: number;

    @ApiProperty({ example: 10 })
    @Min(1, { message: 'El valor debe ser mayor o igual a 1' })
    @Max(100000, { message: 'El valor debe ser menor o igual a 100000' })
    @IsDefined({ message: 'El valor no puede estar vacío' })
    Valor_Lectura: number;
}