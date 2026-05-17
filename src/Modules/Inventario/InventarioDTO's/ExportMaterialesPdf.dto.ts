import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ExportMaterialesPdfDto {
    @ApiProperty({ required: false, type: [Number], description: 'IDs de estados a incluir. Vacío = todos.' })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Type(() => Number)
    estados?: number[];

    @ApiProperty({ required: false, type: [String], description: 'Columnas a incluir.' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    columnas?: string[];
}
