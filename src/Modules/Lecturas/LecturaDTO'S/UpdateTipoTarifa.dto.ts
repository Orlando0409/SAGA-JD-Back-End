import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt, IsString } from "class-validator";

export abstract class UpdateTipoTarifaDTOs {
    @ApiProperty({ example: 'Residencial' })
    @IsString({ message: 'El nombre del tipo de tarifa debe ser una cadena de texto' })
    @IsDefined({ message: 'El nombre del tipo de tarifa no puede estar vacío' })
    Nombre_Tipo_Tarifa: string;
}

export class UpdateTipoTarifaLecturaDTO extends UpdateTipoTarifaDTOs {
    @ApiProperty({ example: 3500 })
    @IsDefined({ message: 'El cargo fijo por mes no puede estar vacío' })
    @IsInt({ message: 'El cargo fijo por mes debe ser un número entero' })
    Cargo_Fijo_Por_Mes: number;
}

export class UpdateTipoTarifaServicioFijoDTO extends UpdateTipoTarifaDTOs {
    @ApiProperty({ example: 826 })
    @IsDefined({ message: 'El cargo base no puede estar vacío' })
    @IsInt({ message: 'El cargo base debe ser un número entero' })
    Cargo_Base: number;
}

export class UpdateTipoTarifaVentaAguaDTO extends UpdateTipoTarifaDTOs {
    @ApiProperty({ example: 25 })
    @IsDefined({ message: 'El cargo por M3 no puede estar vacío' })
    @IsInt({ message: 'El cargo por M3 debe ser un número entero' })
    Cargo_Por_M3: number;
}