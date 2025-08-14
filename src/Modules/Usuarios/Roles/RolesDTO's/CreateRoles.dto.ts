import { ApiProperty } from "@nestjs/swagger";
import {IsNotEmpty, IsString } from "class-validator";

export class CreateRolesDto {
  @ApiProperty({
    example: "Administrador"
  })
  
  @IsString()
  @IsNotEmpty()
  Nombre_Rol: string;
}