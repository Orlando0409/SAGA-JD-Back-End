import { PartialType } from "@nestjs/swagger";  
import { CreateRolesDto } from "./CreateRoles.dto";

export class UpdateRolesDto extends PartialType(CreateRolesDto) {}