import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class MovimientoMaterialDto {
    @ApiProperty({ example: 1 })
    @IsDefined({ message: 'El ID del material no puede estar vacío' })
    @IsInt({ message: 'El ID del material debe ser un número entero' })
    Id_Material: number;

    @ApiProperty({ example: 10 })
    @IsDefined({ message: 'La cantidad no puede estar vacio' })
    @IsInt({ message: 'La cantidad debe ser un número entero' })
    @Min(1, { message: 'La cantidad debe ser al menos 1' })
    @Max(100000, { message: 'La cantidad no puede exceder 100,000' })
    Cantidad: number;

    @ApiProperty({ example: 'Ingreso por compra', required: false })
    @IsString({ message: 'Las observaciones deben ser texto' })
    @IsOptional()
    Observaciones?: string;
}