import { PartialType } from '@nestjs/swagger';
import { CreateAbonadoDto, CreateAbonadoFisicoDto, CreateAbonadoJuridicoDto } from './CreateAbonado.dto';

export class UpdateAbonadoDto extends PartialType(CreateAbonadoDto) {}

export class UpdateAbonadoFisicoDto extends PartialType(CreateAbonadoFisicoDto) {}

export class UpdateAbonadoJuridicoDto extends PartialType(CreateAbonadoJuridicoDto) {}