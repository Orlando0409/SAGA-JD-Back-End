import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt } from "class-validator";

export class AsignarMedidorExistenteAAfiliado {
    @ApiProperty({ example: 1, description: 'ID del medidor disponible a asignar' })
    @IsDefined({ message: 'El ID del medidor no puede estar vacío' })
    @IsInt({ message: 'El ID del medidor debe ser un número entero' })
    Id_Medidor: number;

    @ApiProperty({ example: 5, description: 'ID del afiliado (físico o jurídico) al que se le asignará el medidor' })
    @IsDefined({ message: 'El ID del afiliado no puede estar vacío' })
    @IsInt({ message: 'El ID del afiliado debe ser un número entero' })
    Id_Afiliado: number;
}
