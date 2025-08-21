import{Injectable} from '@nestjs/common';
import{InjectRepository}from'@nestjs/typeorm';
import{Repository}from'typeorm';
import{UserRol}from "../UsuarioEntities/UserRol.Entity";
import{ CreateRolesDto }from "../UsuarioDTO's/CreateRoles.dto";
import { UpdateRolesDto } from "../UsuarioDTO's/UpdateRoles.dto";

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(UserRol)
        private readonly rolesRepository: Repository<UserRol>,
    ) {}
    
    createRoles(createRolesDto: CreateRolesDto) {
        const rol = this.rolesRepository.create(createRolesDto);
        return this.rolesRepository.save(rol);
    }
    
    AllRoles() {
        return this.rolesRepository.find();
    }
    
    findOneRoles(id: number) {
        return this.rolesRepository.findOneBy({ Id_Rol: id });
    }
    
    updateRoles(id: number, updateRolesDto: UpdateRolesDto) {
        return this.rolesRepository.update(id, updateRolesDto);
    }
    
    deleteRoles(id: number) {
        return this.rolesRepository.delete(id);
    }

}