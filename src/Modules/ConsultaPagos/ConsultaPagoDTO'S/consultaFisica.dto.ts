import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt, IsOptional } from "class-validator";
import { TipoIdentificacion } from "src/Common/Enums/TipoIdentificacion.enum";

export class ConsultaFisicaDTO {
    @ApiProperty({ example: 'Cédula de Identidad' })
    @IsOptional()
    Tipo_Identificacion?: TipoIdentificacion;

    @ApiProperty({ example: '123456789' })
    @IsOptional()
    Identificacion?: string;

    @ApiProperty({ example: 'Residencial' })
    @IsOptional()
    Numero_Medidor?: number;
}