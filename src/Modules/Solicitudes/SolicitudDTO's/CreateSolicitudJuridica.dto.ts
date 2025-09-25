import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsEmail, IsDefined, IsInt, Min, MinLength, MaxLength, Matches, IsNotEmpty, Max, IsPositive } from "class-validator";
import { IsTelefonoValido } from "src/Validations/DTO Validators/NumeroTelefono.validator";

export class CreateSolicitudJuridicaDto {
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

  @ApiProperty({ example: 'ejemplo@empresa.com' })
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
}

export class CreateSolicitudAfiliacionJuridicaDto extends CreateSolicitudJuridicaDto {
  @ApiProperty({ example: '200 metros del centro comercial' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La dirección debe ser un string' })
  @IsDefined({ message: 'La dirección no puede estar vacía' })
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(255, { message: 'La dirección no puede tener más de 255 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#-]+$/, { message: 'La dirección solo puede contener letras, números, espacios y los caracteres .,-#' })
  Direccion_Exacta: string;
}

export class CreateSolicitudDesconexionJuridicaDto extends CreateSolicitudJuridicaDto {
  @ApiProperty({ example: '200 metros del centro comercial' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La dirección debe ser un string' })
  @IsDefined({ message: 'La dirección no puede estar vacía' })
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(255, { message: 'La dirección no puede tener más de 255 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#-]+$/, { message: 'La dirección solo puede contener letras, números, espacios y los caracteres .,-#' })
  Direccion_Exacta: string;

  @ApiProperty({ example: 'Cierre de oficinas en esa ubicación' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El motivo de la solicitud debe ser un string' })
  @IsDefined({ message: 'El motivo de la solicitud no puede estar vacío' })
  @IsNotEmpty({ message: 'El motivo de la solicitud no puede estar vacío' })
  @MinLength(10, { message: 'El motivo de la solicitud debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'El motivo de la solicitud no puede tener más de 500 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,!?¿¡()-]+$/, { message: 'El motivo de la solicitud solo puede contener letras, números, espacios y los caracteres .,!?¿¡()-' })
  Motivo_Solicitud: string;
}

export class CreateSolicitudCambioMedidorJuridicaDto extends CreateSolicitudJuridicaDto {
  @ApiProperty({ example: '200 metros del centro comercial' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La dirección debe ser un string' })
  @IsDefined({ message: 'La dirección no puede estar vacía' })
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(255, { message: 'La dirección no puede tener más de 255 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#-]+$/, { message: 'La dirección solo puede contener letras, números, espacios y los caracteres .,-#' })
  Direccion_Exacta: string;

  @ApiProperty({ example: 'Medidor dañado por remodelación de oficinas' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El motivo de la solicitud debe ser un string' })
  @IsDefined({ message: 'El motivo de la solicitud no puede estar vacío' })
  @IsNotEmpty({ message: 'El motivo de la solicitud no puede estar vacío' })
  @MinLength(10, { message: 'El motivo de la solicitud debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'El motivo de la solicitud no puede tener más de 500 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,!?¿¡()-]+$/, { message: 'El motivo de la solicitud solo puede contener letras, números, espacios y los caracteres .,!?¿¡()-' })
  Motivo_Solicitud: string;

  @ApiProperty({ example: 456789 })
  @IsInt({ message: 'El número de medidor anterior debe ser un número entero' })
  @IsDefined({ message: 'El número de medidor anterior no puede estar vacío' })
  @IsNotEmpty({ message: 'El número de medidor anterior no puede estar vacío' })
  @IsPositive({ message: 'El número de medidor anterior debe ser positivo' })
  @Min(1, { message: 'El número de medidor anterior debe ser mayor a 0' })
  @Max(9999999, { message: 'El número de medidor anterior no puede ser mayor a 9,999,999' })
  Numero_Medidor_Anterior: number;
}

export class CreateSolicitudAsociadoJuridicaDto extends CreateSolicitudJuridicaDto {
  @ApiProperty({ example: 'Queremos ser parte de la asociación para contribuir al desarrollo comunitario' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El motivo de la solicitud debe ser un string' })
  @IsDefined({ message: 'El motivo de la solicitud no puede estar vacío' })
  @IsNotEmpty({ message: 'El motivo de la solicitud no puede estar vacío' })
  @MinLength(10, { message: 'El motivo de la solicitud debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'El motivo de la solicitud no puede tener más de 500 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,!?¿¡()-]+$/, { message: 'El motivo de la solicitud solo puede contener letras, números, espacios y los caracteres .,!?¿¡()-' })
  Motivo_Solicitud: string;
}

// Usando herencia directa en lugar de IntersectionType para evitar problemas con validadores personalizados
export class CreateAfiliacionJuridicaDto extends CreateSolicitudAfiliacionJuridicaDto {}

export class CreateDesconexionJuridicaDto extends CreateSolicitudDesconexionJuridicaDto {}

export class CreateCambioMedidorJuridicaDto extends CreateSolicitudCambioMedidorJuridicaDto {}

export class CreateAsociadoJuridicaDto extends CreateSolicitudAsociadoJuridicaDto {}
