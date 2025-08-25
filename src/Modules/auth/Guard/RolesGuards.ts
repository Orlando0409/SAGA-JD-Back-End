import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../Decorator/Rol.decorator';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener los roles requeridos del decorator
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesRequeridos) {
      return true; // Si no hay roles específicos requeridos, permitir acceso
    }

    const request = context.switchToHttp().getRequest();
    const usuario = request.user;

    if (!usuario) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!usuario.rol) {
      throw new ForbiddenException('Usuario sin rol asignado');
    }

    // Verificar si el usuario tiene uno de los roles requeridos
    const tieneRolPermitido = rolesRequeridos.some(rol => 
      usuario.rol.Nombre_Rol === rol
    );

    if (!tieneRolPermitido) {
      throw new ForbiddenException(`Requiere uno de estos roles: ${rolesRequeridos.join(', ')}`);
    }

    return true;
  }
}