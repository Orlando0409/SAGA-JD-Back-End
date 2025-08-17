import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Alondra Flores'
  })
  @IsString()
  @IsNotEmpty()
  Nombre_Usuario: string;

  @ApiProperty({
    example: '12345'
  })
  @IsString()
  @IsNotEmpty()
  Contraseña: string;

  @ApiProperty({
    example: 'alondra.flores@gmail.com'
  })
  @IsEmail()
  @IsNotEmpty()
  Correo_Electronico: string;

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  Id_Rol: number;
}
