import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateMaterialDto } from "./CreateMaterial.dto";

export class UpdateMaterialDto extends PartialType(
    OmitType(CreateMaterialDto, ['Cantidad'] as const)
) {}