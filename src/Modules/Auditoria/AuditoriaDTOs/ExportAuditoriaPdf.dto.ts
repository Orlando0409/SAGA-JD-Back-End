import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ExportAuditoriaPdfDto {
    @ApiProperty({ required: false, type: [String] })
    @IsOptional() @IsArray() @IsString({ each: true })
    modulos?: string[];

    @ApiProperty({ required: false, type: [String] })
    @IsOptional() @IsArray() @IsString({ each: true })
    acciones?: string[];

    @ApiProperty({ required: false })
    @IsOptional() @IsInt() @Type(() => Number)
    idUsuario?: number;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional() @IsArray() @IsString({ each: true })
    columnas?: string[];

    @ApiProperty({ required: false })
    @IsOptional() @IsDateString()
    fechaInicio?: string;

    @ApiProperty({ required: false })
    @IsOptional() @IsDateString()
    fechaFin?: string;

    @ApiProperty({ required: false, type: [Number] })
    @IsOptional() @IsArray() @IsInt({ each: true }) @Type(() => Number)
    ids?: number[];
}
