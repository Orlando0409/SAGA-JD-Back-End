import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AnularFacturaDTO {
    @ApiProperty({ required: false, description: 'Motivo de la anulación (opcional pero recomendado para auditoría)' })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'El motivo no puede exceder 500 caracteres' })
    motivo?: string;
}
