import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt, Max, Min } from "class-validator";

export class UpdateBloqueDTO {
    @ApiProperty({ example: 1 })
    @IsDefined({ message: 'El ID del tipo de tarifa no puede estar vacío' })
    @IsInt({ message: 'El ID del tipo de tarifa debe ser un número entero' })
    Id_Tipo_Tarifa: number;

    @ApiProperty({ example: 1 })
    @IsDefined({ message: 'El rango mínimo no puede estar vacío' })
    @IsInt({ message: 'El rango mínimo debe ser un número entero' })
    @Min(1, { message: 'El rango mínimo no puede ser negativo' })
    Rango_Minimo: number;

    @ApiProperty({ example: 10 })
    @IsDefined({ message: 'El rango máximo no puede estar vacío' })
    @IsInt({ message: 'El rango máximo debe ser un número entero' })
    @Min(2, { message: 'El rango máximo no puede ser negativo ni menor que 2' })
    @Max(1000000, { message: 'El rango máximo es demasiado grande' })
    Rango_Maximo: number;
}