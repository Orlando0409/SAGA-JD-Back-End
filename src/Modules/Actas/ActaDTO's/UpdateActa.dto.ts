import { PartialType } from "@nestjs/swagger";
import { CreateActaDto } from "./CreateActa.dto";

export class UpdateActaDto extends PartialType(CreateActaDto) {}