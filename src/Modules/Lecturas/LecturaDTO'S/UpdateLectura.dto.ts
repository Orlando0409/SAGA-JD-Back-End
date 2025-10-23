import { PartialType } from "@nestjs/swagger";
import { CreateLecturaDTO } from "./CreateLectura.dto";

export class UpdateLecturaDTO extends PartialType(CreateLecturaDTO) {}