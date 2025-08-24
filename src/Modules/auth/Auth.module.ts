import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';


// Entities
import { Permiso } from '../Usuarios/UsuarioEntities/Permiso.Entity';
import { UserEntity } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { UserRol } from '../Usuarios/UsuarioEntities/UsuarioRol.Entity';

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
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { 
                    expiresIn: configService.get<string>('JWT_EXPIRES_IN')
                },
            }),
        }),
        TypeOrmModule.forFeature([UserEntity, UserRol, Permiso]),
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