import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  
  @ApiProperty({
    example: 'Ingrese el token recibido del correo:',
  })
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'Nueva Contraseña',
  })
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  nuevaContraseña: string;

  @ApiProperty({
    example: 'Confirmar Contraseña',
  })
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  confirmarContraseña: string;
}
