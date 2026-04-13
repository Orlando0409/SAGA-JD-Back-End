import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { LoginDto } from './DTO/LoginDto';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../Emails/email.service';
import { ResetPasswordDto } from './DTO/ResetPasswordDto';
import { ChangePasswordDTO } from './DTO/ChangePasswordDTO';
import { AuditoriaService } from '../Auditoria/auditoria.service';

@Injectable()
export class AuthService {
  usuariosService: any;
  constructor(
    @InjectRepository(Usuario)
    private readonly userRepository: Repository<Usuario>,

    private readonly jwtService: JwtService,

    private readonly configService: ConfigService,

    private readonly emailService: EmailService,

    private readonly auditoriaService: AuditoriaService,
  ) { }

  async login(loginDto: LoginDto, response: Response) {
    const { Nombre_Usuario, Password } = loginDto;

    // Buscar usuario por nombre de usuario
    const usuario = await this.userRepository.findOne({
      where: { Nombre_Usuario },
      relations: ['Rol', 'Rol.Permisos'],
      withDeleted: true
    });

    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');
    if (usuario.Fecha_Eliminacion) throw new UnauthorizedException('Usuario deshabilitado');

    let contraseñaValida = false;

    // Verificar si la contraseña está hasheada (bcrypt hash empieza con $2b$)
    if (usuario.Contraseña.startsWith('$2b$')) {
      // Contraseña hasheada - usar bcrypt
      contraseñaValida = await bcrypt.compare(Password, usuario.Contraseña);
    }

    if (!contraseñaValida) throw new UnauthorizedException('Credenciales inválidas');

    // Generar tokens
    const payload = {
      sub: usuario.Id_Usuario,
      email: usuario.Correo_Electronico,
      rol: usuario.Rol?.Nombre_Rol
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
    await this.userRepository.update(usuario.Id_Usuario, { Refresh_Token: refreshToken });

    // Registrar en auditoría
    try {
      await this.auditoriaService.logAutenticacion('Login', usuario.Id_Usuario, {
        Nombre_Usuario: usuario.Nombre_Usuario,
        Correo_Electronico: usuario.Correo_Electronico,
        Rol: usuario.Rol?.Nombre_Rol
      });
    } catch (error) {
      console.error('Error al registrar auditoría de login:', error);
    }

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
        relations: ['Rol']
      });

      if (!usuario) throw new UnauthorizedException('Usuario no válido');
      if (usuario.Refresh_Token !== refreshToken) throw new UnauthorizedException('Refresh token no coincide');

      // Generar nuevo access token
      const newPayload = {
        sub: usuario.Id_Usuario,
        email: usuario.Correo_Electronico,
        rol: usuario.Rol?.Nombre_Rol
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

  async logout(usuarioId: number, response: Response) {
    // Obtener información del usuario antes de hacer logout
    const usuario = await this.userRepository.findOne({
      where: { Id_Usuario: usuarioId },
      relations: ['Rol']
    });

    // Limpiar cookies
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');

    // Limpiar refresh token de la base de datos
    if (usuario) {
      await this.userRepository.update(usuarioId, { Refresh_Token: '' });
    }

    // Registrar en auditoría
    if (usuario) {
      try {
        await this.auditoriaService.logAutenticacion('Logout', usuarioId, {
          Nombre_Usuario: usuario.Nombre_Usuario,
          Correo_Electronico: usuario.Correo_Electronico,
          Rol: usuario.Rol?.Nombre_Rol
        });
      } catch (error) {
        console.error('Error al registrar auditoría de logout:', error);
      }
    }
  }

  async forgotPassword(email: string) {
    const usuario = await this.userRepository.findOne({
      where: { Correo_Electronico: email }
    });

    if (!usuario) return { mensaje: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña' };

    const payload = {
      email: usuario.Correo_Electronico,
      id: usuario.Id_Usuario,
      jti: uuidv4(), // identificador único del token
    };

    const token = await this.jwtService.signAsync(payload, { expiresIn: '10m' });

    const FrontendRecoverURL = `${this.configService.get('FRONTEND_URL_ADMIN')}/ResetPassword`;
    const url = `${FrontendRecoverURL}?token=${token}`;

    try {
      await this.emailService.sendRecoverPasswordMail({
        to: email,
        subject: 'Recuperación de contraseña',
        RecoverPasswordURL: url,
      });

    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);
    }

    return { mensaje: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña' };
  }

  async getUserProfile(userId: number) {
    const usuario = await this.userRepository.findOne({
      where: { Id_Usuario: userId },
      relations: ['Rol', 'Rol.Permisos']
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const { Contraseña, ...usuarioSeguro } = usuario;

    return { ...usuarioSeguro };
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.token);

      const usuario = await this.userRepository.findOne({
        where: { Id_Usuario: payload.id }
      });

      if (!usuario) throw new NotFoundException('Usuario no encontrado');

      const hashedPassword = await bcrypt.hash(dto.nuevaContraseña, 10);

      await this.userRepository.update(usuario.Id_Usuario, { Contraseña: hashedPassword });

      return { mensaje: 'Contraseña actualizada correctamente' };
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      throw new UnauthorizedException('Token inválido, expirado o contraseñas no coinciden');
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDTO) {
    const { UsuarioId, Contraseña_Actual, Nueva_Contraseña } = changePasswordDto;
    const usuario = await this.userRepository.findOne({
      where: { Id_Usuario: UsuarioId },
      withDeleted: true
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (usuario.Fecha_Eliminacion) throw new UnauthorizedException('Usuario deshabilitado');

    const contraseñaValida = await bcrypt.compare(Contraseña_Actual, usuario.Contraseña);
    if (!contraseñaValida) throw new UnauthorizedException('Contraseña actual incorrecta');

    const hashedPassword = await bcrypt.hash(Nueva_Contraseña, 10);
    await this.userRepository.update(usuario.Id_Usuario, { Contraseña: hashedPassword });
    return { mensaje: 'Contraseña cambiada exitosamente' };
  }

  private setTokenCookies(response: Response, accessToken: string, refreshToken: string) {
    // Cookie para access token
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, // 15 minutos
      path: '/'
    });

    // Cookie para refresh token
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/'
    });
  }
}