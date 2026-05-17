import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ExportAuditoriaPdfDto {
    @ApiProperty({ required: false, type: [String], description: 'Módulos a incluir. Vacío = todos.' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    modulos?: string[];

    @ApiProperty({ required: false, type: [String], description: 'Acciones a incluir (Creación, Actualización, Eliminación). Vacío = todas.' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    acciones?: string[];

    @ApiProperty({ required: false, description: 'ID de usuario para filtrar. Omitido = todos.' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    idUsuario?: number;

    @ApiProperty({ required: false, type: [String], description: 'Columnas a incluir.' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    columnas?: string[];
}
