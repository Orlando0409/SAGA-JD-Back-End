import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../UsuarioEntities/Usuario.Entity';
import { UserRol } from '../UsuarioEntities/UsuarioRol.Entity';
import { CreateUserDto } from "../UsuarioDTO's/CreateUser.dto";
import { UpdateUserDto } from "../UsuarioDTO's/UpdateUser.dto";

@Injectable()
export class UsuariosService {

	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(UserRol)
		private readonly rolRepository: Repository<UserRol>,
	){}

	async createUser(createUserDto: CreateUserDto) {
		const { Id_Rol, ...userData } = createUserDto;  
		let rol: UserRol | null = null;

		if (Id_Rol !== 0) {
			rol = await this.rolRepository.findOneBy({ Id_Rol: Id_Rol });
			if (!rol) {
				throw new NotFoundException('Rol no encontrado');
			}
		}
		const user = this.userRepository.create({ ...userData, ...(rol && { rol }) });
		return await this.userRepository.save(user);
	}

	async AllUser() {
	const users = await this.userRepository.find({ relations: ['rol'], withDeleted: true });
		return users.map(user => {
			if (!user.rol) {
				return {
					...user,
					rol: 'Este usuario no posee rol'
				};
			}
			return {
				...user,
				rol: {
					...user.rol,
					permisos: user.rol.permisos && Object.keys(user.rol.permisos).length > 0
						? user.rol.permisos
						: 'Este rol no posee permisos'
				}
			};
		});
	}

	async findOneUser(id: number) {
		const user = await this.userRepository.findOne({
			where: { Id_Usuario: id },
			relations: ['rol'],
		});
		if (!user) return null;
		if (!user.rol) {
			return {
				...user,
				rol: 'Este usuario no posee rol'
			};
		}
		return {
			...user,
			rol: {
				...user.rol,
				permisos: user.rol.permisos && Object.keys(user.rol.permisos).length > 0
					? user.rol.permisos
					: 'Este rol no posee permiso'
			}
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

		if (updateUserDto.Id_Rol !== undefined) {
			if (updateUserDto.Id_Rol === 0) {
				user.rol = null; 

			} else {
				const nuevoRol = await this.rolRepository.findOneBy({ Id_Rol: updateUserDto.Id_Rol});

				if (!nuevoRol){
					throw new NotFoundException('Rol no encontrado');
				} 
				else {
					user.rol = nuevoRol;
				}
			}
			
		}

		const { Id_Rol, ...restOfDto } = updateUserDto;
		Object.assign(user,  restOfDto);

		return this.userRepository.save(user);
	}

	async softDeleteUser(id: number) 
	{
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

	 async restoreUser(id: number) 
	 {
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
