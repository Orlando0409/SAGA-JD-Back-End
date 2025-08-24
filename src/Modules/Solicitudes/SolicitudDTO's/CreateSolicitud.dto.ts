import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { IsString, IsEmail, Length, IsDefined, IsInt, IsUrl, Min } from "class-validator";

export class CreateSolicitudDto {
  @ApiProperty({example: '123456789'})
  @IsString({message: 'La cedula debe ser tener entre 9 y 12 caracteres'})
  @IsDefined({message: 'La cedula no puede estar vacia'})
  @Length(9, 12)
  Cedula: string;

  @ApiProperty({example: 'Mario'})
  @IsString({message: 'El nombre debe ser un string'})
  @IsDefined({message: 'El nombre no puede estar vacio'})
  Nombre: string;

  @ApiProperty({example: 'Perez'})
  @IsString({message: 'El primer apellido debe ser un string'})
  @IsDefined({message: 'El primer apellido no puede estar vacio'})
  Apellido1: string;

  @ApiProperty({example: 'Lopez'})
  @IsString({message: 'El segundo apellido debe ser un string'})
  @IsDefined({message: 'El segundo apellido no puede estar vacio'})
  Apellido2: string;

  @ApiProperty({example: 'ejemplo@gmail.com'})
  @IsEmail()
  @IsDefined({message: 'El correo no puede estar vacio'})
  Correo: string;

  @ApiProperty({example: 12345678})
  @IsString({message: 'El numero de telefono debe ser un string'})
  @IsDefined({message: 'El numero de telefono no puede estar vacio'})
  Numero_Telefono: string;

  @ApiProperty({example: '200 metros del perro echado'})
  @IsString()
  @IsDefined({message: 'La direccion no puede estar vacia'})
  Direccion_Exacta: string;

  @ApiProperty({example: 'Para mi casa de campo nueva'})
  @IsString({message: 'El motivo de la solicitud debe ser un string'})
  @IsDefined({message: 'El motivo de la solicitud no puede estar vacio'})
  Motivo_Solicitud: string;
}

export class CreateSolicitudAfiliacionDto extends CreateSolicitudDto {

  @ApiProperty({example: 18})
  @IsInt({message: 'La edad debe ser un numero entero'})
  @IsDefined({message: 'La edad no puede estar vacia'})
  @Min(18, ({message: 'La edad mínima para realizar la solicitud es 18 años'}))
  Edad: number;

  @ApiProperty({example: 'https://EjemploPlanos.pdf'})
  @IsString({message: 'Los planos del terreno deben ser un string'})
  //@IsUrl()  // CAMBIAR LUEGO
  @IsString()
  @IsDefined({message: 'Los planos del terreno no pueden estar vacios'})
  Planos_Terreno: string;

  @ApiProperty({example: 'https://EjemploEscritura.pdf'})
  @IsString({message: 'La escritura del terreno debe ser un string'})
  //@IsUrl()  // CAMBIAR LUEGO
  @IsString()
  @IsDefined({message: 'La escritura del terreno no puede estar vacia'})
  Escritura_Terreno: string;
}

export class CreateSolicitudDesconexionDto extends CreateSolicitudDto {
  @ApiProperty({example: 'https://EjemploPlanos.pdf'})
  @IsString({message: 'Los planos del terreno deben ser un string'})
  @IsUrl()
  @IsDefined({message: 'Los planos del terreno no pueden estar vacios'})
  Planos_Terreno: string;

  @ApiProperty({example: 'https://EjemploEscritura.pdf'})
  @IsString({message: 'La escritura del terreno debe ser un string'})
  @IsUrl()
  @IsDefined({message: 'La escritura del terreno no puede estar vacia'})
  Escritura_Terreno: string;
}

export class CreateSolicitudCambioMedidorDto extends CreateSolicitudDto {
  @ApiProperty({example: 'Calle 123, Ciudad'})
  @IsString({message: 'La ubicacion debe ser un string'})
  @IsDefined({message: 'La ubicacion no puede estar vacia'})
  Ubicacion: string;

  @ApiProperty({example: 456789})
  @IsInt({message: 'El numero de medidor anterior debe ser un numero entero'})
  @IsDefined({message: 'El numero de medidor anterior no puede estar vacio'})
  Numero_Medidor_Anterior: number;
}

export class CreateAfiliacionDto extends IntersectionType(
  CreateSolicitudDto,
  CreateSolicitudAfiliacionDto
) {}

export class CreateDesconexionDto extends IntersectionType(
  CreateSolicitudDto,
  CreateSolicitudDesconexionDto
) {}

export class CreateCambioMediadorDto extends IntersectionType(
  CreateSolicitudDto,
  CreateSolicitudCambioMedidorDto
) {}