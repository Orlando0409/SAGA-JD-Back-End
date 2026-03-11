import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, IsOptional, IsDefined, IsNotEmpty, MinLength, MaxLength, Matches, Min, Max, IsEnum, IsIn, } from 'class-validator';
import { Transform } from 'class-transformer';
import { TipoIdentificacion } from 'src/Common/Enums/TipoIdentificacion.enum';
import { IsIdentificacionValida } from 'src/Validations/DTO Validators/Identificacion.validator';
import { IsTelefonoValido } from 'src/Validations/DTO Validators/NumeroTelefono.validator';
import { IsCedulaJuridicaValida } from 'src/Validations/DTO Validators/CedulaJuridica.validator';

// Función helper para capitalizar cada palabra
const capitalizarCadaPalabra = (value: string): string => {
  if (!value) return value;
  return value
    .trim()
    .split(/\s+/) // Divide por espacios (uno o más)
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(' ');
};

//Proximamente lo guardare en la carpeta de los enums 
export enum OpcionMedidor {
  SinMedidor = 'sin_medidor',
  Asignar = 'asignar',
  Agregar = 'agregar',
}

export class CreateAfiliadoDto {
  @ApiProperty({ example: 'ejemplo@gmail.com' })
  @Transform(({ value }) => value?.trim())
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  @IsDefined({ message: 'El correo no puede estar vacío' })
  @IsNotEmpty({ message: 'El correo no puede estar vacío' })
  @MaxLength(100, { message: 'El correo no puede tener más de 100 caracteres' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: 'El formato del correo electrónico no es válido' })
  Correo: string;

  @ApiProperty({ example: '+506-8888-7777' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El número de teléfono debe ser un string' })
  @IsDefined({ message: 'El número de teléfono no puede estar vacío' })
  @IsNotEmpty({ message: 'El número de teléfono no puede estar vacío' })
  @IsTelefonoValido({ message: 'Número de teléfono inválido' })
  Numero_Telefono: string;

  @ApiProperty({ example: '200 metros del parque central' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La dirección debe ser un string' })
  @IsDefined({ message: 'La dirección no puede estar vacía' })
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(255, { message: 'La dirección no puede tener más de 255 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#-]+$/, { message: 'La dirección solo puede contener letras, números, espacios y los caracteres .,-#' })
  Direccion_Exacta: string;

  // ───MEDIDOR───────────────────────────────────────────────────────
  @ApiProperty({
    example: 'sin_medidor',
    enum: OpcionMedidor,
    required: false,
    default: OpcionMedidor.SinMedidor,
  })
  @IsOptional()
  @IsEnum(OpcionMedidor, { message: 'Opcion_Medidor debe ser "sin_medidor", "asignar" o "agregar"' })
  Opcion_Medidor?: OpcionMedidor;

  @ApiProperty({
    example: 3,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : undefined))
  @IsNumber({}, { message: 'Id_Medidor debe ser un número entero' })
  Id_Medidor?: number;

  @ApiProperty({
    example: 123456,
    description: 'Requerido cuando Opcion_Medidor = "agregar". Número del nuevo medidor a crear.',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : undefined))
  @IsNumber({}, { message: 'Numero_Medidor debe ser un número entero' })
  Numero_Medidor?: number;
}

export class CreateAfiliadoFisicoDto extends CreateAfiliadoDto {
  @ApiProperty({ example: 'Cedula', enum: [TipoIdentificacion.CEDULA, TipoIdentificacion.DIMEX, TipoIdentificacion.PASAPORTE] })
  @Transform(({ value }) => value?.trim())
  @IsEnum(TipoIdentificacion, { message: `El tipo de identificación debe ser válido` })
  @IsIn([TipoIdentificacion.CEDULA, TipoIdentificacion.DIMEX, TipoIdentificacion.PASAPORTE],
    { message: 'Para afiliados físicos solo se permiten: Cedula Nacional, Dimex, Pasaporte' })
  @IsDefined({ message: 'El tipo de identificación no puede estar vacío' })
  Tipo_Identificacion: TipoIdentificacion;

  @ApiProperty({ example: '123456789 o 1-2345-6789 o 1 2345 6789' })
  @Transform(({ value }) => value?.trim().replace(/[\s\-]+/g, '').toUpperCase())
  @IsDefined({ message: 'La identificación no puede estar vacía' })
  @IsNotEmpty({ message: 'La identificación no puede estar vacía' })
  @IsString({ message: 'La identificación debe ser un string' })
  @IsIdentificacionValida()
  Identificacion: string;

  @ApiProperty({ example: 'Mario' })
  @Transform(({ value }) => capitalizarCadaPalabra(value))
  @IsString({ message: 'El nombre debe ser un string' })
  @IsDefined({ message: 'El nombre no puede estar vacío' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El nombre solo puede contener letras y espacios' })
  Nombre: string;

  @ApiProperty({ example: 'Perez' })
  @Transform(({ value }) => capitalizarCadaPalabra(value))
  @IsString({ message: 'El primer apellido debe ser un string' })
  @IsDefined({ message: 'El primer apellido no puede estar vacío' })
  @IsNotEmpty({ message: 'El primer apellido no puede estar vacío' })
  @MinLength(2, { message: 'El primer apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El primer apellido no puede tener más de 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El primer apellido solo puede contener letras y espacios' })
  Apellido1: string;

  @ApiProperty({ example: 'Lopez' })
  @Transform(({ value }) => capitalizarCadaPalabra(value))
  @IsString({ message: 'El segundo apellido debe ser un string' })
  @IsDefined({ message: 'El segundo apellido no puede estar vacío' })
  @IsNotEmpty({ message: 'El segundo apellido no puede estar vacío' })
  @MinLength(2, { message: 'El segundo apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El segundo apellido no puede tener más de 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El segundo apellido solo puede contener letras y espacios' })
  Apellido2: string;

  @ApiProperty({ example: 25 })
  @IsNumber({}, { message: 'La edad debe ser un número' })
  @IsDefined({ message: 'La edad no puede estar vacía' })
  @Min(18, { message: 'La edad mínima es 18 años' })
  @Max(120, { message: 'La edad máxima es 120 años' })
  Edad: number;
}

export class CreateAfiliadoJuridicoDto extends CreateAfiliadoDto {
  @ApiProperty({ example: '3101234567' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La cédula jurídica debe ser un string' })
  @IsDefined({ message: 'La cédula jurídica no puede estar vacía' })
  @IsNotEmpty({ message: 'La cédula jurídica no puede estar vacía' })
  @IsCedulaJuridicaValida()
  Cedula_Juridica: string;

  @ApiProperty({ example: 'Empresa Ejemplo S.A.' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La razón social debe ser un string' })
  @IsDefined({ message: 'La razón social no puede estar vacía' })
  @IsNotEmpty({ message: 'La razón social no puede estar vacía' })
  @MinLength(2, { message: 'La razón social debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'La razón social no puede tener más de 100 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,&()-]+$/, { message: 'La razón social solo puede contener letras, números, espacios y los caracteres .,&()-' })
  Razon_Social: string;
}