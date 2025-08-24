import { PartialType } from "@nestjs/swagger";
import { CreateProyectoDto } from "./CreaProyecto.dto";

export class UpdateProyectoDto extends PartialType(CreateProyectoDto) {}