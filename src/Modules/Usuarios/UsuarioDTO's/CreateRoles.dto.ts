import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateRolesDto {
  @ApiProperty({ example: "Administrador" })
  @IsString({ message: "El nombre del rol debe ser un string" })
  @IsNotEmpty({ message: "El nombre del rol no puede estar vacío" })
  Nombre_Rol: string;

  @ApiProperty({ example: [1, 2, 3], description: 'Array de IDs de permisos a asignar al rol', type: [Number] })
  @IsArray({ message: 'Los IDs de permisos deben ser un array' })
  @IsNumber({}, { each: true, message: 'Cada ID de permiso debe ser un número' })
  @IsOptional()
  IDS_Permisos?: number[];
}