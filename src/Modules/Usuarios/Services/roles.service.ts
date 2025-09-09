import{Injectable, NotFoundException} from '@nestjs/common';
import{InjectRepository}from'@nestjs/typeorm';
import{Repository, In}from'typeorm';
import { CreateRolesDto } from '../UsuarioDTO\'s/CreateRoles.dto';
import { UpdateRolesDto } from '../UsuarioDTO\'s/UpdateRoles.dto';
import { Permiso } from '../UsuarioEntities/Permiso.Entity';
import { UserRol } from '../UsuarioEntities/UsuarioRol.Entity';


@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(UserRol)
        private readonly rolesRepository: Repository<UserRol>,
        @InjectRepository(Permiso)
        private readonly permisosRepository: Repository<Permiso>,
    ) {}
    
    async createRoles(createRolesDto: CreateRolesDto) {
        const { permisosIds, ...rolData } = createRolesDto;
        
        const rol = this.rolesRepository.create(rolData);
        
        if (permisosIds && permisosIds.length > 0) {
            const permisos = await this.permisosRepository.findBy({ id: In(permisosIds) });
            if (permisos.length !== permisosIds.length) {
                throw new NotFoundException('Uno o más permisos no fueron encontrados');
            }
            rol.permisos = permisos;
        }
        
        return this.rolesRepository.save(rol);
    }
    
    AllRoles() {
        return this.rolesRepository.find({ relations: ['permisos'] });
    }
    AllPermission(){
        return this.permisosRepository.find();
    }
    
    findOneRoles(id: number) {
        return this.rolesRepository.findOne({ 
            where: { Id_Rol: id }, 
            relations: ['permisos'] 
        });
    }
    
    async updateRoles(id: number, updateRolesDto: UpdateRolesDto) {
        const { permisosIds, ...rolData } = updateRolesDto;
        
        const rol = await this.rolesRepository.findOne({ 
            where: { Id_Rol: id }, 
            relations: ['permisos'] 
        });
        
        if (!rol) {
            throw new NotFoundException('Rol no encontrado');
        }
        
        Object.assign(rol, rolData);
        
        if (permisosIds !== undefined) {
            if (permisosIds.length > 0) {
                const permisos = await this.permisosRepository.findBy({ id: In(permisosIds) });
                rol.permisos = permisos;
            } else {
                rol.permisos = [];
            }
        }
        
        return this.rolesRepository.save(rol);
    }
    
    deleteRoles(id: number) {
        return this.rolesRepository.delete(id);
    }
}