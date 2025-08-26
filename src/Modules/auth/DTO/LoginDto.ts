import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  Nombre_Usuario: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  Password: string;
}