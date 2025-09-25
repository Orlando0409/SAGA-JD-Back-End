import { PartialType } from "@nestjs/swagger";
import { CreateCategoriaMaterialDto } from "./CreateCategoriaMaterial.dto";

export class UpdateCategoriaMaterialDto extends PartialType(CreateCategoriaMaterialDto) {}
