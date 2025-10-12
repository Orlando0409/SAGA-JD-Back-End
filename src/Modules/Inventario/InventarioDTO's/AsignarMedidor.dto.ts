import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt } from "class-validator";

export class AsignarMedidorDTO {
    @ApiProperty({ example: 1 })
    @IsDefined({ message: 'El ID del medidor no puede estar vacio' })
    @IsInt({ message: 'El ID del medidor debe ser un número entero' })
    Id_Medidor: number;

    @ApiProperty({ example: 1 })
    @IsDefined({ message: 'El ID del tipo de afiliado no puede estar vacio' })
    @IsInt({ message: 'El ID del tipo de afiliado debe ser un número entero' })
    Id_Tipo_Afiliado: number;

    @ApiProperty({ example: 1 })
    @IsDefined({ message: 'El ID del afiliado no puede estar vacio' })
    @IsInt({ message: 'El ID del afiliado debe ser un número entero' })
    Id_Afiliado: number;
}