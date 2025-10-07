import { PartialType } from '@nestjs/swagger';
import { UsuarioDTO } from "./CreateUser.dto";

export class UpdateUsuarioDto extends PartialType(UsuarioDTO) {}
