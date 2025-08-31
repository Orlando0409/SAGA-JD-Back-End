import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDropboxFileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  FolderId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  FileName: string;
}