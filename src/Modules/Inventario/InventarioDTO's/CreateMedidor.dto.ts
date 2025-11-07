import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt, Min } from "class-validator";

export class CreateMedidorDTO {
    @ApiProperty({ example: 123456789 })
    @IsDefined({ message: 'El número del medidor no puede estar vacío' })
    @IsInt({ message: 'El número del medidor debe ser un número entero' })
    @Min(100, { message: 'El número del medidor debe ser mayor o igual a 100' })
    Numero_Medidor: number;
}