import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FAQService } from './faq.service';
import { FAQController } from './faq.controller';
import { FAQEntity } from './FAQEntities/FAQ.Entity';
import { UsuariosModule } from '../Usuarios/Modules/usuarios.module';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { AuditoriaModule } from '../Auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([FAQEntity, Usuario]), UsuariosModule, AuditoriaModule],
  providers: [FAQService],
  controllers: [FAQController],
  exports: [FAQService],
})
export class FAQModule {}