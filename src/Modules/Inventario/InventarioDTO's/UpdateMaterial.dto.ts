import { PartialType } from "@nestjs/swagger";
import { CreateMaterialDto } from "./CreateMaterial.dto";

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {}