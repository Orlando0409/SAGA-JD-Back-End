import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateSolicitudJuridicaDto, CreateSolicitudAfiliacionJuridicaDto, CreateSolicitudAgregarMedidorJuridicaDto, CreateSolicitudCambioMedidorJuridicaDto, CreateSolicitudDesconexionJuridicaDto, CreateSolicitudAsociadoJuridicaDto } from "./CreateSolicitudJuridica.dto";

export class UpdateSolicitudJuridicaDto extends PartialType(
    OmitType(CreateSolicitudJuridicaDto, ['Cedula_Juridica'])
) {}

export class UpdateSolicitudAfiliacionJuridicaDto extends PartialType(
    OmitType(CreateSolicitudAfiliacionJuridicaDto, ['Cedula_Juridica'])
) {}

export class UpdateSolicitudCambioMedidorJuridicaDto extends PartialType(
    OmitType(CreateSolicitudCambioMedidorJuridicaDto, ['Cedula_Juridica'])
) {}

export class UpdateSolicitudDesconexionJuridicaDto extends PartialType(
    OmitType(CreateSolicitudDesconexionJuridicaDto, ['Cedula_Juridica'])
) {}

export class UpdateSolicitudAsociadoJuridicaDto extends PartialType(
    OmitType(CreateSolicitudAsociadoJuridicaDto, ['Cedula_Juridica'])
) {}

export class UpdateSolicitudAgregarMedidorJuridicaDto extends PartialType(
    OmitType(CreateSolicitudAgregarMedidorJuridicaDto, ['Cedula_Juridica'])
) {}