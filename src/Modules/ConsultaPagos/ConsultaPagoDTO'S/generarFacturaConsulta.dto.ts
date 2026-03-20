import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { TipoIdentificacion } from 'src/Common/Enums/TipoIdentificacion.enum';

export class GenerarFacturaConsultaDTO {
    @ApiProperty({ example: '123456789' })
    @IsOptional()
    Numero_Medidor?: number;

    @ApiProperty({ example: 'Cédula de Identidad' })
    @IsOptional()
    Tipo_Identificacion?: TipoIdentificacion;

    @ApiProperty({ example: '123456789' })
    @IsOptional()
    Identificacion?: string;

    @ApiProperty({ example: '3123987654' })
    @IsOptional()
    Cedula_Juridica?: string;
}
