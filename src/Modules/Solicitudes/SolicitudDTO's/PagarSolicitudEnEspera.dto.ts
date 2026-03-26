import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class PagarSolicitudEnEsperaDTO {
    @ApiPropertyOptional({
        description: 'Indica si la solicitud requiere pago antes de continuar el flujo',
        example: true
    })
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    ocupaPago?: boolean;

    @ApiPropertyOptional({
        description: 'Monto exacto a pagar cuando la solicitud queda Aprobada y en espera',
        example: 7500
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    montoCambio?: number;

    @ApiPropertyOptional({
        example: 'Documentacion incompleta',
        description: 'Motivo del rechazo de la solicitud (requerido cuando el estado es 5 - Rechazada)'
    })
    @IsOptional()
    @IsString({ message: 'El motivo debe ser un texto' })
    @MinLength(10, { message: 'El motivo debe tener al menos 10 caracteres' })
    @MaxLength(500, { message: 'El motivo no puede exceder 500 caracteres' })
    motivoRechazo?: string;
}
