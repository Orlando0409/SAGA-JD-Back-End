import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateDropboxFileDto {
  @ApiProperty()
  @IsNotEmpty()
  Tipo: 'plano' | 'escritura';
}