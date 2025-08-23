import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { jwtConstants } from '../constans/jwt.constans';
import { PERMISOS_KEY } from './permisos.decorator'; 

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('El token no existe');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      request.user = payload; 
   
      const permisosRequeridos = this.reflector.get<string[]>(
        PERMISOS_KEY,
        context.getHandler(),
      );
      
      if (!permisosRequeridos) {
        return true;
      }

      const permisosUser = payload.rol.permisos;
      let hasPermission = false;

      for (const permission of permisosRequeridos) {
        const [module, action] = permission.split('.');
        if (permisosUser[module] && permisosUser[module][action]) {
          hasPermission = true;
          break; 
        }
      }

      if (!hasPermission) {
        throw new ForbiddenException('Este usuario no posee permisos para realizar esta accion');
      }

      return true;

    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error; 
      }
      throw new UnauthorizedException('Token invalido o expirado');
    }
  }

  private extractToken(request: Request): string | undefined {
  const authHeader = request.headers.authorization;
  if (!authHeader) return undefined;

  return authHeader.trim();
}

}