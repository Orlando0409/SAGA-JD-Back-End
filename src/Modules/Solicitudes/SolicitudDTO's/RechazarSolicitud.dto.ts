import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength, IsInt, IsPositive } from 'class-validator';

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

    @ApiPropertyOptional({
        example: 123,
        description: 'ID del nuevo medidor a asignar (requerido cuando el estado es 4 - Completada en solicitudes de cambio de medidor)'
    })
    @IsOptional()
    @IsInt({ message: 'El ID del nuevo medidor debe ser un número entero' })
    @IsPositive({ message: 'El ID del nuevo medidor debe ser positivo' })
    Id_Nuevo_Medidor?: number;
}
