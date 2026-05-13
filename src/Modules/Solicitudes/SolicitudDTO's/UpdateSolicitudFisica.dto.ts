import { IntersectionType, OmitType, PartialType } from "@nestjs/swagger";
import { CreateSolicitudAfiliacionFisicaDto, CreateSolicitudAgregarMedidorFisicaDto, CreateSolicitudAsociadoFisicaDto, CreateSolicitudCambioMedidorFisicaDto, CreateSolicitudDesconexionFisicaDto, CreateSolicitudFisicaDto } from "./CreateSolicitudFisica.dto";

export class UpdateSolicitudFisicaDto extends PartialType(
    OmitType(CreateSolicitudFisicaDto, ['Identificacion'])
) {}

export class UpdateSolicitudAfiliacionFisicaDto extends PartialType(
    OmitType(CreateSolicitudAfiliacionFisicaDto, ['Identificacion'])
) {}

export class UpdateSolicitudCambioMedidorFisicaDto extends PartialType(
    OmitType(CreateSolicitudCambioMedidorFisicaDto, ['Identificacion'])
) {}

export class UpdateSolicitudDesconexionFisicaDto extends PartialType(
    IntersectionType(
        IntersectionType(
            OmitType(CreateSolicitudDesconexionFisicaDto, ['Identificacion']),
            OmitType(CreateSolicitudFisicaDto, ['Identificacion', 'Tipo_Identificacion'])
        ),
        OmitType(CreateSolicitudAfiliacionFisicaDto, [
            'Identificacion',
            'Tipo_Identificacion',
            'Nombre',
            'Apellido1',
            'Apellido2',
            'Correo',
            'Numero_Telefono',
            'Edad'
        ])
    )
) {}

export class UpdateSolicitudAsociadoFisicaDto extends PartialType(
    OmitType(CreateSolicitudAsociadoFisicaDto, ['Identificacion'])
) {}

export class UpdateSolicitudAgregarMedidorFisicaDto extends PartialType(
    OmitType(CreateSolicitudAgregarMedidorFisicaDto, ['Identificacion'])
) {}