import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDefined, IsNotEmpty, IsString, Matches, MaxLength, Min, MinLength, IsArray, ArrayNotEmpty, IsNumber } from "class-validator";

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
    Descripcion?: string;

    @ApiProperty({ example: 100 })
    @IsDefined({ message: 'La cantidad no puede estar vacio' })
    @Min(1, { message: 'La cantidad debe ser al menos 1' })
    Cantidad: number;

    @ApiProperty({ example: 750 })
    @IsDefined({ message: 'El precio unitario no puede estar vacio' })
    @Min(0.10, { message: 'El precio unitario debe ser al menos 0.10' })
    Precio_Unitario: number;

    @ApiProperty({ 
        example: [1, 2, 3], 
        type: [Number],
        description: 'Array de IDs de categorías para asignar al material'
    })
    @IsArray({ message: 'Las categorías deben ser un array' })
    @ArrayNotEmpty({ message: 'Debe seleccionar al menos una categoría' })
    @IsNumber({}, { each: true, message: 'Cada ID de categoría debe ser un número' })
    @IsDefined({ message: 'Las categorías son obligatorias' })
    IDS_Categorias: number[];
}