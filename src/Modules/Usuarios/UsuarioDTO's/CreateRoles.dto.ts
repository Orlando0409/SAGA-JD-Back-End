import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateRolesDto {
  @ApiProperty({
    example: "Administrador"
  })
  
  @IsString()
  @IsNotEmpty()
  Nombre_Rol: string;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'Array de IDs de permisos a asignar al rol',
    type: [Number]
  })
  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  permisosIds?: number[];
}