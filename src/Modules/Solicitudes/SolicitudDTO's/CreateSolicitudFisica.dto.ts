import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsEmail, IsDefined, IsInt, Min, MinLength, MaxLength, Matches, IsNotEmpty, Max, IsPositive, IsEnum } from "class-validator";
import { TipoIdentificacion } from "src/Common/Enums/TipoIdentificacion.enum";
import { IsIdentificacionValida } from "src/Validations/Custom Validators/Identificacion.validator";

export class CreateSolicitudFisicaDto {
  @ApiProperty({ example: 'Cedula' })
  @Transform(({ value }) => value?.trim())
  @IsEnum(TipoIdentificacion, { message: `El tipo de identificación debe ser uno de los siguientes: ${Object.values(TipoIdentificacion).join(', ')}` })
  @IsDefined({ message: 'El tipo de identificación no puede estar vacío' })
  Tipo_Identificacion: TipoIdentificacion;
  
  @ApiProperty({ example: '123456789' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  @IsDefined({ message: 'La identificación no puede estar vacía' })
  @IsNotEmpty({ message: 'La identificación no puede estar vacía' })
  @IsString({ message: 'La identificación debe ser un string' })
  @IsIdentificacionValida()
  Identificacion: string;

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

  @ApiProperty({ example: 'Lopez' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El segundo apellido debe ser un string' })
  @MinLength(2, { message: 'El segundo apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El segundo apellido no puede tener más de 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El segundo apellido solo puede contener letras y espacios' })
  Apellido2: string;

  @ApiProperty({ example: 'ejemplo@gmail.com' })
  @Transform(({ value }) => value?.trim())
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  @IsDefined({ message: 'El correo no puede estar vacío' })
  @IsNotEmpty({ message: 'El correo no puede estar vacío' })
  @MaxLength(100, { message: 'El correo no puede tener más de 100 caracteres' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {message: 'El formato del correo electrónico no es válido' })
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
}

export class CreateSolicitudAfiliacionFisicaDto extends CreateSolicitudFisicaDto {
  @ApiProperty({ example: '200 metros del perro echado' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La dirección debe ser un string' })
  @IsDefined({ message: 'La dirección no puede estar vacía' })
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(255, { message: 'La dirección no puede tener más de 255 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#-]+$/, { message: 'La dirección solo puede contener letras, números, espacios y los caracteres .,-#' })
  Direccion_Exacta: string;

  @ApiProperty({ example: 18 })
  @IsInt({ message: 'La edad debe ser un numero entero' })
  @IsDefined({ message: 'La edad no puede estar vacia' })
  @IsNotEmpty({ message: 'La edad no puede estar vacía' })
  @Min(18, { message: 'La edad mínima para realizar la solicitud es 18 años' })
  @Max(120, { message: 'La edad máxima permitida es 120 años' })
  @IsPositive({ message: 'La edad debe ser un número positivo' })
  Edad: number;
}

export class CreateSolicitudDesconexionFisicaDto extends CreateSolicitudFisicaDto {
  @ApiProperty({ example: '200 metros del perro echado' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La dirección debe ser un string' })
  @IsDefined({ message: 'La dirección no puede estar vacía' })
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(255, { message: 'La dirección no puede tener más de 255 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#-]+$/, { message: 'La dirección solo puede contener letras, números, espacios y los caracteres .,-#' })
  Direccion_Exacta: string;

  @ApiProperty({ example: 'Para mi casa de campo nueva' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El motivo de la solicitud debe ser un string' })
  @IsDefined({ message: 'El motivo de la solicitud no puede estar vacío' })
  @IsNotEmpty({ message: 'El motivo de la solicitud no puede estar vacío' })
  @MinLength(10, { message: 'El motivo de la solicitud debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'El motivo de la solicitud no puede tener más de 500 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,!?¿¡()-]+$/, { message: 'El motivo de la solicitud solo puede contener letras, números, espacios y los caracteres .,!?¿¡()-' })
  Motivo_Solicitud: string;
}

export class CreateSolicitudCambioMedidorFisicaDto extends CreateSolicitudFisicaDto {
  @ApiProperty({ example: '200 metros del perro echado' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La dirección debe ser un string' })
  @IsDefined({ message: 'La dirección no puede estar vacía' })
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(255, { message: 'La dirección no puede tener más de 255 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#-]+$/, { message: 'La dirección solo puede contener letras, números, espacios y los caracteres .,-#' })
  Direccion_Exacta: string;

  @ApiProperty({ example: 'Para mi casa de campo nueva' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El motivo de la solicitud debe ser un string' })
  @IsDefined({ message: 'El motivo de la solicitud no puede estar vacío' })
  @IsNotEmpty({ message: 'El motivo de la solicitud no puede estar vacío' })
  @MinLength(10, { message: 'El motivo de la solicitud debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'El motivo de la solicitud no puede tener más de 500 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,!?¿¡()-]+$/, { message: 'El motivo de la solicitud solo puede contener letras, números, espacios y los caracteres .,!?¿¡()-' })
  Motivo_Solicitud: string;

  @ApiProperty({example: 456789})
  @IsInt({message: 'El numero de medidor anterior debe ser un numero entero'})
  @IsDefined({message: 'El numero de medidor anterior no puede estar vacio'})
  @IsNotEmpty({ message: 'El número de medidor anterior no puede estar vacío' })
  @IsPositive({ message: 'El número de medidor anterior debe ser positivo' })
  @Min(1, { message: 'El número de medidor anterior debe ser mayor a 0' })
  @Max(9999999, { message: 'El número de medidor anterior no puede ser mayor a 9,999,999' })
  Numero_Medidor_Anterior: number;
}

export class CreateSolicitudAsociadoFisicaDto extends CreateSolicitudFisicaDto {
  @ApiProperty({ example: 'Para mi casa de campo nueva' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El motivo de la solicitud debe ser un string' })
  @IsDefined({ message: 'El motivo de la solicitud no puede estar vacío' })
  @IsNotEmpty({ message: 'El motivo de la solicitud no puede estar vacío' })
  @MinLength(10, { message: 'El motivo de la solicitud debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'El motivo de la solicitud no puede tener más de 500 caracteres' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,!?¿¡()-]+$/, { message: 'El motivo de la solicitud solo puede contener letras, números, espacios y los caracteres .,!?¿¡()-' })
  Motivo_Solicitud: string;
}

export class CreateAfiliacionFisicaDto extends IntersectionType(
  CreateSolicitudFisicaDto,
  CreateSolicitudAfiliacionFisicaDto
) {}

export class CreateDesconexionFisicaDto extends IntersectionType(
  CreateSolicitudFisicaDto,
  CreateSolicitudDesconexionFisicaDto
) {}

export class CreateCambioMedidorFisicaDto extends IntersectionType(
  CreateSolicitudFisicaDto,
  CreateSolicitudCambioMedidorFisicaDto
) {}

export class CreateAsociadoFisicaDto extends IntersectionType(
  CreateSolicitudFisicaDto,
  CreateSolicitudAsociadoFisicaDto
) {}