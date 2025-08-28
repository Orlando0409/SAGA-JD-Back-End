import { PartialType } from "@nestjs/swagger";
import { CreateCalidadAguaDto } from "./CreateCalidadAgua";

export class UpdateCalidadAguaDto extends PartialType(CreateCalidadAguaDto) {}