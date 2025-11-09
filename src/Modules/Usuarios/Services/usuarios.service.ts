import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../UsuarioEntities/Usuario.Entity';
import { UsuarioRol } from '../UsuarioEntities/UsuarioRol.Entity';
import { CreateUsuarioDto } from "../UsuarioDTO's/CreateUser.dto";
import { UpdateUsuarioDto } from "../UsuarioDTO's/UpdateUser.dto";
import { AuditoriaService } from '../../Auditoria/auditoria.service';

@Injectable()
export class UsuariosService {
    constructor(
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        @InjectRepository(UsuarioRol)
        private readonly rolRepository: Repository<UsuarioRol>,

        @Inject(forwardRef(() => AuditoriaService))
        private readonly auditoriaService: AuditoriaService,
    ) { }

    async createUser(dto: CreateUsuarioDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        // Validar nombre de usuario existente
        const nombreUsuarioExistente = await this.usuarioRepository.findOne({ where: { Nombre_Usuario: dto.Nombre_Usuario } });
        if (nombreUsuarioExistente) throw new BadRequestException('El nombre de usuario ya está registrado');

        // Validar correo existente
        const correoExistente = await this.usuarioRepository.findOne({ where: { Correo_Electronico: dto.Correo_Electronico } });
        if (correoExistente) throw new BadRequestException('El correo electrónico ya está registrado');

        const rolExistente = await this.rolRepository.findOne({ where: { Id_Rol: dto.Id_Rol }, relations: ['Permisos'] });
        if (!rolExistente) throw new NotFoundException('Rol no encontrado');

        //  Hashear la contraseña antes de guardar
        let hashedPassword = dto.Contraseña;
        if (dto.Contraseña) hashedPassword = await bcrypt.hash(dto.Contraseña, 10);

        const user = this.usuarioRepository.create({
            ...dto,
            Contraseña: hashedPassword,
        });

        const usuarioGuardado = await this.usuarioRepository.save(user);

        // Registrar en auditoría - usuario con rol
        try {
            await this.auditoriaService.logCreacion('Usuario', usuarioGuardado.Id_Usuario, usuarioGuardado.Id_Usuario, {
                Id_Usuario: usuarioGuardado.Id_Usuario,
                Nombre_Usuario: usuarioGuardado.Nombre_Usuario,
                Correo_Electronico: usuarioGuardado.Correo_Electronico,
                Id_Rol: usuarioGuardado.Id_Rol,
                Nombre_Rol: rolExistente.Nombre_Rol
            });
        } catch (error) {
            console.error('Error al registrar auditoría de creación de usuario:', error);
        }

        const { Contraseña, Refresh_Token, Id_Rol, ...userWithoutPassword } = usuarioGuardado;

        return {
            ...userWithoutPassword,
            Rol: rolExistente
        };
    }

