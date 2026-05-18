import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ExportLecturasPdfDto {
    @ApiProperty({ required: false, type: [Number], description: 'IDs de tipo de tarifa.' })
    @IsOptional() @IsArray() @IsInt({ each: true }) @Type(() => Number)
    tiposTarifa?: number[];

    @ApiProperty({ required: false })
    @IsOptional() @IsDateString()
    fechaInicio?: string;

    @ApiProperty({ required: false })
    @IsOptional() @IsDateString()
    fechaFin?: string;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional() @IsArray() @IsString({ each: true })
    columnas?: string[];

    @ApiProperty({ required: false, type: [Number] })
    @IsOptional() @IsArray() @IsInt({ each: true }) @Type(() => Number)
    ids?: number[];
}
