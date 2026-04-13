import { IsNotEmpty, IsString, MaxLength, IsEmail, IsDefined } from 'class-validator';

export class CreateSugerenciaDto {
 @IsDefined({ message: 'La descripción es requerida' })
  @IsString()
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  @MaxLength(200, { message: 'La descripción no puede tener más de 200 caracteres' })
  Descripcion: string;

  @IsDefined({ message: 'El correo es requerido' })
  @IsString()
  @IsNotEmpty({ message: 'El correo no puede estar vacío' })
  @MaxLength(100, { message: 'El correo no puede tener más de 100 caracteres' })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  Correo: string;

}