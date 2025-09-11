import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsDefined, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAsociadoDto {
  @ApiProperty({ example: 'ejemplo@gmail.com' })
  @Transform(({ value }) => value?.trim())
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  @IsDefined({ message: 'El correo no puede estar vacío' })
  @IsNotEmpty({ message: 'El correo no puede estar vacío' })
  @MaxLength(100, { message: 'El correo no puede tener más de 100 caracteres' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: 'El formato del correo electrónico no es válido' })
  Correo: string;

  @ApiProperty({ example: '12345678' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El número de teléfono debe ser un string' })
  @IsDefined({ message: 'El número de teléfono no puede estar vacío' })
  @IsNotEmpty({ message: 'El número de teléfono no puede estar vacío' })
  @Matches(/^[0-9+()\s-]+$/, { message: 'El número de teléfono solo puede contener números, +, -, () y espacios' })
  @MinLength(8, { message: 'El número de teléfono debe tener al menos 8 dígitos' })
  @MaxLength(15, { message: 'El número de teléfono no puede tener más de 15 caracteres' })
  Numero_Telefono: string;

  @ApiProperty({ example: 'Quiero formar parte de la asociación' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El motivo de solicitud debe ser un string' })
  @IsDefined({ message: 'El motivo de solicitud no puede estar vacío' })
  @IsNotEmpty({ message: 'El motivo de solicitud no puede estar vacío' })
  @MinLength(10, { message: 'El motivo de solicitud debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'El motivo de solicitud no puede tener más de 500 caracteres' })
  Motivo_Solicitud: string;
}

export class CreateAsociadoFisicoDto extends CreateAsociadoDto {
@ApiProperty({ example: '123456789' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La cedula debe ser tener entre 9 y 12 caracteres' })
  @IsDefined({ message: 'La cedula no puede estar vacia' })
  @Transform(({ value }) => value?.toUpperCase())
  @Matches(/^([A]?\d{9,12})$/, { message: 'La cédula debe tener 9-12 dígitos o comenzar con A seguido de 9-11 dígitos' })
  @MinLength(9)
  @MaxLength(12)
  Cedula: string;

  @ApiProperty({ example: 'Mario' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser un string' })
  @IsDefined({ message: 'El nombre no puede estar vacío' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El nombre solo puede contener letras y espacios' })
  Nombre: string;

  @ApiProperty({ example: 'Perez' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El primer apellido debe ser un string' })
  @IsDefined({ message: 'El primer apellido no puede estar vacío' })
  @IsNotEmpty({ message: 'El primer apellido no puede estar vacío' })
  @MinLength(2, { message: 'El primer apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El primer apellido no puede tener más de 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El primer apellido solo puede contener letras y espacios' })
  Apellido1: string;

  @ApiProperty({ example: 'Lopez', required: false })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString({ message: 'El segundo apellido debe ser un string' })
  @MinLength(2, { message: 'El segundo apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El segundo apellido no puede tener más de 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El segundo apellido solo puede contener letras y espacios' })
  Apellido2?: string;
}

export class CreateAsociadoJuridicoDto extends CreateAsociadoDto {
  @ApiProperty({ example: '12345678901234' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La cédula jurídica debe ser tener entre 9 y 14 caracteres' })
  @IsDefined({ message: 'La cédula jurídica no puede estar vacia' })
  @Matches(/^\d{9,14}$/, { message: 'La cédula jurídica debe tener entre 9 y 14 dígitos' })
  @MinLength(9)
  @MaxLength(14)
  Cedula_Juridica: string;

  @ApiProperty({ example: 'Empresa S.A.' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La razón social debe ser un string' })
  @IsDefined({ message: 'La razón social no puede estar vacía' })
  @IsNotEmpty({ message: 'La razón social no puede estar vacía' })
  @MinLength(2, { message: 'La razón social debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'La razón social no puede tener más de 100 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,&()-]+$/, { message: 'La razón social solo puede contener letras, números, espacios y los caracteres .,&()-' })
  Razon_Social: string;
}