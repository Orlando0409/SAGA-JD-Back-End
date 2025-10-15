import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'; 
import { Usuario } from '../UsuarioEntities/Usuario.Entity';
import { UsuarioRol } from '../UsuarioEntities/UsuarioRol.Entity';
import { CreateUsuarioDto } from "../UsuarioDTO's/CreateUser.dto";
import { UpdateUsuarioDto } from "../UsuarioDTO's/UpdateUser.dto";

@Injectable()
export class UsuariosService {
    constructor(
        @InjectRepository(Usuario)
        private readonly userRepository: Repository<Usuario>,
        @InjectRepository(UsuarioRol)
        private readonly rolRepository: Repository<UsuarioRol>,
    ){}

    async createUser(createUserDto: CreateUsuarioDto) {
        const { Id_Rol, Contraseña, Correo_Electronico, Nombre_Usuario, ...userData } = createUserDto;  
        // Validar correo existente
        const correoExistente = await this.userRepository.findOne({where : {Correo_Electronico}, withDeleted : true});
        if(correoExistente)
        {
            throw new BadRequestException('El correo electrónico ya está registrado');
        }
        // Validar nombre de usuario existente
        if (Nombre_Usuario) {
            const nombreExistente = await this.userRepository.findOne({where : {Nombre_Usuario}, withDeleted : true});
            if(nombreExistente) {
                throw new BadRequestException('El nombre de usuario ya está registrado');
            }
        }

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
                Nombre_Usuario,
                Contraseña: hashedPassword, //  Usar contraseña hasheada
                Id_Rol: Id_Rol,
                Correo_Electronico
            });
            return await this.userRepository.save(user);
        }
        const user = this.userRepository.create({
            ...userData,
            Nombre_Usuario,
            Correo_Electronico,
            Contraseña: hashedPassword //  Usar contraseña hasheada
        });
        return await this.userRepository.save(user);
    }

    async AllUser() {
        const users = await this.userRepository.find({ 
            relations: ['Rol', 'Rol.Permisos'], 
            withDeleted: true  
        });
        
        //  Remover contraseñas de la respuesta
        return users.map(user => {
            const { Contraseña, ...userWithoutPassword } = user;
            return {
                ...userWithoutPassword,
                Rol: user.Rol || 'Este usuario no posee rol'
            };
        });
    }

    async findOneUser(id: number) {
        const user = await this.userRepository.findOne({
            where: { Id_Usuario: id },
            relations: ['Rol', 'Rol.Permisos'],
            withDeleted: true
        });
        
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        
        //  Remover contraseña de la respuesta
        const { Contraseña, ...userWithoutPassword } = user;
        
        return {
            ...userWithoutPassword,
            Rol: user.Rol || 'Este usuario no posee rol'
        };
    }

    async updateUser(id: number, updateUserDto: UpdateUsuarioDto) {
        const user = await this.userRepository.findOne({
            where: { Id_Usuario: id },
            relations: ['Rol', 'Rol.Permisos'],
        });
        
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Manejar campos específicos
        if (updateUserDto.Nombre_Usuario !== undefined) {
            user.Nombre_Usuario = updateUserDto.Nombre_Usuario;
        }
        
        if (updateUserDto.Correo_Electronico !== undefined) {
            user.Correo_Electronico = updateUserDto.Correo_Electronico;
        }

        // Manejar el rol
        if (updateUserDto.Id_Rol !== undefined) {
            if (updateUserDto.Id_Rol === 0 ) {
                user.Id_Rol = 0;
                user.Rol.Id_Rol = 0; 
            } else {
                const nuevoRol = await this.rolRepository.findOneBy({ Id_Rol: updateUserDto.Id_Rol });
                if (!nuevoRol) {
                    throw new NotFoundException('Rol no encontrado');
                } 
                user.Id_Rol = updateUserDto.Id_Rol;
                user.Rol = nuevoRol; 
            }
        }

        const updatedUser = await this.userRepository.save(user);
        
        // Remover la contraseña de la respuesta
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

        const isRolActive = await this.rolRepository.findOne({
            where: { Id_Rol: user.Id_Rol },
            withDeleted: true, 
        });

        if(!isRolActive || isRolActive.Fecha_Eliminacion) {
            throw new BadRequestException('No se puede restaurar el usuario porque su rol está deshabilitado.');
        }

        await this.userRepository.restore(id);
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