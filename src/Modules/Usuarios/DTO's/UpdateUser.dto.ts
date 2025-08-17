import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from "../DTO's/CreateUser.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {}
