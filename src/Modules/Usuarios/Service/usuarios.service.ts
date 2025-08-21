import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../Entity/User.Entity';
import { UserRol } from '../Entity/UserRol';
import { CreateUserDto } from "../DTO's/CreateUser.dto";
import { UpdateUserDto } from "../DTO's/UpdateUser.dto";
import * as bcrypt from 'bcrypt'; // ✅ Importar bcrypt

@Injectable()
export class UsuariosService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(UserRol)
        private readonly rolRepository: Repository<UserRol>,
    ){}

    async createUser(createUserDto: CreateUserDto) {
        const { Id_Rol, Contraseña, ...userData } = createUserDto;  
        
        //  Hashear la contraseña antes de guardar
        let hashedPassword = Contraseña;
        if (Contraseña) {
            hashedPassword = await bcrypt.hash(Contraseña, 10);
        }
        
        if (Id_Rol && Id_Rol !== 0) {
            const rol = await this.rolRepository.findOneBy({ Id_Rol: Id_Rol });
            if (!rol) {
                throw new NotFoundException('Rol no encontrado');
            }
            
            const user = this.userRepository.create({ 
                ...userData, 
                Contraseña: hashedPassword, // ✅ Usar contraseña hasheada
                id_rol: Id_Rol 
            });
            return await this.userRepository.save(user);
        }
        
        const user = this.userRepository.create({
            ...userData,
            Contraseña: hashedPassword // ✅ Usar contraseña hasheada
        });
        return await this.userRepository.save(user);
    }

    async AllUser() {
        const users = await this.userRepository.find({ 
            relations: ['rol', 'rol.permisos'], 
            withDeleted: true 
        });
        
        //  Remover contraseñas de la respuesta
        return users.map(user => {
            const { Contraseña, ...userWithoutPassword } = user;
            return {
                ...userWithoutPassword,
                rol: user.rol || 'Este usuario no posee rol'
            };
        });
    }

    async findOneUser(id: number) {
        const user = await this.userRepository.findOne({
            where: { Id_Usuario: id },
            relations: ['rol', 'rol.permisos'],
        });
        
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        
        // ✅ Remover contraseña de la respuesta
        const { Contraseña, ...userWithoutPassword } = user;
        
        return {
            ...userWithoutPassword,
            rol: user.rol || 'Este usuario no posee rol'
        };
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.userRepository.findOne({
            where: { Id_Usuario: id },
            relations: ['rol'],
        });
        
        if (!user){
            throw new NotFoundException('Usuario no encontrado');
        }

        // Manejar actualización de contraseña
        if (updateUserDto.Contraseña) {
            updateUserDto.Contraseña = await bcrypt.hash(updateUserDto.Contraseña, 10); 
        }

        if (updateUserDto.Id_Rol !== undefined) {
            if (updateUserDto.Id_Rol === 0) {
                user.id_rol = 0; 
            } else {
                const nuevoRol = await this.rolRepository.findOneBy({ Id_Rol: updateUserDto.Id_Rol});
                if (!nuevoRol){
                    throw new NotFoundException('Rol no encontrado');
                } 
                user.id_rol = updateUserDto.Id_Rol;
            }
        }

        const { Id_Rol, ...restOfDto } = updateUserDto;
        Object.assign(user, restOfDto);

        const updatedUser = await this.userRepository.save(user);
        
        //  Remover contraseña de la respuesta
        const { Contraseña, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }

    async softDeleteUser(id: number) {
        const user = await this.userRepository.findOne({
            where: { Id_Usuario: id },
            withDeleted: true, 
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        if (user.Fecha_Eliminacion) {
            throw new BadRequestException('El usuario ya está inactivo.');
        }

        await this.userRepository.softDelete(id);
        return {
            message: 'El usuario ha sido desactivado correctamente.',
        };
    }

    async restoreUser(id: number) {
        const user = await this.userRepository.findOne({
            where: { Id_Usuario: id },
            withDeleted: true, 
        });
    
        if (!user) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        if (!user.Fecha_Eliminacion) {
            throw new BadRequestException('El usuario no estaba inactivo.');
        }

        await this.userRepository.restore(id);
        return {
            message: 'El usuario ha sido restaurado correctamente.',
        };
    }
}