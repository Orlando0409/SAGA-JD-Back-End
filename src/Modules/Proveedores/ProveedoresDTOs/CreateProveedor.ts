import { IsString, IsNotEmpty, IsNumber, Min, MaxLength, IsPositive, Matches} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProveedorFisicoDto {

  @ApiProperty({ example: "Nombre Apellido"})
  @IsString({ message: "El nombre debe ser un texto" })
  @IsNotEmpty({ message: "El nombre no puede estar vacío" })
  @MaxLength(50, { message: "El nombre no debe superar los 50 caracteres" })
  @Matches(/\S/, { message: "El nombre no puede contener solo espacios" })
  Nombre_Proveedor: string;

  @ApiProperty({ 
    example: "+0 000 000-000 o +506 0000-0000", 
  })
  @IsNotEmpty({ message: "El teléfono es obligatorio" })
  @IsString({ message: "El teléfono debe ser un texto" })
  @MaxLength(20, { message: "El teléfono no puede tener más de 20 caracteres" })
  @Matches(/^(\+?[1-9][\d\s\-]{1,15}[0-9]|[0-9]{7,10})$/, { 
    message: "El teléfono debe tener un formato válido y tamaño apropiado" 
  })
  Telefono_Proveedor: string;

  @ApiProperty({ 
    example: "0-000-000000",  
  })
  @IsNotEmpty({ message: "El documento de identidad es obligatorio" })
  @IsString({ message: "El documento debe ser texto" })
  @MaxLength(20, { message: "El documento no puede tener más de 20 caracteres" })
  @Matches(/^[A-Z0-9\-\s]{3,20}$/i, { 
    message: "Formato de documento inválido." 
  })
  Cedula_Fisica: string;

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

  @ApiProperty({ 
    example: "+0 000 000-0000 o +506 0000-0000", 
  })
  @IsString({ message: "El teléfono debe ser un texto" })
  @MaxLength(20, { message: "El teléfono no puede tener más de 20 caracteres" })
  @Matches(/^(\+?[1-9][\d\s\-]{1,15}[0-9]|[0-9]{7,10})$/, { 
    message: "El teléfono debe tener un formato válido y tamaño apropiado" 
  })
  Telefono_Proveedor: string;

  @ApiProperty({ 
    example: "0-000-000000", 
  })
  @IsNotEmpty({ message: "La cédula jurídica es obligatoria" })
  @IsString({ message: "La cédula jurídica debe ser texto" })
  @MaxLength(25, { message: "La cédula jurídica no puede tener más de 25 caracteres" })
  @Matches(/^[A-Z0-9\-\s]{3,25}$/i, { 
    message: "Formato de cédula jurídica inválido" 
  })
  Cedula_Juridica: string;

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
