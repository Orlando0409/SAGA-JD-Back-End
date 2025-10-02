import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAfiliadoFisicoDto, CreateAfiliadoJuridicoDto } from './CreateAfiliado.dto';

/*export class UpdateAfiliadoFisicoDto extends PartialType(
   // OmitType(CreateAfiliadoFisicoDto, ['Identificacion'] as const),
) {}

export class UpdateAfiliadoJuridicoDto extends PartialType(
   // OmitType(CreateAfiliadoJuridicoDto, ['Cedula_Juridica'] as const),
) {}*/

  // UpdateAfiliado.dto.ts - SOLUCIÓN RECOMENDADA
export class UpdateAfiliadoFisicoDto extends PartialType(CreateAfiliadoFisicoDto) {}

export class UpdateAfiliadoJuridicoDto extends PartialType(CreateAfiliadoJuridicoDto) {} 