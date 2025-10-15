import { IsDefined, IsString, Matches, MaxLength, IsNotEmpty, IsEmail } from 'class-validator';

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/;
// Permite nombres compuestos con espacios simples, p.ej. 'Alondra Maria'
const NAME_WITH_SPACES = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/;

export class CreateReporteDto {
    @IsDefined({ message: 'El nombre es requerido' })
    @IsString()
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    @Matches(NAME_WITH_SPACES, { message: 'El nombre sólo puede contener letras y espacios simples (sin caracteres especiales)' })
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

    @IsDefined({ message: 'El correo es requerido' })
    @IsString()
    @IsNotEmpty({ message: 'El correo no puede estar vacío' })
    @MaxLength(50, { message: 'El correo no puede tener más de 50 caracteres' })
    @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
    Correo: string;


    @IsDefined({ message: 'La ubicación es requerida' })
    @IsString()
    @IsNotEmpty({ message: 'La ubicación no puede estar vacía' })
    @MaxLength(50, { message: 'La ubicación no puede tener más de 50 caracteres' })
    ubicacion: string;

    @IsDefined({ message: 'La descripción es requerida' })
    @IsString()
    @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
    @MaxLength(50, { message: 'La descripción no puede tener más de 50 caracteres' })
    descripcion: string;
}