    async AllUser() {
        const users = await this.usuarioRepository.createQueryBuilder('usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .leftJoinAndSelect('rol.Permisos', 'permisos')
            .withDeleted()
            .getMany();

        return users.map(user => {
            const { Contraseña, Refresh_Token, Id_Rol, ...userWithoutPassword } = user;
            return {
                ...userWithoutPassword,
                Rol: user.Rol || 'Este usuario no posee rol'
            };
        });
    }

    async findOneUser(id: number) {
        const user = await this.usuarioRepository.createQueryBuilder('usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .leftJoinAndSelect('rol.Permisos', 'permisos')
            .withDeleted()
            .where('usuario.Id_Usuario = :id', { id })
            .getOne();

        if (!user) throw new NotFoundException('Usuario no encontrado');

        const { Contraseña, Refresh_Token, Id_Rol, ...userWithoutPassword } = user;

        return {
            ...userWithoutPassword,
            Rol: user.Rol || 'Este usuario no posee rol'
        };
    }

    async updateUser(id: number, updateUserDto: UpdateUsuarioDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const user = await this.usuarioRepository.findOne({ where: { Id_Usuario: id }, relations: ['Rol', 'Rol.Permisos'] });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        // Validar nombre de usuario único (si se está cambiando)
        if (updateUserDto.Nombre_Usuario !== undefined && updateUserDto.Nombre_Usuario !== user.Nombre_Usuario) {
            const nombreUsuarioExistente = await this.usuarioRepository.findOne({
                where: { Nombre_Usuario: updateUserDto.Nombre_Usuario }
            });
            if (nombreUsuarioExistente) {
                throw new BadRequestException('El nombre de usuario ya está registrado');
            }
        }

        // Validar correo único (si se está cambiando)
        if (updateUserDto.Correo_Electronico !== undefined && updateUserDto.Correo_Electronico !== user.Correo_Electronico) {
            const correoExistente = await this.usuarioRepository.findOne({
                where: { Correo_Electronico: updateUserDto.Correo_Electronico }
            });
            if (correoExistente) {
                throw new BadRequestException('El correo electrónico ya está registrado');
            }
        }

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Nombre_Usuario: user.Nombre_Usuario,
            Correo_Electronico: user.Correo_Electronico,
            Id_Rol: user.Id_Rol,
            Nombre_Rol: user.Rol?.Nombre_Rol || 'Sin rol'
        };

        // Manejar campos específicos
        if (updateUserDto.Nombre_Usuario !== undefined) user.Nombre_Usuario = updateUserDto.Nombre_Usuario;
        if (updateUserDto.Correo_Electronico !== undefined) user.Correo_Electronico = updateUserDto.Correo_Electronico;

        // Manejar el rol
        if (updateUserDto.Id_Rol !== undefined) {
            if (updateUserDto.Id_Rol === 0) {
                user.Id_Rol = 0;
                user.Rol.Id_Rol = 0;
            } else {
                const nuevoRol = await this.rolRepository.findOneBy({ Id_Rol: updateUserDto.Id_Rol });
                if (!nuevoRol) throw new NotFoundException('Rol no encontrado');

                user.Id_Rol = updateUserDto.Id_Rol;
                user.Rol = nuevoRol;
            }
        }

        const updatedUser = await this.usuarioRepository.save(user);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Usuario', id, id, datosAnteriores, {
                Nombre_Usuario: updatedUser.Nombre_Usuario,
                Correo_Electronico: updatedUser.Correo_Electronico,
                Id_Rol: updatedUser.Id_Rol,
                Nombre_Rol: updatedUser.Rol?.Nombre_Rol || 'Sin rol'
            });
        } catch (error) {
            console.error('Error al registrar auditoría de actualización de usuario:', error);
        }

        // Recargar el usuario con todas las relaciones para asegurar que se tienen los permisos
        const userConPermisos = await this.usuarioRepository.findOne({ where: { Id_Usuario: id }, relations: ['Rol', 'Rol.Permisos'] });
        if (!userConPermisos) throw new NotFoundException('Usuario no encontrado después de actualizar');

        // Remover la contraseña y datos sensibles de la respuesta
        const { Contraseña, Refresh_Token, Id_Rol, ...userWithoutPassword } = userConPermisos;

        return {
            ...userWithoutPassword,
            Rol: userConPermisos.Rol || 'Este usuario no posee rol'
        };
    }

    async softDeleteUser(id: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const user = await this.usuarioRepository.findOne({ where: { Id_Usuario: id }, relations: ['Rol'] });
        if (!user) throw new NotFoundException('Usuario no encontrado.');

        if (user.Fecha_Eliminacion != null) throw new BadRequestException('El usuario ya está inactivo.');

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Id_Usuario: user.Id_Usuario,
            Nombre_Usuario: user.Nombre_Usuario,
            Correo_Electronico: user.Correo_Electronico,
            Id_Rol: user.Id_Rol,
            Nombre_Rol: user.Rol?.Nombre_Rol || 'Sin rol',
            Estado: 'Activo'
        };

        await this.usuarioRepository.softDelete(id);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Usuario', id, id, datosAnteriores, {
                Estado: 'Inactivo',
                Accion: 'Desactivación de usuario'
            });
        } catch (error) {
            console.error('Error al registrar auditoría de desactivación de usuario:', error);
        }

        return {
            message: 'El usuario ha sido desactivado correctamente.',
        };
    }

    async restoreUser(id: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const user = await this.usuarioRepository.findOne({ where: { Id_Usuario: id }, relations: ['Rol'] });
        if (!user) throw new NotFoundException('Usuario no encontrado.');

        if (!user.Fecha_Eliminacion) throw new BadRequestException('El usuario no estaba inactivo.');

        const rolActivo = await this.rolRepository.findOne({ where: { Id_Rol: user.Id_Rol } });

        if (!rolActivo || rolActivo.Fecha_Eliminacion) throw new BadRequestException('No se puede restaurar el usuario porque su rol está deshabilitado.');

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Id_Usuario: user.Id_Usuario,
            Nombre_Usuario: user.Nombre_Usuario,
            Correo_Electronico: user.Correo_Electronico,
            Id_Rol: user.Id_Rol,
            Nombre_Rol: user.Rol?.Nombre_Rol || 'Sin rol',
            Estado: 'Inactivo'
        };

        await this.usuarioRepository.restore(id);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Usuario', id, id, datosAnteriores, {
                Estado: 'Activo',
                Accion: 'Restauración de usuario'
            });
        } catch (error) {
            console.error('Error al registrar auditoría de restauración de usuario:', error);
        }

        return {
            message: 'El usuario ha sido restaurado correctamente.',
        };
    }

    async FormatearUsuarioResponse(usuario: Usuario): Promise<{
        Id_Usuario: number;
        Nombre_Usuario: string;
        Id_Rol: number;
        Nombre_Rol: string;
    }> {
        // Si la relación Rol no está cargada, cargarla manualmente
        let nombreRol = 'Sin rol';

        if (usuario.Rol && usuario.Rol.Nombre_Rol) {
            nombreRol = usuario.Rol.Nombre_Rol;
        }

        else if (usuario.Id_Rol && usuario.Id_Rol !== 0) {
            // Si no está cargada la relación pero tenemos el ID, buscar el rol
            const rol = await this.rolRepository.findOne({ where: { Id_Rol: usuario.Id_Rol } });
            nombreRol = rol ? rol.Nombre_Rol : 'Rol no encontrado';
        }

        return {
            Id_Usuario: usuario.Id_Usuario,
            Nombre_Usuario: usuario.Nombre_Usuario,
            Id_Rol: usuario.Id_Rol,
            Nombre_Rol: nombreRol
        };
    }
}