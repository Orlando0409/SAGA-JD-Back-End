import { PartialType } from '@nestjs/swagger';
import { CreateAsociadoDto, CreateAsociadoFisicoDto, CreateAsociadoJuridicoDto } from './CreateAsociado.dto';

export class UpdateAsociadoDto extends PartialType(CreateAsociadoDto) {}

export class UpdateAsociadoFisicoDto extends PartialType(CreateAsociadoFisicoDto) {}

export class UpdateAsociadoJuridicoDto extends PartialType(CreateAsociadoJuridicoDto) {}