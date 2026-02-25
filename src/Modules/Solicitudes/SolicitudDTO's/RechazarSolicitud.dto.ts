import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class RechazarSolicitudDto {
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
