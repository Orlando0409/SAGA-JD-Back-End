import { PartialType } from "@nestjs/swagger";
import { CreateProyectoDto } from "./CreateProyecto.dto";

export class UpdateProyectoDto extends PartialType(CreateProyectoDto) {}