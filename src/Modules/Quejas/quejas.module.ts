import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuejasController } from './quejas.controller';
import { QuejasService } from './quejas.service';
import { QuejasEntity } from './Entity/QuejasEntity';
import { EstadoQueja } from './Entity/EstadoQueja';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { EmailModule } from '../Emails/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([QuejasEntity, EstadoQueja]), DropboxModule, EmailModule],
  controllers: [QuejasController],
  providers: [QuejasService],
})
export class QuejasModule {}
