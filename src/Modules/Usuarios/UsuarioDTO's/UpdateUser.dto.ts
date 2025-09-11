import { PartialType } from '@nestjs/swagger';
import { UserDTO } from "./CreateUser.dto";

export class UpdateUserDto extends PartialType(UserDTO) {}
