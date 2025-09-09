import { PartialType } from "@nestjs/swagger";
import { CreateSolicitudJuridicaDto, CreateSolicitudAfiliacionJuridicaDto, CreateSolicitudCambioMedidorJuridicaDto, CreateSolicitudDesconexionJuridicaDto, CreateSolicitudAsociadoJuridicaDto } from "./CreateSolicitudJuridica.dto";

export class UpdateSolicitudJuridicaDto extends PartialType(CreateSolicitudJuridicaDto) {}

export class UpdateSolicitudAfiliacionJuridicaDto extends PartialType(CreateSolicitudAfiliacionJuridicaDto) {}

export class UpdateSolicitudCambioMedidorJuridicaDto extends PartialType(CreateSolicitudCambioMedidorJuridicaDto) {}

export class UpdateSolicitudDesconexionJuridicaDto extends PartialType(CreateSolicitudDesconexionJuridicaDto) {}

export class UpdateSolicitudAsociadoJuridicaDto extends PartialType(CreateSolicitudAsociadoJuridicaDto) {}