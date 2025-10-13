import { IsDefined, IsString, Matches, MaxLength, IsNotEmpty } from 'class-validator';

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/;

export class CreateReporteDto {
    @IsDefined({ message: 'El nombre es requerido' })
    @IsString({ message: 'El nombre debe ser un string' })
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    @Matches(NAME_REGEX, { message: 'El nombre sólo puede contener letras y sin espacios' })
    @MaxLength(20, { message: 'El nombre no puede tener más de 20 caracteres' })
    Nombre: string;

    @IsDefined({ message: 'El primer apellido es requerido' })
    @IsString({ message: 'El primer apellido debe ser un string' })
    @IsNotEmpty({ message: 'El primer apellido no puede estar vacío' })
    @Matches(NAME_REGEX, { message: 'El primer apellido sólo puede contener letras y sin espacios' })
    @MaxLength(20, { message: 'El primer apellido no puede tener más de 20 caracteres' })
    Primer_Apellido: string;

    @IsDefined({ message: 'El segundo apellido es requerido' })
    @IsString({ message: 'El segundo apellido debe ser un string' })
    @IsNotEmpty({ message: 'El segundo apellido no puede estar vacío' })
    @Matches(NAME_REGEX, { message: 'El segundo apellido sólo puede contener letras y sin espacios' })
    @MaxLength(20, { message: 'El segundo apellido no puede tener más de 20 caracteres' })
    Segundo_Apellido: string;

    @IsDefined({ message: 'La descripción es requerida' })
    @IsString({ message: 'La descripción debe ser un string' })
    @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
    @MaxLength(200, { message: 'La descripción no puede tener más de 200 caracteres' })
    Descripcion: string;

    @IsDefined({ message: 'La ubicación es requerida' })
    @IsString({ message: 'La ubicación debe ser un string' })
    @IsNotEmpty({ message: 'La ubicación no puede estar vacía' })
    @MaxLength(200, { message: 'La ubicación no puede tener más de 200 caracteres' })
    Ubicacion: string;
}