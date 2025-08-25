import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsNumber, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Nombre Apellido'
  })
  @IsString()
  @IsNotEmpty({message: 'El nombre no puede estar vacío' })
  Nombre_Usuario: string;

  @ApiProperty({
    example: '123456'
  })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  Contraseña: string;

  @ApiProperty({
    example: 'correo@gmail.com'
  })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío' })
  Correo_Electronico: string;

  @ApiProperty({
    example: 1,
  })
  @IsNumber({}, { message: 'El ID del rol debe ser un número' })
  @IsNotEmpty()
  Id_Rol: number;
}
