import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from '../Emails/email.module';
import { AuditoriaModule } from '../Auditoria/auditoria.module';


// Entities
import { Permiso } from '../Usuarios/UsuarioEntities/Permiso.Entity';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { UsuarioRol } from '../Usuarios/UsuarioEntities/UsuarioRol.Entity';

// Controller
import { AuthController } from './Auth.controller';

//Guards
import { PermisosGuard } from './Guard/PermisosGuard';
import { RolesGuard } from './Guard/RolesGuards';
import { JwtAuthGuard } from './Guard/JwtGuard';

//Estrategia
import { JwtStrategy } from './Strategy/jwt.strategy';

//Service
import { AuthService } from './Auth.service';


@Module({
    imports: [
        EmailModule,
        AuditoriaModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule, EmailModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { 
                    expiresIn: configService.get<string>('JWT_EXPIRES_IN')
                },
            }),
        }),
        TypeOrmModule.forFeature([Usuario, UsuarioRol, Permiso]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService, 
        JwtStrategy,
        JwtAuthGuard,
        RolesGuard,
        PermisosGuard
    ],
    exports: [
        AuthService, 
        JwtAuthGuard, 
        RolesGuard, 
        PermisosGuard,
        JwtModule,
        PassportModule
    ],
})
export class AuthModule {}