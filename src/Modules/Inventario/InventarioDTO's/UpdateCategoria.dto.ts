import { PartialType } from "@nestjs/swagger";
import { CreateCategoriaDto } from "./CreateCategoria.dto";

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}
