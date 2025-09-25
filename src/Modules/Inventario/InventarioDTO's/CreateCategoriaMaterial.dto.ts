import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDefined, IsNotEmpty, IsString, Matches, Max, Min } from "class-validator";

export class CreateCategoriaMaterialDto {
    @ApiProperty({ example: 'Materiales de Construcción' })
    @IsString({ message: 'La categoría debe ser un string' })
    @IsDefined({ message: 'La categoría no puede estar vacio' })
    @Transform(({ value }) => value?.trim())
    @IsNotEmpty({ message: 'La categoría no puede estar vacío' })
    @Min(2, { message: 'La categoría debe tener al menos 2 caracteres' })
    @Max(30, { message: 'La categoría no puede tener más de 30 caracteres' })
    @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s!?¿¡().,-]+$/, { message: 'La categoría solo puede contener letras, números, espacios y los caracteres !?¿¡().,-' })
    Nombre_Categoria: string;
}