import { PartialType } from "@nestjs/swagger";
import { CreateSolicitudDto } from "./CreateSolicitud.dto";

export class UpdateProyectoDto extends PartialType(CreateSolicitudDto){}