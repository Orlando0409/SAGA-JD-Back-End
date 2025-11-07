import { IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';

export class UpdateImagenDto {
  @IsNotEmpty({ message: 'El nombre de la imagen es obligatorio.' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MaxLength(50, { message: 'El nombre no puede superar los 50 caracteres.' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: 'El nombre solo puede contener letras y espacios.' })
  Nombre_Imagen: string;

}