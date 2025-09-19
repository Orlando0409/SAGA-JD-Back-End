import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAfiliadoFisicoDto, CreateAfiliadoJuridicoDto } from './CreateAfiliado.dto';

export class UpdateAfiliadoFisicoDto extends PartialType(
    OmitType(CreateAfiliadoFisicoDto, ['Cedula'] as const),
) {}

export class UpdateAfiliadoJuridicoDto extends PartialType(
    OmitType(CreateAfiliadoJuridicoDto, ['Cedula_Juridica'] as const),
) {}