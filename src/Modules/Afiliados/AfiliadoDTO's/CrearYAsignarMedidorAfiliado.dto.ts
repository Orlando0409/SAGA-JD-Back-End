import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt } from "class-validator";

export class CrearYAsignarMedidorAfiliadoDto {
    @ApiProperty({ example: 5, description: 'ID del afiliado al que se le asignara el medidor nuevo' })
    @IsDefined({ message: 'El ID del afiliado no puede estar vacio' })
    @IsInt({ message: 'El ID del afiliado debe ser un numero entero' })
    Id_Afiliado: number;

    @ApiProperty({ example: 123456789, description: 'Numero del medidor a crear y asignar' })
    @IsDefined({ message: 'El numero del medidor no puede estar vacio' })
    @IsInt({ message: 'El numero del medidor debe ser un numero entero' })
    Numero_Medidor: number;
}
