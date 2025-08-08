import { Module } from '@nestjs/common';
import { AbonadosService } from './abonados.service';

@Module({
  providers: [AbonadosService],
})
export class AbonadosModule {}
