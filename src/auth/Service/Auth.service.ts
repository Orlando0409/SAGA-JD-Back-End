import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../Modules/Usuarios/Entity/User.Entity';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../DTO/LoginDto';

@Injectable()
export class AuthService {
  usuariosService: any;
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async login(loginDto: LoginDto, response: Response) {
    const { Nombre_Usuario, Password } = loginDto;

    // Buscar usuario por nombre de usuario
    const usuario = await this.userRepository.findOne({
      where: { Nombre_Usuario },
      relations: ['rol', 'rol.permisos']
    });

    if (!usuario) {
        throw new UnauthorizedException('Credenciales inválidas');
    }

    let contraseñaValida = false;

    // Verificar si la contraseña está hasheada (bcrypt hash empieza con $2b$)
    if (usuario.Contraseña.startsWith('$2b$')) {
        // Contraseña hasheada - usar bcrypt
        contraseñaValida = await bcrypt.compare(Password, usuario.Contraseña);
    }

    if (!contraseñaValida) {
        throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar tokens
    const payload = { 
      sub: usuario.Id_Usuario, 
      email: usuario.Correo_Electronico,
      rol: usuario.rol?.Nombre_Rol 
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
    });

    // Configurar cookies
    this.setTokenCookies(response, accessToken, refreshToken);

    // Guardar refresh token en la base de datos
    await this.userRepository.update(usuario.Id_Usuario, { Refresh_Token:refreshToken });

    // Remover contraseña de la respuesta
    const { Contraseña: _, ...usuarioSeguro } = usuario;

    return {
      mensaje: 'Login exitoso',
      usuario: usuarioSeguro
    };
  }

  async refresh(refreshToken: string, response: Response) {
    try {
      // Verificar y decodificar el refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET
      });

      const usuario = await this.userRepository.findOne({
        where: { Id_Usuario: payload.sub },
        relations: ['rol']
      });

      if (!usuario) {
        throw new UnauthorizedException('Usuario no válido');
      }
      if (usuario.Refresh_Token !== refreshToken) {
        throw new UnauthorizedException('Refresh token no coincide');
      }

      // Generar nuevo access token
      const newPayload = { 
        sub: usuario.Id_Usuario, 
        email: usuario.Correo_Electronico,
        rol: usuario.rol?.Nombre_Rol 
      };

      const newAccessToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

     const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
        });

        //  Actualizar ambas cookies
        this.setTokenCookies(response, newAccessToken, newRefreshToken);
     
        // Guardar refresh token en la base de datos
        await this.userRepository.update(usuario.Id_Usuario, { Refresh_Token: newRefreshToken });


      return {
        mensaje: 'Token renovado exitosamente',
      };
    } catch (error) {
      console.error('Error al renovar token:', error);
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  logout(response: Response) {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');

    return {
      mensaje: 'Logout exitoso'
    };
  }

  async forgotPassword(email: string) {
    const usuario = await this.userRepository.findOne({
      where: { Correo_Electronico: email }
    });

    if (!usuario) {
      // Por seguridad, no revelar si el email existe o no
      return {
        mensaje: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
      };
    }

    // Aquí se implementará el envío de email con token de recuperación
    // Por ahora solo retornamos un mensaje
    return {
      mensaje: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
    };
  }

  async emailExists(email: string): Promise<boolean> {
    const usuario = await this.userRepository.findOne({
      where: { Correo_Electronico: email }
    });
    return !!usuario;
  }

  async getUserProfile(userId: number) {
    const usuario = await this.userRepository.findOne({
      where: { Id_Usuario: userId },
      relations: ['rol', 'rol.permisos']
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { Contraseña, ...usuarioSeguro } = usuario;

    // Organizar permisos por módulo
    const permisosOrganizados = {};
    if (usuario.rol?.permisos) {
      usuario.rol.permisos.forEach(permiso => {
        if (!permisosOrganizados[permiso.modulo]) {
          permisosOrganizados[permiso.modulo] = { ver: false, editar: false };
        }
        
        if (permiso.Ver) {
          permisosOrganizados[permiso.modulo].ver = true;
        }
        if (permiso.Editar) {
          permisosOrganizados[permiso.modulo].ver = true; // Editar incluye ver
          permisosOrganizados[permiso.modulo].editar = true;
        }
      });
    }

    return {
      ...usuarioSeguro,
      permisos: permisosOrganizados
    };
  }

  private setTokenCookies(response: Response, accessToken: string, refreshToken: string) {

    // Cookie para access token
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: !!process.env.COOKIE_SECURE,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutos
      path: '/'
    });

    // Cookie para refresh token
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: !!process.env.COOKIE_SECURE,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/'
    });
  }
}