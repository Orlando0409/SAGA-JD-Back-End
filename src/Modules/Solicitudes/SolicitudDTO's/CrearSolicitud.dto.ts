import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { IsString, IsEmail, Length, IsDefined, IsInt } from "class-validator";

export class CrearSolicitudDto {
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

  @ApiProperty({example: '200 metros del perro echado'})
  @IsString()
  @IsDefined({message: 'La direccion no puede estar vacia'})
  Direccion_Exacta: string;

  @ApiProperty({example: 'Para mi casa de campo nueva'})
  @IsString({message: 'El motivo de la solicitud debe ser un string'})
  @IsDefined({message: 'El motivo de la solicitud no puede estar vacio'})
  Motivo_Solicitud: string;

  // El estado inicial lo puedes poner en el service si siempre empieza igual
  @ApiProperty({example: 1})
  @IsInt({message: 'El ID del estado de la solicitud debe ser un numero entero'})
  @IsDefined({message: 'El ID del estado de la solicitud no puede estar vacio'})
  Id_Estado_Solicitud: number;
}

export class CrearSolicitudAfiliacionDto extends CrearSolicitudDto {
  @ApiProperty({example: 'url_o_base64_de_los_planos'})
  @IsString({message: 'Los planos del terreno deben ser un string'})
  @IsDefined({message: 'Los planos del terreno no pueden estar vacios'})
  PlanosTerreno: string;

  @ApiProperty({example: 'url_o_base64_de_la_escritura'})
  @IsString({message: 'La escritura del terreno debe ser un string'})
  @IsDefined({message: 'La escritura del terreno no puede estar vacia'})
  EscrituraTerreno: string;
}

export class CrearSolicitudCambioMedidorDto extends CrearSolicitudDto {
  @ApiProperty({example: 'Calle 123, Ciudad'})
  @IsString({message: 'La ubicacion debe ser un string'})
  @IsDefined({message: 'La ubicacion no puede estar vacia'})
  Ubicacion: string;

  @ApiProperty({example: 456789})
  @IsInt({message: 'El numero de medidor anterior debe ser un numero entero'})
  @IsDefined({message: 'El numero de medidor anterior no puede estar vacio'})
  Numero_Medidor_Anterior: number;
}

export class CrearSolicitudDesconexionDto extends CrearSolicitudDto {
  @ApiProperty({example: 'url_o_base64_de_los_planos'})
  @IsString({message: 'Los planos del terreno deben ser un string'})
  @IsDefined({message: 'Los planos del terreno no pueden estar vacios'})
  PlanosTerreno: string;

  @ApiProperty({example: 'url_o_base64_de_la_escritura'})
  @IsString({message: 'La escritura del terreno debe ser un string'})
  @IsDefined({message: 'La escritura del terreno no puede estar vacia'})
  EscrituraTerreno: string;
}

export class CreateCambioMediadorDto extends IntersectionType(
  CrearSolicitudDto,
  CrearSolicitudAfiliacionDto
) {}

export class CreateAfiliacionDto extends IntersectionType(
  CrearSolicitudDto,
  CrearSolicitudCambioMedidorDto
) {}

export class CreateDesconexionDto extends IntersectionType(
  CrearSolicitudDto,
  CrearSolicitudDesconexionDto
) {}