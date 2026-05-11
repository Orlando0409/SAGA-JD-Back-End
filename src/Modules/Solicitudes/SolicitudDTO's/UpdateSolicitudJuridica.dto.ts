import { IntersectionType, OmitType, PartialType } from "@nestjs/swagger";
import { CreateSolicitudJuridicaDto, CreateSolicitudAfiliacionJuridicaDto, CreateSolicitudAgregarMedidorJuridicaDto, CreateSolicitudCambioMedidorJuridicaDto, CreateSolicitudDesconexionJuridicaDto, CreateSolicitudAsociadoJuridicaDto } from "./CreateSolicitudJuridica.dto";

class UpdateDatosContactoJuridicaDto extends PartialType(
    OmitType(CreateSolicitudJuridicaDto, ['Cedula_Juridica'])
) {}

class UpdateDatosContactoConDireccionJuridicaDto extends PartialType(
    OmitType(CreateSolicitudAfiliacionJuridicaDto, ['Cedula_Juridica'])
) {}

export class UpdateSolicitudJuridicaDto extends PartialType(
    OmitType(CreateSolicitudJuridicaDto, ['Cedula_Juridica'])
) {}

export class UpdateSolicitudAfiliacionJuridicaDto extends PartialType(
    OmitType(CreateSolicitudAfiliacionJuridicaDto, ['Cedula_Juridica'])
) {}

export class UpdateSolicitudDesconexionJuridicaDto extends IntersectionType(
    PartialType(OmitType(CreateSolicitudDesconexionJuridicaDto, ['Cedula_Juridica'])),
    UpdateDatosContactoConDireccionJuridicaDto
) {}

export class UpdateSolicitudCambioMedidorJuridicaDto extends IntersectionType(
    PartialType(OmitType(CreateSolicitudCambioMedidorJuridicaDto, ['Cedula_Juridica'])),
    UpdateDatosContactoConDireccionJuridicaDto
) {}

export class UpdateSolicitudAsociadoJuridicaDto extends IntersectionType(
    PartialType(OmitType(CreateSolicitudAsociadoJuridicaDto, ['Cedula_Juridica'])),
    UpdateDatosContactoJuridicaDto
) {}

export class UpdateSolicitudAgregarMedidorJuridicaDto extends IntersectionType(
    PartialType(OmitType(CreateSolicitudAgregarMedidorJuridicaDto, ['Cedula_Juridica'])),
    UpdateDatosContactoJuridicaDto
) {}