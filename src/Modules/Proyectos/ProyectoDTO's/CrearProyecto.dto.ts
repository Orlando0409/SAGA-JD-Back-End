import { IsString, IsDate, IsInt, IsUrl, IsDefined, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProyectoDto {
    @ApiProperty({example: 'Ejemplo'})
    @IsString({message: 'El titulo debe ser un string'})
    @IsDefined({message: 'El titulo no puede estar vacio'})
    Titulo: string;

    @ApiProperty({example: 'Ejemplo'})
    @IsString({message: 'La descripcion debe ser un string'})
    @IsDefined({message: 'La descripcion no puede estar vacia'})
    Descripcion: string;

    @ApiProperty({example: 1})
    @IsInt({message: 'El ID del usuario debe ser un numero entero'})
    @IsDefined({message: 'El ID del usuario no puede estar vacio'})
    Id_Usuario: number;

    @ApiProperty({example: 'https://imagen.jpg'})
    @IsString({message: 'La URL de la imagen debe ser un string'})
    @IsDefined({message: 'La URL de la imagen no puede estar vacia'})
    @IsUrl()
    Imagen_Url: string;
}