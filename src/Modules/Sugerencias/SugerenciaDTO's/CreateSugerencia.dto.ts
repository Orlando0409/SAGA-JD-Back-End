import { IsNotEmpty, IsOptional, IsString, MaxLength, IsEmail } from 'class-validator';

export class CreateSugerenciaDto {
  @IsNotEmpty({ message: 'Mensaje es requerido' })
  @IsString()
  @MaxLength(500)
  Mensaje: string;

  @IsNotEmpty({ message: 'Correo es requerido' })
  @IsEmail({}, { message: 'Formato de correo inválido' })
  @MaxLength(100)
  Correo: string;

  @IsOptional()
  Adjunto?: any;
}