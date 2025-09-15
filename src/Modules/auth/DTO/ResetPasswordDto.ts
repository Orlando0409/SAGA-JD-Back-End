import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'Nueva Contraseña',
  })
  @IsNotEmpty()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  nuevaContraseña: string;
}
