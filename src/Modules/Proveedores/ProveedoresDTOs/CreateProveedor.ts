import { IsString, IsNotEmpty, IsNumber, Min, MaxLength, IsPositive, Matches} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProveedorFisicoDto {

  @ApiProperty({ example: "Nombre Apellido"})
  @IsString({ message: "El nombre debe ser un texto" })
  @IsNotEmpty({ message: "El nombre no puede estar vacío" })
  @MaxLength(50, { message: "El nombre no debe superar los 50 caracteres" })
  @Matches(/\S/, { message: "El nombre no puede contener solo espacios" })
  Nombre_Proveedor: string;

  @ApiProperty({ example: 12345678})
  @IsNotEmpty({ message: "El teléfono es obligatorio" })
  @IsNumber({}, { message: "El teléfono debe ser un número" })
  @Min(10000000, { message: "El teléfono debe tener al menos 8 dígitos" })
  Telefono_Proveedor: number;

  @ApiProperty({ example: 123456789})
  @IsNotEmpty({ message: "La cédula es obligatoria" })
  @IsNumber({}, { message: "La cédula debe ser un número" })
  @Min(100000000, { message: "La cédula debe tener al menos 9 dígitos" })
  Cedula_Fisica: number;

  @ApiProperty({ example: 1, description: "Estado del proveedor (1 = Activo, 2 = Inactivo)" })
  @IsNumber({}, { message: "El estado debe ser un número" })
  @IsPositive({ message: "El estado debe ser mayor a 0" })
  Id_EstadoProveedor: number;
}

export class CreateProveedorJuridicoDto {
  @ApiProperty({ example: "Nombre Apellido"})
  @IsString({ message: "El nombre debe ser un texto" })
  @IsNotEmpty({ message: "El nombre no puede estar vacío" })
  @MaxLength(50, { message: "El nombre no debe superar los 50 caracteres" })
  @Matches(/\S/, { message: "El nombre no puede contener solo espacios" })
  Nombre_Proveedor: string;

  @ApiProperty({ example: 12345678})
  @IsNotEmpty({ message: "El teléfono es obligatorio" })
  @IsNumber({}, { message: "El teléfono debe ser un número" })
  @Min(10000000, { message: "El teléfono debe tener al menos 8 dígitos" })
  Telefono_Proveedor: number;

  @ApiProperty({ example: 12345678})
  @IsNumber({}, { message: "La cédula debe ser un número" })
  @IsNotEmpty({ message: "La cédula es obligatoria" })
  @Min(10000000, { message: "La cédula debe tener al menos 8 dígitos" })
  Cedula_Juridica: number;

  @ApiProperty({ example: "Empresa S.A"})
  @IsString({ message: "La razón social debe ser un texto" })
  @IsNotEmpty({ message: "La razón social no puede estar vacía" })
  @MaxLength(150, { message: "La razón social no debe superar los 150 caracteres" })
  @Matches(/\S/, { message: "La razon social no puede contener solo espacios" })
  Razon_social: string;

  @ApiProperty({ example: 1})
  @IsNumber({}, { message: "El estado debe ser un número" })
  @IsPositive({ message: "El estado debe ser mayor a 0" })
  Id_EstadoProveedor: number;
}
