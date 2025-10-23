import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Usuario } from '../../Usuarios/UsuarioEntities/Usuario.Entity';

export const GetUser = createParamDecorator(
    (data: string | undefined, context: ExecutionContext): Usuario => {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) throw new Error('Usuario no encontrado en la request. Asegúrate de usar JwtAuthGuard.');

        return data ? user?.[data] : user;
    },
);