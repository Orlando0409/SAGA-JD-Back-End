import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class PagarCambioMedidorDTO {
    @ApiProperty({description: 'Monto a pagar por el cambio de medidor', example: 5000})
    @IsOptional()
    montoCambio?: number;
    @ApiProperty({description: 'Indica si la solicitud ocupa pago', example: true})
    @IsOptional()
    ocupaPago?: boolean;

    @ApiProperty({description: 'Motivo del cobro por el cambio de medidor', example: 'Cambio de medidor por daño'})
    @IsOptional()
    motivoCobro?: string;
}