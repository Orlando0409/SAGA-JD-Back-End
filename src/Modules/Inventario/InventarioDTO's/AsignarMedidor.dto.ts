import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsEnum, IsInt } from "class-validator";
import { EstadoPagoMedidor } from "src/Common/Enums/EstadoPagoMedidor.enum";
import { TipoEntidad } from "src/Common/Enums/TipoEntidad.enum";

export class AsignarMedidorDTO {
    @ApiProperty({ example: 1 })
    @IsDefined({ message: 'El ID del medidor no puede estar vacio' })
    @IsInt({ message: 'El ID del medidor debe ser un número entero' })
    Id_Medidor: number;

    @ApiProperty({ example: 1 })
    @IsDefined({ message: 'El ID del tipo de entidad no puede estar vacio' })
    @IsEnum(TipoEntidad, { message: 'El tipo de entidad debe ser 1 (Física) o 2 (Jurídica)' })
    Id_Tipo_Entidad: TipoEntidad;

    @ApiProperty({ example: 1 })
    @IsDefined({ message: 'El ID de la solicitud no puede estar vacio' })
    @IsInt({ message: 'El ID de la solicitud debe ser un número entero' })
    Id_Solicitud: number;

    @ApiProperty({
        description: 'Estado de pago del medidor al asignarlo a la solicitud',
        enum: [EstadoPagoMedidor.Pagado, EstadoPagoMedidor.Pendiente],
        example: EstadoPagoMedidor.Pendiente
    })
    @IsDefined({ message: 'El Estado_Pago es obligatorio al asignar un medidor' })
    @IsEnum(EstadoPagoMedidor, { message: 'Estado_Pago debe ser Pagado o Pendiente' })
    Estado_Pago: EstadoPagoMedidor;
}