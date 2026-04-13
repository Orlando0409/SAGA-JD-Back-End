import { Transform } from 'class-transformer';
import { IsDefined, IsString, Matches, MaxLength, IsOptional, IsNotEmpty, IsEmail, ValidateIf } from 'class-validator';

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/;
// Permite nombres compuestos con espacios simples, p.ej. 'Alondra Maria'
const NAME_WITH_SPACES = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/;
const trimValue = (value: unknown): unknown => (typeof value === 'string' ? value.trim() : value);
const normalizeSpaces = (value: unknown): unknown =>
    typeof value === 'string' ? value.trim().replaceAll(/\s+/g, ' ') : value;

export class CreateQuejaDto {
  @Transform(({ value }) => normalizeSpaces(value))
  @IsDefined({ message: 'El nombre es requerido' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @Matches(NAME_WITH_SPACES, { message: 'El nombre sólo puede contener letras y espacios simples (sin caracteres especiales)' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres' })
  Nombre: string;

  @Transform(({ value }) => trimValue(value))
  @IsDefined({ message: 'El primer apellido es requerido' })
  @IsString()
  @IsNotEmpty({ message: 'El primer apellido no puede estar vacío' })
  @Matches(NAME_REGEX, { message: 'El primer apellido sólo puede contener letras y sin espacios' })
  @MaxLength(50, { message: 'El primer apellido no puede tener más de 50 caracteres' })
  Primer_Apellido: string;

  @Transform(({ value }) => trimValue(value))
  @IsOptional()
  @ValidateIf((o) => o.Segundo_Apellido && o.Segundo_Apellido.trim() !== '')
  @IsString()
  @Matches(NAME_REGEX, { message: 'El segundo apellido sólo puede contener letras y sin espacios' })
  @MaxLength(50, { message: 'El segundo apellido no puede tener más de 50 caracteres' })
  Segundo_Apellido?: string;

  @IsDefined({ message: 'La descripción es requerida' })
  @IsString()
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  @MaxLength(200, { message: 'La descripción no puede tener más de 200 caracteres' })
  Descripcion: string;

  @IsDefined({ message: 'El correo electrónico es requerido' })
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío' })
  @MaxLength(100, { message: 'El correo electrónico no puede tener más de 100 caracteres' })
  Correo: string;
}