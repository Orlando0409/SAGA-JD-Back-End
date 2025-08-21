import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsObject } from "class-validator";

export class CreateRolesDto {
  @ApiProperty({
    example: "Administrador"
  })
  
  @IsString()
  @IsNotEmpty()
  Nombre_Rol: string;

  @ApiProperty({
    example: {
      "Usuarios": { "ver": true, "editar": false },
      "Reportes": { "ver": true, "editar": true },
      "Configuracion": { "ver": false, "editar": false }
    },
    description: 'Permisos en formato JSON por módulo'
  })
  @IsObject()
  @IsNotEmpty()
  permisos: any;
}