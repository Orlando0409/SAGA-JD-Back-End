import { PartialType } from "@nestjs/swagger";
import { CreateSolicitudAfiliacionDto, CreateSolicitudAsociadoDto, CreateSolicitudCambioMedidorDto, CreateSolicitudDesconexionDto, CreateSolicitudDto } from "./CreateSolicitud.dto";

export class UpdateSolicitudDto extends PartialType(CreateSolicitudDto) {}

export class UpdateSolicitudAfiliacionDto extends PartialType(CreateSolicitudAfiliacionDto){}

export class UpdateSolicitudCambioMedidorDto extends PartialType(CreateSolicitudCambioMedidorDto){}

export class UpdateSolicitudDesconexionDto extends PartialType(CreateSolicitudDesconexionDto){}

export class UpdateSolicitudAsociadoDto extends PartialType(CreateSolicitudAsociadoDto) {}