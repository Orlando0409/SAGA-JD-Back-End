import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, IsOptional, IsDefined, IsNotEmpty, MinLength, MaxLength, Matches, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAbonadoDto {
  

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

  @ApiProperty({ example: '200 metros del parque central' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La dirección debe ser un string' })
  @IsDefined({ message: 'La dirección no puede estar vacía' })
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(255, { message: 'La dirección no puede tener más de 255 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#-]+$/, { message: 'La dirección solo puede contener letras, números, espacios y los caracteres .,-#' })
  Direccion_Exacta: string;


}

export class CreateAbonadoFisicoDto extends CreateAbonadoDto {
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

  @ApiProperty({ example: 25 })
  @IsNumber({}, { message: 'La edad debe ser un número' })
  @IsDefined({ message: 'La edad no puede estar vacía' })
  @Min(18, { message: 'La edad mínima es 18 años' })
  @Max(120, { message: 'La edad máxima es 120 años' })
  Edad: number;
}

export class CreateAbonadoJuridicoDto extends CreateAbonadoDto {
  @ApiProperty({ example: '3101234567' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La cédula jurídica debe ser un string' })
  @IsDefined({ message: 'La cédula jurídica no puede estar vacía' })
  @IsNotEmpty({ message: 'La cédula jurídica no puede estar vacía' })
  @Matches(/^3-\d{3}-\d{6}$/, { message: 'La cédula jurídica debe tener el formato 3-XXX-XXXXXX' })
  @MinLength(12)
  @MaxLength(12)
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