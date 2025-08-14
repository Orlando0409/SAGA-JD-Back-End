import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './UsuarioEntities/User.Entity';
import { CreateUserDto } from "./UsuarioDTO'S/CreateUser.dto";
import { UpdateUserDto } from "./UsuarioDTO'S/UpdateUser.dto";

@Injectable()
export class UsuariosService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
	) {}

	createUser(createUserDto: CreateUserDto) {
		const user = this.userRepository.create(createUserDto);
		return this.userRepository.save(user);
	}

	AllUser() {
		return this.userRepository.find();
	}

	findOneUser(id: number) {
		return this.userRepository.findOneBy({ Id_Usuario: id });
	}

	updateUser(id: number, updateUserDto: UpdateUserDto) {
		return this.userRepository.update(id, updateUserDto);
	}

	deleteUser(id: number) {
		return this.userRepository.delete(id);
	}
}
