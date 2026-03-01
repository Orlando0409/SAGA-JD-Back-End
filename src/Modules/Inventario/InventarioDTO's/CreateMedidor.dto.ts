import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt, Max, Min } from "class-validator";

export class CreateMedidorDTO {
    @ApiProperty({ example: 123456789 })
    @IsDefined({ message: 'El número del medidor no puede estar vacío' })
    Numero_Medidor: number;
}