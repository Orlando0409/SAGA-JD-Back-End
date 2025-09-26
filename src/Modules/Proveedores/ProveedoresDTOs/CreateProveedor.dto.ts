import { IsString, IsNotEmpty, IsNumber, Min, MaxLength, IsPositive, Matches, IsEnum, IsDefined, IsIn} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TipoIdentificacion } from 'src/Common/Enums/TipoIdentificacion.enum';
import { IsIdentificacionValida } from 'src/Validations/DTO Validators/Identificacion.validator';
import { IsTelefonoValido } from 'src/Validations/DTO Validators/NumeroTelefono.validator';
import { IsCedulaJuridicaValida } from 'src/Validations/DTO Validators/CedulaJuridica.validator';

export class CreateProveedorFisicoDto {
  @ApiProperty({ example: "Nombre Apellido"})
  @IsString({ message: "El nombre debe ser un texto" })
  @IsNotEmpty({ message: "El nombre no puede estar vacío" })
  @MaxLength(50, { message: "El nombre no debe superar los 50 caracteres" })
  @Matches(/\S/, { message: "El nombre no puede contener solo espacios" })
  Nombre_Proveedor: string;

  @ApiProperty({ example: '+506-8888-7777' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El número de teléfono debe ser un string' })
  @IsDefined({ message: 'El número de teléfono no puede estar vacío' })
  @IsNotEmpty({ message: 'El número de teléfono no puede estar vacío' })
  @IsTelefonoValido({ message: 'Número de teléfono inválido' })
  Telefono_Proveedor: string;

  @ApiProperty({ example: 'Cedula', description: 'Tipos permitidos para proveedores físicos: Cedula Nacional, Dimex, Pasaporte' })
  @Transform(({ value }) => value?.trim())
  @IsEnum(TipoIdentificacion, { message: `El tipo de identificación debe ser válido` })
  @IsIn([TipoIdentificacion.CEDULA, TipoIdentificacion.DIMEX, TipoIdentificacion.PASAPORTE], 
    { message: 'Para proveedores físicos solo se permiten: Cedula Nacional, Dimex, Pasaporte' })
  @IsDefined({ message: 'El tipo de identificación no puede estar vacío' })
  Tipo_Identificacion: TipoIdentificacion;
  
  @ApiProperty({ example: '123456789' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  @IsDefined({ message: 'La identificación no puede estar vacía' })
  @IsNotEmpty({ message: 'La identificación no puede estar vacía' })
  @IsString({ message: 'La identificación debe ser un string' })
  @IsIdentificacionValida()
  Identificacion: string;

  @ApiProperty({ example: 1, description: "Estado del proveedor (1 = Activo, 2 = Inactivo)" })
  @IsNumber({}, { message: "El estado debe ser un número" })
  @IsPositive({ message: "El estado debe ser mayor a 0" })
  Id_Estado_Proveedor: number;
}

export class CreateProveedorJuridicoDto {
  @ApiProperty({ example: "Nombre Apellido"})
  @IsString({ message: "El nombre debe ser un texto" })
  @IsNotEmpty({ message: "El nombre no puede estar vacío" })
  @MaxLength(50, { message: "El nombre no debe superar los 50 caracteres" })
  @Matches(/\S/, { message: "El nombre no puede contener solo espacios" })
  Nombre_Proveedor: string;

  @ApiProperty({ example: '+506-8888-7777' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El número de teléfono debe ser un string' })
  @IsDefined({ message: 'El número de teléfono no puede estar vacío' })
  @IsNotEmpty({ message: 'El número de teléfono no puede estar vacío' })
  @IsTelefonoValido({ message: 'Número de teléfono inválido' })
  Telefono_Proveedor: string;

  @ApiProperty({ example: 'Cedula', description: 'Para proveedores jurídicos solo se permite: Cedula Juridica' })
  @Transform(({ value }) => value?.trim())
  @IsEnum(TipoIdentificacion, { message: `El tipo de identificación debe ser válido` })
  @IsIn([TipoIdentificacion.CEDULA_JURIDICA], 
    { message: 'Para proveedores jurídicos solo se permite: Cedula Juridica' })
  @IsDefined({ message: 'El tipo de identificación no puede estar vacío' })
  Tipo_Identificacion: TipoIdentificacion;

  @ApiProperty({ example: '0-000-000000', description: 'Formatos válidos: 0-000-000000 o 0 000 000000 o 0--000--000000' })
  @Transform(({ value }) => value?.trim())
  @IsDefined({ message: 'La cédula jurídica no puede estar vacía' })
  @IsNotEmpty({ message: 'La cédula jurídica no puede estar vacía' })
  @IsString({ message: 'La cédula jurídica debe ser un string' })
  @IsCedulaJuridicaValida()
  Identificacion: string;

  @ApiProperty({ example: "Empresa S.A"})
  @IsString({ message: "La razón social debe ser un texto" })
  @IsNotEmpty({ message: "La razón social no puede estar vacía" })
  @MaxLength(150, { message: "La razón social no debe superar los 150 caracteres" })
  @Matches(/\S/, { message: "La razon social no puede contener solo espacios" })
  Razon_Social: string;

  @ApiProperty({ example: 1})
  @IsNumber({}, { message: "El estado debe ser un número" })
  @IsPositive({ message: "El estado debe ser mayor a 0" })
  Id_Estado_Proveedor: number;
}