import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt } from "class-validator";

export class AsignarMedidorExistenteAfiliadoDto {
    @ApiProperty({ example: 5, description: 'ID del afiliado al que se le asignara el medidor' })
    @IsDefined({ message: 'El ID del afiliado no puede estar vacio' })
    @IsInt({ message: 'El ID del afiliado debe ser un numero entero' })
    Id_Afiliado: number;

    @ApiProperty({ example: 12, description: 'ID del medidor disponible a asignar' })
    @IsDefined({ message: 'El ID del medidor no puede estar vacio' })
    @IsInt({ message: 'El ID del medidor debe ser un numero entero' })
    Id_Medidor: number;
}
