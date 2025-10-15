import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSugerenciaDto {
  @IsNotEmpty({ message: 'Mensaje es requerido' })
  @IsString()
  @MaxLength(50)
  Mensaje: string;

  @IsOptional()
  Adjunto?: any;
}
