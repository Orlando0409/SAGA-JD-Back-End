import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsNumber, IsBoolean, IsString, MinLength, MaxLength } from "class-validator";
import { Type } from "class-transformer";

export class PagarCambioMedidorDTO {
    @ApiProperty({description: 'Monto a pagar por el cambio de medidor', example: 5000})
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    montoCambio?: number;
    
    @ApiProperty({description: 'Indica si la solicitud ocupa pago', example: true})
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    ocupaPago?: boolean;

    @ApiProperty({description: 'Motivo del cobro por el cambio de medidor', example: 'Cambio de medidor por daño'})
    @Type(() => String)
    @IsString()
    @IsOptional()
    motivoCobro?: string;

    @ApiPropertyOptional({
        example: 'Documentación incompleta',
        description: 'Motivo del rechazo de la solicitud (requerido cuando el estado es 5 - Rechazada)'
    })
    @IsOptional()
    @IsString({ message: 'El motivo debe ser un texto' })
    @MinLength(10, { message: 'El motivo debe tener al menos 10 caracteres' })
    @MaxLength(500, { message: 'El motivo no puede exceder 500 caracteres' })
    motivoRechazo?: string;
}