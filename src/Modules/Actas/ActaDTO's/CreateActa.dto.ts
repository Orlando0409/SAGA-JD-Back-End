import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Transform } from 'class-transformer';

export class CreateActaDto {
    @ApiProperty({ example: 'Acta de Reunión de Proyecto X' })
    @Transform(({ value }) => value?.trim().toUpperCase())
    @IsString({ message: 'El título debe ser un string' })
    @IsDefined({ message: 'El título no puede estar vacío' })
    @IsNotEmpty({ message: 'El título no puede estar vacío' })
    @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
    @MaxLength(100, { message: 'El título no puede tener más de 100 caracteres' })
    Titulo: string;

    @ApiProperty({ example: 'Descripción detallada del acta...' })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'La descripción debe ser un string' })
    @IsDefined({ message: 'La descripción no puede estar vacía' })
    @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
    @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
    @MaxLength(500, { message: 'La descripción no puede tener más de 500 caracteres' })
    Descripcion: string;

    @ApiProperty({example: 1})
    @Transform(({ value }) => Number(value))
    @IsDefined({ message: 'El Id del usuario no puede estar vacío' })
    @IsNotEmpty({ message: 'El Id del usuario no puede estar vacío' })
    Id_Usuario: number;
}