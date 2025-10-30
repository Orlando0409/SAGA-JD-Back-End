import { IsString, IsDefined, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProyectoDto {
    @ApiProperty({ example: 'Ejemplo '})
    @IsString({ message: 'El titulo debe ser un string' })
    @IsDefined({ message: 'El titulo no puede estar vacio' })
    @Transform(({ value }) => value?.trim() ? value.trim()[0].toUpperCase() + value.trim().slice(1).toLowerCase() : value)
    @IsNotEmpty({ message: 'El título no puede estar vacío' })
    @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
    @MaxLength(100, { message: 'El título no puede tener más de 100 caracteres' })
    @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s!?¿¡().,-]+$/, { message: 'El título solo puede contener letras, números, espacios y los caracteres !?¿¡().,-' })
    Titulo: string;

    @ApiProperty({ example: 'Ejemplo descripcion' })
    @IsString( {message: 'La descripcion debe ser un string' })
    @IsDefined({ message: 'La descripcion no puede estar vacia' })
    @Transform(({ value }) => value?.trim() ? value.trim()[0].toUpperCase() + value.trim().slice(1).toLowerCase() : value)
    @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
    @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
    @MaxLength(1000, { message: 'La descripción no puede tener más de 1000 caracteres' })
    @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s!?¿¡().,:;-]+$/, { message: 'La descripción solo puede contener letras, números, espacios y los caracteres !?¿¡().,:;-' })
    Descripcion: string;
}