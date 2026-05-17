import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class ExportMovimientosPdfDto {
    @ApiProperty({ required: false, type: [String], description: 'Tipos de movimiento (ej: Ingreso, Egreso). Vacío = todos.' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tipos?: string[];

    @ApiProperty({ required: false, description: 'Fecha inicio ISO (YYYY-MM-DD).' })
    @IsOptional()
    @IsDateString()
    fechaInicio?: string;

    @ApiProperty({ required: false, description: 'Fecha fin ISO (YYYY-MM-DD).' })
    @IsOptional()
    @IsDateString()
    fechaFin?: string;

    @ApiProperty({ required: false, type: [String], description: 'Columnas a incluir.' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    columnas?: string[];
}
