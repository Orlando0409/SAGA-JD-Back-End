import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateSolicitudAfiliacionFisicaDto, CreateSolicitudAsociadoFisicaDto, CreateSolicitudCambioMedidorFisicaDto, CreateSolicitudDesconexionFisicaDto, CreateSolicitudFisicaDto } from "./CreateSolicitudFisica.dto";

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
    OmitType(CreateSolicitudDesconexionFisicaDto, ['Identificacion'])
) {}

export class UpdateSolicitudAsociadoFisicaDto extends PartialType(
    OmitType(CreateSolicitudAsociadoFisicaDto, ['Identificacion'])
) {}