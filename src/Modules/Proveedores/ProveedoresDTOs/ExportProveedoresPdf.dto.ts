import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ExportProveedoresPdfDto {
    @ApiProperty({ required: false, type: [Number] })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Type(() => Number)
    estados?: number[];

    @ApiProperty({ required: false, enum: [1, 2] })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    tipo?: 1 | 2;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    columnas?: string[];

    @ApiProperty({ required: false, description: 'YYYY-MM-DD' })
    @IsOptional()
    @IsDateString()
    fechaInicio?: string;

    @ApiProperty({ required: false, description: 'YYYY-MM-DD' })
    @IsOptional()
    @IsDateString()
    fechaFin?: string;

    @ApiProperty({ required: false, type: [Number], description: 'Si presente, PDF solo de estos IDs (para registro individual).' })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Type(() => Number)
    ids?: number[];
}
