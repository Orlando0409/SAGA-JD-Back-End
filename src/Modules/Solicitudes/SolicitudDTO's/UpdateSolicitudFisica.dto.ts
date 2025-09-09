import { PartialType } from "@nestjs/swagger";
import { CreateSolicitudAfiliacionFisicaDto, CreateSolicitudAsociadoFisicaDto, CreateSolicitudCambioMedidorFisicaDto, CreateSolicitudDesconexionFisicaDto, CreateSolicitudFisicaDto } from "./CreateSolicitudFisica.dto";

export class UpdateSolicitudFisicaDto extends PartialType(CreateSolicitudFisicaDto) {}

export class UpdateSolicitudAfiliacionFisicaDto extends PartialType(CreateSolicitudAfiliacionFisicaDto) {}

export class UpdateSolicitudCambioMedidorFisicaDto extends PartialType(CreateSolicitudCambioMedidorFisicaDto) {}

export class UpdateSolicitudDesconexionFisicaDto extends PartialType(CreateSolicitudDesconexionFisicaDto) {}

export class UpdateSolicitudAsociadoFisicaDto extends PartialType(CreateSolicitudAsociadoFisicaDto) {}