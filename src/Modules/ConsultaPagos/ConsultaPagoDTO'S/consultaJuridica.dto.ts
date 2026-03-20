import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt, IsOptional } from "class-validator";
import { TipoIdentificacion } from "src/Common/Enums/TipoIdentificacion.enum";

export class ConsultaJuridicaDTO {
    @ApiProperty({ example: '3123987654' })
    @IsOptional()
    Cedula_Juridica?: string;

    @ApiProperty({ example: 'Residencial' })
    @IsOptional()
    Numero_Medidor?: number;
}