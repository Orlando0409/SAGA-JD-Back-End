import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsDefined, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from "class-validator";

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
        description: 'Array de IDs de categorías para el material',
        type: [Number],
        required: false 
    })
    @IsOptional()
    @IsArray({ message: 'Las categorías deben ser un array [ID]' })
    @IsInt({ each: true, message: 'Cada categoría debe ser un número entero' })
    IDS_Categorias?: number[];
}