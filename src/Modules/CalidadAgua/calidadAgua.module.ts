import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { CalidadAgua } from "./CalidadAguaEntities/CalidadAgua.Entity";
import { CalidadAguaController } from "./calidadAgua.controller";
import { CalidadAguaService } from "./calidadAgua.service";
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';

@Module({
    imports: [ TypeOrmModule.forFeature([CalidadAgua]), DropboxModule ],
    controllers: [CalidadAguaController],
    providers: [CalidadAguaService],
})

export class CalidadAguaModule {}