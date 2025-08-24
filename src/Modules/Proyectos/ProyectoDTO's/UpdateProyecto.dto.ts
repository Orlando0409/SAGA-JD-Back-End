import { PartialType } from "@nestjs/swagger";
import { CreateProyectoDto } from "./CrearProyecto.dto";

export class UpdateProyectoDto extends PartialType(CreateProyectoDto) {}