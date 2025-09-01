import { PartialType } from "@nestjs/swagger";
import { CreateCalidadAguaDto } from "./CreateCalidadAgua.dto";

export class UpdateCalidadAguaDto extends PartialType(CreateCalidadAguaDto) {}