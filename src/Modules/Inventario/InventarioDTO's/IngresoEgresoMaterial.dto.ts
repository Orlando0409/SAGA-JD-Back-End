import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt, Max, Min } from "class-validator";

export class IngresoEgresoMaterialDto {
    @ApiProperty({ example: 10 })
    @IsDefined({ message: 'La cantidad no puede estar vacio' })
    @IsInt({ message: 'La cantidad debe ser un número entero' })
    @Min(1, { message: 'La cantidad debe ser al menos 1' })
    @Max(100000, { message: 'La cantidad no puede exceder 100,000' })
    Cantidad: number;
}