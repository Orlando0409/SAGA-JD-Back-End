import { IsString, IsDate, IsInt, IsUrl, IsDefined } from 'class-validator';
import { Exclude, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CrearProyectoDto {
    @ApiProperty({example: 'Ejemplo'})
    @IsString({message: 'El titulo debe ser un string'})
    @IsDefined({message: 'El titulo no puede estar vacio'})
    Titulo: string;

    @ApiProperty({example: 'Ejemplo'})
    @IsString({message: 'La descripcion debe ser un string'})
    @IsDefined({message: 'La descripcion no puede estar vacia'})
    Descripcion: string;

    @ApiProperty({example: '2023-10-01'})
    @Type(() => Date)
    @IsDate({message: 'La fecha de creacion debe ser una fecha valida'})
    @IsDefined({message: 'La fecha de creacion no puede estar vacia'})
    Fecha_Creacion: Date;

    @ApiProperty({example: '2023-10-15'})
    @Type(() => Date)
    @IsDate({message: 'La fecha de actualizacion debe ser una fecha valida'})
    @IsDefined({message: 'La fecha de creacion no puede estar vacia'})
    Fecha_Actualizacion: Date;

    @ApiProperty({example: 1})
    @IsInt({message: 'El ID del usuario debe ser un numero entero'})
    @IsDefined({message: 'El ID del usuario no puede estar vacio'})
    Id_Usuario: number;

    @ApiProperty({example: 1})
    @IsInt({message: 'El ID del estado del proyecto debe ser un numero entero'})
    @IsDefined({message: 'El ID del estado del proyecto no puede estar vacio'})
    Id_Estado_Proyecto: number;

    @ApiProperty({example: 'https://imagen.jpg'})
    @IsString({message: 'La URL de la imagen debe ser un string'})
    @IsDefined({message: 'La URL de la imagen no puede estar vacia'})
    @IsUrl()
    ImagenUrl: string;
}