import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { CalidadAgua } from "./CalidadAguaEntities/CalidadAgua.Entity";
import { CalidadAguaController } from "./calidadAgua.controller";
import { CalidadAguaService } from "./calidadAgua.service";

@Module({
    imports: [ TypeOrmModule.forFeature([CalidadAgua])],
    controllers: [CalidadAguaController],
    providers: [CalidadAguaService],
})

export class CalidadAguaModule {}