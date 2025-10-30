import { BadRequestException, Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateRolesDto } from '../UsuarioDTO\'s/CreateRoles.dto';
import { UpdateRolesDto } from '../UsuarioDTO\'s/UpdateRoles.dto';
import { Permiso } from '../UsuarioEntities/Permiso.Entity';
import { UsuarioRol } from '../UsuarioEntities/UsuarioRol.Entity';
import { Usuario } from '../UsuarioEntities/Usuario.Entity';
import { AuditoriaService } from '../../Auditoria/auditoria.service';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(UsuarioRol)
        private readonly rolesRepository: Repository<UsuarioRol>,

        @InjectRepository(Permiso)
        private readonly permisosRepository: Repository<Permiso>,

        @InjectRepository(Usuario)
        private readonly userRepository: Repository<Usuario>,

        @Inject(forwardRef(() => AuditoriaService))
        private readonly auditoriaService: AuditoriaService,
    ) { }

    async createRoles(createRolesDto: CreateRolesDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para crear un rol.');

        const usuario = await this.userRepository.findOne({ where: { Id_Usuario: idUsuario }, withDeleted: true });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const { IDS_Permisos, ...rolData } = createRolesDto;

        const rolExistente = await this.rolesRepository.findOne({ where: { Nombre_Rol: rolData.Nombre_Rol }, withDeleted: true });
        if (rolExistente) throw new NotFoundException('El nombre del rol ya está registrado');

        const rol = this.rolesRepository.create(rolData);

        if (IDS_Permisos && IDS_Permisos.length > 0) {
            const permisos = await this.permisosRepository.findBy({ Id: In(IDS_Permisos) });
            if (permisos.length !== IDS_Permisos.length) {
                throw new NotFoundException('Uno o más permisos no fueron encontrados');
            }
            rol.Permisos = permisos;
        }

        const rolGuardado = await this.rolesRepository.save(rol);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logCreacion('Rol', 1, rolGuardado.Id_Rol, {
                Id_Rol: rolGuardado.Id_Rol,
                Nombre_Rol: rolGuardado.Nombre_Rol,
                Permisos_Asignados: rol.Permisos?.map(p => ({ Id: p.Id, Modulo: p.Modulo, Ver: p.Ver, Editar: p.Editar })) || []
            });
        } catch (error) {
            console.error('Error al registrar auditoría de creación de rol:', error);
        }

        return rolGuardado;
    }

    async AllRoles() {
        return this.rolesRepository.find({
            relations: ['Permisos'],
            withDeleted: true
        });
    }

    async AllPermission() {
        return this.permisosRepository.find();
    }

    async findOneRoles(id: number) {
        return this.rolesRepository.findOne({
            where: { Id_Rol: id },
            relations: ['Permisos'],
            withDeleted: true
        });
    }

    async updateRoles(id: number, updateRolesDto: UpdateRolesDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar un rol.');

        const usuario = await this.userRepository.findOne({ where: { Id_Usuario: idUsuario }, withDeleted: true });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const { IDS_Permisos, ...rolData } = updateRolesDto;

        const rol = await this.rolesRepository.findOne({
            where: { Id_Rol: id },
            relations: ['Permisos'],
            withDeleted: true
        });

        if (!rol) throw new NotFoundException('Rol no encontrado');

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Nombre_Rol: rol.Nombre_Rol,
            Permisos_Anteriores: rol.Permisos?.map(p => ({ Id: p.Id, Modulo: p.Modulo, Ver: p.Ver, Editar: p.Editar })) || []
        };

        Object.assign(rol, rolData);

        if (IDS_Permisos !== undefined) {
            if (IDS_Permisos.length > 0) {
                const permisos = await this.permisosRepository.findBy({ Id: In(IDS_Permisos) });
                rol.Permisos = permisos;
            } else {
                rol.Permisos = [];
            }
        }

        const rolActualizado = await this.rolesRepository.save(rol);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Rol', 1, id, datosAnteriores, {
                Nombre_Rol: rolActualizado.Nombre_Rol,
                Permisos_Nuevos: rolActualizado.Permisos?.map(p => ({ Id: p.Id, Modulo: p.Modulo, Ver: p.Ver, Editar: p.Editar })) || []
            });
        } catch (error) {
            console.error('Error al registrar auditoría de actualización de rol:', error);
        }

        return rolActualizado;
    }

    async softDeleteRol(id: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para desactivar un rol.');

        const usuario = await this.userRepository.findOne({ where: { Id_Usuario: idUsuario }, withDeleted: true });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const role = await this.rolesRepository.findOne({
            where: { Id_Rol: id },
            relations: ['Permisos'],
            withDeleted: true,
        });

        if (!role) throw new NotFoundException('Rol no encontrado.');

        if (role.Fecha_Eliminacion) throw new BadRequestException('El rol ya está inactivo.');

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Id_Rol: role.Id_Rol,
            Nombre_Rol: role.Nombre_Rol,
            Permisos: role.Permisos?.map(p => ({ Id: p.Id, Modulo: p.Modulo, Ver: p.Ver, Editar: p.Editar })) || [],
            Estado: 'Activo'
        };

        await this.rolesRepository.softDelete(id);

        const usersWithRole = await this.userRepository.find({
            where: { Id_Rol: id },
            relations: ['Rol', 'Rol.Permisos'],
            withDeleted: true,
        });

        if (usersWithRole && usersWithRole.length > 0) {
            //desactivar usuarios con ese rol
            const userIds = usersWithRole.map(user => user.Id_Usuario);
            await this.userRepository.softDelete(userIds);
        }

        // Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Rol', 1, id, datosAnteriores, {
                Estado: 'Inactivo',
                Accion: 'Desactivación de rol',
                Usuarios_Afectados: usersWithRole.length
            });
        } catch (error) {
            console.error('Error al registrar auditoría de desactivación de rol:', error);
        }

        return {
            message: 'El rol ha sido desactivado correctamente.',
        };
    }

    async restoreRole(id: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para restaurar un rol.');

        const usuario = await this.userRepository.findOne({ where: { Id_Usuario: idUsuario }, withDeleted: true });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const role = await this.rolesRepository.findOne({
            where: { Id_Rol: id },
            relations: ['Permisos'],
            withDeleted: true,
        });

        if (!role) throw new NotFoundException('Rol no encontrado.');

        if (!role.Fecha_Eliminacion) throw new BadRequestException('El rol no estaba inactivo.');

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Id_Rol: role.Id_Rol,
            Nombre_Rol: role.Nombre_Rol,
            Permisos: role.Permisos?.map(p => ({ Id: p.Id, Modulo: p.Modulo, Ver: p.Ver, Editar: p.Editar })) || [],
            Estado: 'Inactivo'
        };

        await this.rolesRepository.restore(id);

        const usersWithRole = await this.userRepository.find({
            where: { Id_Rol: id },
            relations: ['Rol', 'Rol.Permisos'],
            withDeleted: true,
        });

        if (usersWithRole && usersWithRole.length > 0) {
            const userIds = usersWithRole.map(user => user.Id_Usuario);
            await this.userRepository.restore(userIds);
        }

        // Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Rol', 1, id, datosAnteriores, {
                Estado: 'Activo',
                Accion: 'Restauración de rol',
                Usuarios_Restaurados: usersWithRole.length
            });
        } catch (error) {
            console.error('Error al registrar auditoría de restauración de rol:', error);
        }

        return {
            message: 'El rol ha sido restaurado correctamente.',
        };
    }
}