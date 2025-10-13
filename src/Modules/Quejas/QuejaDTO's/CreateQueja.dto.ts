import { IsDefined, IsString, Matches, MaxLength, IsOptional } from 'class-validator';

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/;

export class CreateQuejaDto {
  @IsDefined({ message: 'El nombre es requerido' })
  @IsString()
  @Matches(NAME_REGEX, { message: 'El nombre sólo puede contener letras y sin espacios' })
  @MaxLength(20, { message: 'El nombre no puede tener más de 20 caracteres' })
  name: string;

  @IsOptional()
  @IsString()
  @Matches(NAME_REGEX, { message: 'El primer apellido sólo puede contener letras y sin espacios' })
  @MaxLength(20, { message: 'El primer apellido no puede tener más de 20 caracteres' })
  Papellido?: string;

  @IsOptional()
  @IsString()
  @Matches(NAME_REGEX, { message: 'El segundo apellido sólo puede contener letras y sin espacios' })
  @MaxLength(20, { message: 'El segundo apellido no puede tener más de 20 caracteres' })
  Sapellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'La descripción no puede tener más de 50 caracteres' })
  descripcion?: string;
}
