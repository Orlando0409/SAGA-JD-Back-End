import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDefined, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateCalidadAguaDto {
    @ApiProperty({ example: 'Reporte de Ebais de Juan Diaz' })
    @IsString({ message: 'El titulo debe ser un string' })
    @IsDefined({ message: 'El titulo no puede estar vacio' })
    @Transform(({ value }) => value?.trim().toUpperCase())
    @IsNotEmpty({ message: 'El título no puede estar vacío' })
    @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
    @MaxLength(100, { message: 'El título no puede tener más de 100 caracteres' })
    @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s!?¿¡().,-]+$/, { message: 'El título solo puede contener letras, números, espacios y los caracteres !?¿¡().,-' })
    Titulo: string;
}