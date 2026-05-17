import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ExportProveedoresPdfDto {
    @ApiProperty({
        required: false,
        type: [Number],
        description: 'IDs de estados a incluir. Si vacío/omitido: incluye todos.',
    })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Type(() => Number)
    estados?: number[];

    @ApiProperty({
        required: false,
        enum: [1, 2],
        description: 'Filtro por tipo de entidad. 1=Físico, 2=Jurídico. Omitido = ambos.',
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    tipo?: 1 | 2;

    @ApiProperty({
        required: false,
        type: [String],
        description: 'Columnas a incluir. Si vacío: usa default. Keys: nombre, telefono, identificacion, tipo, estado.',
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    columnas?: string[];
}
