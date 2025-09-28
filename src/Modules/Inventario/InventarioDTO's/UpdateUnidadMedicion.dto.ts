import { PartialType } from "@nestjs/swagger";
import { CreateUnidadMedicionDto } from "./CreateUnidadMedicion.dto";

export class UpdateUnidadMedicionDto extends PartialType(CreateUnidadMedicionDto) {}