import { ApiProperty } from "@nestjs/swagger";
import { EstadoPagoMedidor } from "src/Common/Enums/EstadoPagoMedidor.enum";
import { IsDefined, IsEnum } from "class-validator";

export class UpdateEstadoPagoMedidorDTO {
    @ApiProperty({
        example: EstadoPagoMedidor.Pagado,
        enum: EstadoPagoMedidor,
        description: 'Nuevo estado de pago del medidor'
    })
    @IsDefined({ message: 'El Estado_Pago es obligatorio' })
    @IsEnum(EstadoPagoMedidor, { message: 'Estado_Pago debe ser Libre, Pagado o Pendiente' })
    Estado_Pago: EstadoPagoMedidor;
}
