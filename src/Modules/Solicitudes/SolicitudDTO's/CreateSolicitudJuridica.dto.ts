import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsDefined, IsInt, Min, MinLength, MaxLength, Matches, IsNotEmpty, Max, IsPositive, IsOptional } from "class-validator";
import { IsCedulaJuridicaValida } from "src/Validations/DTO Validators/CedulaJuridica.validator";
import { IsTelefonoValido } from "src/Validations/DTO Validators/NumeroTelefono.validator";

// Función helper para capitalizar cada palabra (para razones sociales que pueden tener múltiples palabras)
const capitalizarCadaPalabra = (value: string): string => {
  if (!value) return value;
  return value
    .trim()
    .split(/\s+/) // Divide por espacios (uno o más)
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(' ');
};

export class CreateSolicitudJuridicaDto {
  @ApiProperty({ example: '3101234567' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La cédula jurídica debe ser un string' })
  @IsDefined({ message: 'La cédula jurídica no puede estar vacía' })
  @IsNotEmpty({ message: 'La cédula jurídica no puede estar vacía' })
  @IsCedulaJuridicaValida()
  Cedula_Juridica: string;

  @ApiProperty({ example: 'Empresa Ejemplo S.A.' })
  @Transform(({ value }) => capitalizarCadaPalabra(value))
  @IsString({ message: 'La razón social debe ser un string' })
  @IsDefined({ message: 'La razón social no puede estar vacía' })
  @IsNotEmpty({ message: 'La razón social no puede estar vacía' })
  @MinLength(2, { message: 'La razón social debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'La razón social no puede tener más de 100 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,&()-]+$/, { message: 'La razón social solo puede contener letras, números, espacios y los caracteres .,&()-' })
  Razon_Social: string;

  @ApiProperty({ example: 'ejemplo@empresa.com' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsDefined({ message: 'El correo no puede estar vacío' })
  @IsNotEmpty({ message: 'El correo no puede estar vacío' })
  @MaxLength(100, { message: 'El correo no puede tener más de 100 caracteres' })
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'El formato del correo electrónico no es válido' })
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
  @Transform(({ value }) => value?.trim().toUpperCase()[0] + value.trim().slice(1).toLowerCase())
  @IsString({ message: 'La dirección debe ser un string' })
  @IsDefined({ message: 'La dirección no puede estar vacía' })
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(255, { message: 'La dirección no puede tener más de 255 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#-]+$/, { message: 'La dirección solo puede contener letras, números, espacios y los caracteres .,-#' })
  Direccion_Exacta: string;
}

export class CreateSolicitudDesconexionJuridicaDto {
  @ApiProperty({ example: '3101234567' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La cédula jurídica debe ser un string' })
  @IsDefined({ message: 'La cédula jurídica no puede estar vacía' })
  @IsNotEmpty({ message: 'La cédula jurídica no puede estar vacía' })
  @IsCedulaJuridicaValida()
  Cedula_Juridica: string;

  @ApiProperty({ example: 'Cierre de oficinas en esa ubicación' })
  @Transform(({ value }) => value?.trim().toUpperCase()[0] + value.trim().slice(1).toLowerCase())
  @IsString({ message: 'El motivo de la solicitud debe ser un string' })
  @IsDefined({ message: 'El motivo de la solicitud no puede estar vacío' })
  @IsNotEmpty({ message: 'El motivo de la solicitud no puede estar vacío' })
  @MinLength(10, { message: 'El motivo de la solicitud debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'El motivo de la solicitud no puede tener más de 500 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,!?¿¡()-]+$/, { message: 'El motivo de la solicitud solo puede contener letras, números, espacios y los caracteres .,!?¿¡()-' })
  Motivo_Desconexion: string;

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'El Id del medidor debe ser un número entero' })
  @IsDefined({ message: 'El Id del medidor no puede estar vacío' })
  @IsNotEmpty({ message: 'El Id del medidor no puede estar vacío' })
  @IsPositive({ message: 'El Id del medidor debe ser positivo' })
  @Min(1, { message: 'El Id del medidor debe ser mayor a 0' })
  Id_Medidor: number;

}

export class CreateSolicitudCambioMedidorJuridicaDto {
  @ApiProperty({ example: 'Medidor dañado por remodelación de oficinas' })
  @Transform(({ value }) => value?.trim().toUpperCase()[0] + value.trim().slice(1).toLowerCase())
  @IsString({ message: 'El motivo de la solicitud debe ser un string' })
  @IsDefined({ message: 'El motivo de la solicitud no puede estar vacío' })
  @IsNotEmpty({ message: 'El motivo de la solicitud no puede estar vacío' })
  @MinLength(10, { message: 'El motivo de la solicitud debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'El motivo de la solicitud no puede tener más de 500 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,!?¿¡()-]+$/, { message: 'El motivo de la solicitud solo puede contener letras, números, espacios y los caracteres .,!?¿¡()-' })
  Motivo_Solicitud: string;

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'El Id del medidor debe ser un número entero' })
  @IsDefined({ message: 'El Id del medidor no puede estar vacío' })
  @IsNotEmpty({ message: 'El Id del medidor no puede estar vacío' })
  @IsPositive({ message: 'El Id del medidor debe ser positivo' })
  @Min(1, { message: 'El Id del medidor debe ser mayor a 0' })
  Id_Medidor: number;

  @ApiProperty({ example: 3, required: false, description: 'ID del nuevo medidor que se asignará al afiliado al aprobar la solicitud' })
  @IsOptional()
  @IsInt({ message: 'El Id del nuevo medidor debe ser un número entero' })
  @IsPositive({ message: 'El Id del nuevo medidor debe ser positivo' })
  @Min(1, { message: 'El Id del nuevo medidor debe ser mayor a 0' })
  Id_Nuevo_Medidor?: number;

   @ApiProperty({ example: '3101234567' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La cédula jurídica debe ser un string' })
  @IsDefined({ message: 'La cédula jurídica no puede estar vacía' })
  @IsNotEmpty({ message: 'La cédula jurídica no puede estar vacía' })
  @IsCedulaJuridicaValida()
  Cedula_Juridica: string;
}

export class CreateSolicitudAsociadoJuridicaDto  {
  @ApiProperty({ example: 'Queremos ser parte de la asociación para contribuir al desarrollo comunitario' })
  @Transform(({ value }) => value?.trim().toUpperCase()[0] + value.trim().slice(1).toLowerCase())
  @IsString({ message: 'El motivo de la solicitud debe ser un string' })
  @IsDefined({ message: 'El motivo de la solicitud no puede estar vacío' })
  @IsNotEmpty({ message: 'El motivo de la solicitud no puede estar vacío' })
  @MinLength(10, { message: 'El motivo de la solicitud debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'El motivo de la solicitud no puede tener más de 500 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,!?¿¡()-]+$/, { message: 'El motivo de la solicitud solo puede contener letras, números, espacios y los caracteres .,!?¿¡()-' })
  Motivo_Solicitud: string;

   @ApiProperty({ example: '3101234567' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La cédula jurídica debe ser un string' })
  @IsDefined({ message: 'La cédula jurídica no puede estar vacía' })
  @IsNotEmpty({ message: 'La cédula jurídica no puede estar vacía' })
  @IsCedulaJuridicaValida()
  Cedula_Juridica: string;
}

export class CreateSolicitudAgregarMedidorJuridicaDto {
  @ApiProperty({ example: '3101234567' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La cédula jurídica debe ser un string' })
  @IsDefined({ message: 'La cédula jurídica no puede estar vacía' })
  @IsNotEmpty({ message: 'La cédula jurídica no puede estar vacía' })
  @IsCedulaJuridicaValida()
  Cedula_Juridica: string;

  @ApiProperty({ example: 3, required: false, description: 'ID del nuevo medidor que se asignará al afiliado al completar la solicitud' })
  @IsOptional()
  @IsInt({ message: 'El Id del nuevo medidor debe ser un número entero' })
  @IsPositive({ message: 'El Id del nuevo medidor debe ser positivo' })
  @Min(1, { message: 'El Id del nuevo medidor debe ser mayor a 0' })
  Id_Nuevo_Medidor?: number;
}

// Usando herencia directa en lugar de IntersectionType para evitar problemas con validadores personalizados
export class CreateAfiliacionJuridicaDto extends CreateSolicitudAfiliacionJuridicaDto {}

export class CreateDesconexionJuridicaDto extends CreateSolicitudDesconexionJuridicaDto {}

export class CreateCambioMedidorJuridicaDto extends CreateSolicitudCambioMedidorJuridicaDto {}

export class CreateAsociadoJuridicaDto extends CreateSolicitudAsociadoJuridicaDto {}

export class CreateAgregarMedidorJuridicaDto extends CreateSolicitudAgregarMedidorJuridicaDto {}
