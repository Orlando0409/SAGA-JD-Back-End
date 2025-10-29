import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {IsDefined,IsNotEmpty,IsString,Matches,MaxLength,MinLength,} from 'class-validator';

export class CreateManualDto {

  @ApiProperty({
    example: 'Manual de Usuario del Sistema SAGA',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsDefined({ message: 'El nombre es obligatorio.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(5, { message: 'El nombre debe tener al menos 5 caracteres.' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres.' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s!?¿¡().,-]+$/, {
    message:
      'El nombre solo puede contener letras, números, espacios y los caracteres !?¿¡().,-',
  })
  @Transform(({ value }) =>
    value?.trim()
      ? value.trim()[0].toUpperCase() + value.trim().slice(1).toLowerCase()
      : value,
  )
  Nombre_Manual: string;
}
