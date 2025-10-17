import { IsDefined, IsString, Matches, MaxLength, IsOptional, IsNotEmpty, IsEmail } from 'class-validator';

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/;
const NAME_WITH_SPACES = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/;

export class CreateQuejaDto {
  @IsDefined({ message: 'El nombre es requerido' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @Matches(NAME_WITH_SPACES, { message: 'El nombre sólo puede contener letras y espacios simples' })
  @MaxLength(20, { message: 'El nombre no puede tener más de 20 caracteres' })
  name: string;

 @IsDefined({ message: 'El primer apellido es requerido' })
  @IsString()
  @IsNotEmpty({ message: 'El primer apellido no puede estar vacío' })
  @Matches(NAME_REGEX, { message: 'El primer apellido sólo puede contener letras y sin espacios' })
  @MaxLength(20, { message: 'El primer apellido no puede tener más de 20 caracteres' })
  Papellido: string;

  @IsDefined({ message: 'El segundo apellido es requerido' })
  @IsString()
  @IsNotEmpty({ message: 'El segundo apellido no puede estar vacío' })
  @Matches(NAME_REGEX, { message: 'El segundo apellido sólo puede contener letras y sin espacios' })
  @MaxLength(20, { message: 'El segundo apellido no puede tener más de 20 caracteres' })
  Sapellido: string;

  @IsDefined({ message: 'La descripción es requerida' })
  @IsString()
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  @MaxLength(50, { message: 'La descripción no puede tener más de 50 caracteres' })
  descripcion: string;

  @IsDefined({ message: 'El correo electrónico es requerido' })
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío' })
  @MaxLength(100, { message: 'El correo electrónico no puede tener más de 100 caracteres' })
  Correo: string;
}
