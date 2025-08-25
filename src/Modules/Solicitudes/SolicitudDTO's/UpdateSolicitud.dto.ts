import { PartialType } from "@nestjs/swagger";
import { CreateSolicitudAfiliacionDto, CreateSolicitudCambioMedidorDto, CreateSolicitudDesconexionDto, CreateSolicitudDto } from "./CreateSolicitud.dto";

export class UpdateSolicitudDto extends PartialType(CreateSolicitudDto) {}

export class UpdateSolicitudAfiliacionDto extends PartialType(CreateSolicitudAfiliacionDto){}

export class UpdateSolicitudCambioMediadorDto extends PartialType(CreateSolicitudCambioMedidorDto){}

export class UpdateSolicitudDesconexionDto extends PartialType(CreateSolicitudDesconexionDto){}