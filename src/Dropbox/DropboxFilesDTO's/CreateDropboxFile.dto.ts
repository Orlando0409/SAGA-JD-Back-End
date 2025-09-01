import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class CreateDropboxFileDto {
  @ApiProperty({ enum: ['plano', 'escritura'] })
  @IsIn(['plano', 'escritura'])
  Tipo: 'plano' | 'escritura';
}