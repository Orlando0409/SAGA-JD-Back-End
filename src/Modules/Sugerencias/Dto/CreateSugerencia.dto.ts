import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSugerenciaDto {
  @IsNotEmpty({ message: 'Mensaje es requerido' })
  @IsString()
  @MaxLength(1000)
  Mensaje: string;

  // Se acepta Adjunto como campo opcional de archivos; no validamos aquí el contenido binario
  @IsOptional()
  Adjunto?: any;
}
