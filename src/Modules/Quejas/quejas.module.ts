import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuejasController } from './quejas.controller';
import { QuejasService } from './quejas.service';
import { Queja } from './QuejaEntities/QuejasEntity';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { EmailModule } from '../Emails/email.module';
import { EstadoQueja } from './QuejaEntities/EstadoQueja.Entity';
import { UsuariosModule } from '../Usuarios/Modules/usuarios.module';
import { AuditoriaModule } from '../Auditoria/auditoria.module';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';


@Module({
  imports: [TypeOrmModule.forFeature([Queja, EstadoQueja, Usuario]), 
  DropboxModule,
  EmailModule,
  AuditoriaModule,
  UsuariosModule
  ],
  controllers: [QuejasController],
  providers: [QuejasService],
})
export class QuejasModule {}