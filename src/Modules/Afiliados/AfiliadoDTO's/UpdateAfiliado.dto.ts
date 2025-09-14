import { PartialType } from '@nestjs/swagger';
import { CreateAfiliadoDto, CreateAfiliadoFisicoDto, CreateAfiliadoJuridicoDto } from './CreateAfiliado.dto';

export class UpdateAfiliadoDto extends PartialType(CreateAfiliadoDto) {}

export class UpdateAfiliadoFisicoDto extends PartialType(CreateAfiliadoFisicoDto) {}

export class UpdateAfiliadoJuridicoDto extends PartialType(CreateAfiliadoJuridicoDto) {}