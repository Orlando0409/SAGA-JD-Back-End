import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDefined, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUnidadMedicionDto {
    @ApiProperty({ example: 'Kilogramo' })
    @Transform(({ value }) => value?.trim().toUpperCase())
    @IsString({ message: 'El nombre de la unidad debe ser un string' })
    @IsDefined({ message: 'El nombre de la unidad no puede estar vacío' })
    @IsNotEmpty({ message: 'El nombre de la unidad no puede estar vacío' })
    @MinLength(2, { message: 'El nombre de la unidad debe tener al menos 2 caracteres' })
    @MaxLength(30, { message: 'El nombre de la unidad no puede tener más de 30 caracteres' })
    @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El nombre de la unidad solo puede contener letras, números y espacios' })
    Nombre_Unidad_Medicion: string;

    @ApiProperty({ example: 'KG' })
    @Transform(({ value }) => value?.trim().toUpperCase())
    @IsString({ message: 'La abreviatura debe ser un string' })
    @IsDefined({ message: 'La abreviatura no puede estar vacía' })
    @IsNotEmpty({ message: 'La abreviatura no puede estar vacía' })
    @MinLength(1, { message: 'La abreviatura debe tener al menos 1 carácter' })
    @MaxLength(10, { message: 'La abreviatura no puede tener más de 10 caracteres' })
    @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+$/, { message: 'La abreviatura solo puede contener letras y números sin espacios' })
    Abreviatura: string;

    @ApiProperty({ example: 'Unidad de medida para peso en kilogramos' })
    @IsOptional()
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'La descripción debe ser un string' })
    @MaxLength(100, { message: 'La descripción no puede tener más de 100 caracteres' })
    @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,!?¿¡()-]*$/, { message: 'La descripción solo puede contener letras, números, espacios y los caracteres .,!?¿¡()-' })
    Descripcion?: string;
}