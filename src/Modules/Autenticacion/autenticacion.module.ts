import { Module } from '@nestjs/common';
import { AutenticacionController } from "./autenticacion.controller";
import { AutenticacionService } from './autenticacion.service';
import { UsuariosModule } from '../Usuarios/Module/usuarios.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constans/jwt.constans';

@Module({
    imports: [UsuariosModule,
      JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
],
    controllers: [AutenticacionController],
    providers: [AutenticacionService],
})
export class AutenticacionModule {}
