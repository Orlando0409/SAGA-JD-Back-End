import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsDefined, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateMaterialDto {
    @ApiProperty({ example: 'Cemento' })
    @IsString({ message: 'El nombre del material debe ser un string' })
    @IsDefined({ message: 'El nombre del material no puede estar vacio' })
    @Transform(({ value }) => value?.trim().toUpperCase())
    @IsNotEmpty({ message: 'El nombre del material no puede estar vacío' })
    @MinLength(2, { message: 'El nombre del material debe tener al menos 2 caracteres' })
    @MaxLength(50, { message: 'El nombre del material no puede tener más de 50 caracteres' })
    @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s!?¿¡().,-]+$/, { message: 'El nombre del material solo puede contener letras, números, espacios y los caracteres !?¿¡().,-' })
    Nombre_Material: string;

    @ApiProperty({ example: 'Cemento para construcción' })
    @Transform(({ value }) => value?.trim())
    @MaxLength(200, { message: 'La descripción no puede tener más de 200 caracteres' })
    @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s!?¿¡().,-]*$/, { message: 'La descripción solo puede contener letras, números, espacios y los caracteres !?¿¡().,-' })
    @IsOptional()
    Descripcion?: string;

    @ApiProperty({ example: 1 })
    @IsDefined({ message: 'La unidad de medición no puede estar vacio' })
    @IsInt({ message: 'La unidad de medición debe ser un número entero' })
    Id_Unidad_Medicion: number;

    @ApiProperty({ example: 100 })
    @IsDefined({ message: 'La cantidad no puede estar vacio' })
    @Min(1, { message: 'La cantidad debe ser al menos 1' })
    @Max(100000, { message: 'La cantidad no puede ser mayor a 100,000' })
    Cantidad: number;

    @ApiProperty({ example: 750 })
    @IsDefined({ message: 'El precio unitario no puede estar vacio' })
    @Min(5, { message: 'El precio unitario debe ser al menos 5' })
    @Max(10000000, { message: 'El precio unitario no puede ser mayor a 10,000,000' })
    Precio_Unitario: number;

    @ApiProperty({ example: [1, 2, 3] })
    @IsOptional()
    @IsArray({ message: 'Las categorías deben ser un array [ID]' })
    @IsInt({ each: true, message: 'Cada categoría debe ser un número entero' })
    IDS_Categorias?: number[];
}