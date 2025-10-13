import{BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import{InjectRepository}from'@nestjs/typeorm';
import{Repository, In}from'typeorm';
import { CreateRolesDto } from '../UsuarioDTO\'s/CreateRoles.dto';
import { UpdateRolesDto } from '../UsuarioDTO\'s/UpdateRoles.dto';
import { Permiso } from '../UsuarioEntities/Permiso.Entity';
import { UsuarioRol } from '../UsuarioEntities/UsuarioRol.Entity';
import { Usuario } from '../UsuarioEntities/Usuario.Entity';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(UsuarioRol)
        private readonly rolesRepository: Repository<UsuarioRol>,
        @InjectRepository(Permiso)
        private readonly permisosRepository: Repository<Permiso>,
        @InjectRepository(Usuario)
        private readonly userRepository: Repository<Usuario>,
    ) {}

    async createRoles(createRolesDto: CreateRolesDto) {
        const { permisosIds, ...rolData } = createRolesDto;

        const rolExistente = await this.rolesRepository.findOne({where : {Nombre_Rol : rolData.Nombre_Rol}, withDeleted : true});
        if(rolExistente)
        {
            throw new NotFoundException('El nombre del rol ya está registrado');
        }

        const rol = this.rolesRepository.create(rolData);

        if (permisosIds && permisosIds.length > 0) {
            const permisos = await this.permisosRepository.findBy({ Id: In(permisosIds) });
            if (permisos.length !== permisosIds.length) {
                throw new NotFoundException('Uno o más permisos no fueron encontrados');
            }
            rol.Permisos = permisos;
        }

        return this.rolesRepository.save(rol);
    }

    async AllRoles() {
        return this.rolesRepository.find({ 
            relations: ['Permisos'],
            withDeleted: true
        });
    }

    async AllPermission(){
        return this.permisosRepository.find();
    }

    async findOneRoles(id: number) {
        return this.rolesRepository.findOne({ 
            where: { Id_Rol: id }, 
            relations: ['Permisos'],
            withDeleted: true
        });
    }
    
    async updateRoles(id: number, updateRolesDto: UpdateRolesDto) {
        const { permisosIds, ...rolData } = updateRolesDto;

        const rol = await this.rolesRepository.findOne({ 
            where: { Id_Rol: id }, 
            relations: ['Permisos'],
            withDeleted: true
        });

        if (!rol) {
            throw new NotFoundException('Rol no encontrado');
        }

        Object.assign(rol, rolData);

        if (permisosIds !== undefined) {
            if (permisosIds.length > 0) {
                const permisos = await this.permisosRepository.findBy({ Id: In(permisosIds) });
                rol.Permisos = permisos;
            } else {
                rol.Permisos = [];
            }
        }
        
        return this.rolesRepository.save(rol);
    }

    async softDeleteRol(id: number) {
        const role = await this.rolesRepository.findOne({
            where: { Id_Rol: id },
            withDeleted: true, 
        });

        if (!role) {
            throw new NotFoundException('Rol no encontrado.');
        }

        if (role.Fecha_Eliminacion) {
            throw new BadRequestException('El rol ya está inactivo.');
        }

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

        return {
            message: 'El rol ha sido desactivado correctamente.',
        };
    }

    async restoreRole(id: number) {
        const role = await this.rolesRepository.findOne({
            where: { Id_Rol: id },
            withDeleted: true, 
        });

        if (!role) {
            throw new NotFoundException('Rol no encontrado.');
        }

        if (!role.Fecha_Eliminacion) {
            throw new BadRequestException('El rol no estaba inactivo.');
        }

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

        return {
            message: 'El rol ha sido restaurado correctamente.',
        };
    }
}