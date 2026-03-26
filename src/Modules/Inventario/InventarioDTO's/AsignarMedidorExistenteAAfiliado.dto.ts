import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsEnum, IsInt } from "class-validator";
import { EstadoPagoMedidor } from "src/Common/Enums/EstadoPagoMedidor.enum";

export class AsignarMedidorExistenteAAfiliado {
    @ApiProperty({ example: 1, description: 'ID del medidor disponible a asignar' })
    @IsDefined({ message: 'El ID del medidor no puede estar vacío' })
    @IsInt({ message: 'El ID del medidor debe ser un número entero' })
    Id_Medidor: number;

    @ApiProperty({ example: 5, description: 'ID del afiliado (físico o jurídico) al que se le asignará el medidor' })
    @IsDefined({ message: 'El ID del afiliado no puede estar vacío' })
    @IsInt({ message: 'El ID del afiliado debe ser un número entero' })
    Id_Afiliado: number;

    @ApiProperty({ example: EstadoPagoMedidor.Pagado, enum: [EstadoPagoMedidor.Pagado, EstadoPagoMedidor.Pendiente], description: 'Estado de pago del medidor al momento de asignarlo al afiliado' })
    @IsDefined({ message: 'El Estado_Pago es obligatorio al asignar un medidor' })
    @IsEnum(EstadoPagoMedidor, { message: 'Estado_Pago debe ser Pagado o Pendiente' })
    Estado_Pago: EstadoPagoMedidor;
}
