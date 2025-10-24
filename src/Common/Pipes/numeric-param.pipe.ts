import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class NumericParamPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'number') {
      if (Number.isInteger(value) && value > 0) return value;
      throw new BadRequestException(`Id inválido: ${value}. Se esperaba un entero positivo.`);
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      // Evitar valores vacíos
      if (trimmed === '') throw new BadRequestException(`Id inválido: (vacío). Se esperaba un entero positivo.`);

      const parsed = Number(trimmed);
      if (!Number.isNaN(parsed) && Number.isInteger(parsed) && parsed > 0) return parsed;
    }

    throw new BadRequestException(`Id inválido: ${JSON.stringify(value)}. Se esperaba un entero positivo.`);
  }
}