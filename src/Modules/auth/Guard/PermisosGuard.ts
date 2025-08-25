import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISOS_KEY } from '../Decorator/Permiso.decorator';

@Injectable()
export class PermisosGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const permisoRequerido = this.reflector.getAllAndOverride<{modulo: string, accion: string}>(
            PERMISOS_KEY,
            [context.getHandler(), context.getClass()]
        );

        if (!permisoRequerido) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const usuario = request.user;

        if (!usuario) {
            throw new ForbiddenException('Usuario no autenticado');
        }

        if (!usuario?.rol?.permisos) {
            throw new ForbiddenException('Usuario sin permisos');
        }

        // usar datos ya cargados
        const permisoDelModulo = usuario.rol.permisos.find(
            permiso => permiso.modulo === permisoRequerido.modulo
        );

        if (!permisoDelModulo) {
            throw new ForbiddenException(`Sin permisos para el módulo ${permisoRequerido.modulo}`);
        }

        let tienePermiso = false;
        switch (permisoRequerido.accion) {
            case 'ver':
                tienePermiso = permisoDelModulo.Ver === true || permisoDelModulo.Editar === true;
                break;
            case 'editar':
                tienePermiso = permisoDelModulo.Editar === true;
                break;
        }

        if (!tienePermiso) {
            throw new ForbiddenException(`Sin permisos para ${permisoRequerido.accion} en ${permisoRequerido.modulo}`);
        }

        return true;
    }
}