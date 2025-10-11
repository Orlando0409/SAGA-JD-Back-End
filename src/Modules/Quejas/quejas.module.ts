import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuejasController } from './quejas.controller';
import { QuejasService } from './quejas.service';
import { Queja } from './QuejaEntities/Queja.Entity';
import { EstadoQueja } from './QuejaEntities/EstadoQueja.Entity';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Queja, EstadoQueja]), DropboxModule],
  controllers: [QuejasController],
  providers: [QuejasService],
})
export class QuejasModule {}
