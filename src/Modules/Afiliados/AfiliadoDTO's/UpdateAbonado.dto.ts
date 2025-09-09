import { PartialType } from '@nestjs/swagger';
import { CreateAbonadoDto } from './CreateAbonado.dto';

export class UpdateAbonadoDto extends PartialType(CreateAbonadoDto) {}
