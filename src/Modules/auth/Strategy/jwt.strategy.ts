import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../Usuarios/UsuarioEntities/Usuario.Entity';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {
        super({
            // Soporte para cookies
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.accessToken; // Desde cookies
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret',
        });
    }

    async validate(payload: any) {
        if (!payload.sub || !payload.email) {
            throw new UnauthorizedException('Token payload inválido');
        }

        // Buscar usuario completo en la base de datos
        const usuario = await this.userRepository.findOne({
            where: { Id_Usuario: payload.sub },
            relations: ['rol', 'rol.permisos']
        });

        if (!usuario) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        //  Retornar usuario completo
        return usuario;
    }
}