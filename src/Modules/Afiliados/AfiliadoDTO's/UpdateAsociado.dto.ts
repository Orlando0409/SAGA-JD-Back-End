import { PartialType } from '@nestjs/swagger';
import { CreateAsociadoDto } from './CreateAsociado.dto';

export class UpdateAsociadoDto extends PartialType(CreateAsociadoDto) {}
