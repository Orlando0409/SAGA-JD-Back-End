import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateSolicitudAfiliacionFisicaDto, CreateSolicitudAsociadoFisicaDto, CreateSolicitudCambioMedidorFisicaDto, CreateSolicitudDesconexionFisicaDto, CreateSolicitudFisicaDto } from "./CreateSolicitudFisica.dto";

export class UpdateSolicitudFisicaDto extends PartialType(
    OmitType(CreateSolicitudFisicaDto, ['Cedula'])
) {}

export class UpdateSolicitudAfiliacionFisicaDto extends PartialType(
    OmitType(CreateSolicitudAfiliacionFisicaDto, ['Cedula'])
) {}

export class UpdateSolicitudCambioMedidorFisicaDto extends PartialType(
    OmitType(CreateSolicitudCambioMedidorFisicaDto, ['Cedula'])
) {}

export class UpdateSolicitudDesconexionFisicaDto extends PartialType(
    OmitType(CreateSolicitudDesconexionFisicaDto, ['Cedula'])
) {}

export class UpdateSolicitudAsociadoFisicaDto extends PartialType(
    OmitType(CreateSolicitudAsociadoFisicaDto, ['Cedula'])
) {}