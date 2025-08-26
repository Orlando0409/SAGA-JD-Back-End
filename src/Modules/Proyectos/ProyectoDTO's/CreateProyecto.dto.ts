import { IsString, IsDate, IsInt, IsUrl, IsDefined, IsOptional, IsNotEmpty, MinLength, MaxLength, Matches, IsPositive, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProyectoDto {
    @ApiProperty({ example: 'Ejemplo '})
    @IsString({ message: 'El titulo debe ser un string' })
    @IsDefined({ message: 'El titulo no puede estar vacio' })
    @Transform(({ value }) => value?.trim())
    @IsNotEmpty({ message: 'El título no puede estar vacío' })
    @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
    @MaxLength(100, { message: 'El título no puede tener más de 100 caracteres' })
    @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s!?¿¡().,-]+$/, { message: 'El título solo puede contener letras, números, espacios y los caracteres !?¿¡().,-' })
    Titulo: string;

    @ApiProperty({ example: 'Ejemplo descripcion' })
    @IsString( {message: 'La descripcion debe ser un string' })
    @IsDefined({ message: 'La descripcion no puede estar vacia' })
    @Transform(({ value }) => value?.trim())
    @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
    @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
    @MaxLength(1000, { message: 'La descripción no puede tener más de 1000 caracteres' })
    @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s!?¿¡().,:;-]+$/, { message: 'La descripción solo puede contener letras, números, espacios y los caracteres !?¿¡().,:;-' })
    Descripcion: string;

    @ApiProperty({ example: 1 })
    @IsInt({ message: 'El ID del usuario debe ser un numero entero' })
    @IsDefined({ message: 'El ID del usuario no puede estar vacio' })
    @IsNotEmpty({ message: 'El ID del usuario no puede estar vacío' })
    @IsPositive({ message: 'El ID del usuario debe ser un número positivo' })
    @Min(1, { message: 'El ID del usuario debe ser mayor a 0' })
    @Max(999999, { message: 'El ID del usuario no puede ser mayor a 999,999' })
    Id_Usuario: number;

    @ApiProperty({ example: 'https://imagen.jpg' })
    @IsString({ message: 'La URL de la imagen debe ser un string' })
    @IsDefined({ message: 'La URL de la imagen no puede estar vacia' })
    @Transform(({ value }) => value?.trim())
    @IsNotEmpty({ message: 'La URL de la imagen no puede estar vacía' })
    @MaxLength(500, { message: 'La URL de la imagen no puede tener más de 500 caracteres' })
    @Matches(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i, { message: 'La URL debe apuntar a una imagen válida (JPG, JPEG, PNG, GIF, WEBP, SVG, BMP)' })
    @IsUrl()
    Imagen_Url: string;
}