import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ExportAfiliadosPdfDto {
    @ApiProperty({ required: false, type: [Number], description: 'IDs de estados a incluir. Vacío = todos.' })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Type(() => Number)
    estados?: number[];

    @ApiProperty({ required: false, enum: [1, 2], description: '1=Físico, 2=Jurídico. Omitido = ambos.' })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    tipo?: 1 | 2;

    @ApiProperty({ required: false, type: [Number], description: 'IDs de tipo de afiliado a incluir.' })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Type(() => Number)
    tiposAfiliado?: number[];

    @ApiProperty({ required: false, type: [String], description: 'Columnas a incluir.' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    columnas?: string[];
}
