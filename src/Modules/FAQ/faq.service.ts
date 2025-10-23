import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FAQEntity } from './FAQEntities/FAQ.Entity';
import { CreateFAQDto } from './DTOs/CreateFAQ.dto';
import { UpdateFAQDto } from './DTOs/UpdateFAQ.dto';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';

export interface UsuarioPublic {
	Id_Usuario: number;
	Nombre_Usuario: string;
	Correo_Electronico: string;
}

export interface FAQWithUser {
	Id_FAG: number;
	Pregunta: string;
	Respuesta: string;
	Fecha_Creacion: Date;
	Fecha_Actualizacion: Date;
	Id_Usuario: number;
	Usuario?: UsuarioPublic;
	Visible?: boolean;
}

@Injectable()
export class FAQService {
	constructor(
		@InjectRepository(FAQEntity)
		private readonly faqRepo: Repository<FAQEntity>,
	) {}

	async create(createDto: CreateFAQDto, idUsuario: number): Promise<FAQWithUser> {
		const now = new Date();
			const faq = this.faqRepo.create({
				Pregunta: createDto.Pregunta,
				Respuesta: createDto.Respuesta,
				Fecha_Creacion: now,
				Fecha_Actualizacion: now,
				Id_Usuario: idUsuario,
				Visible: true,
			});

		const saved = await this.faqRepo.save(faq);
		const found = await this.faqRepo.findOne({ where: { Id_FAG: saved.Id_FAG }, relations: ['Usuario'] });
		if (!found) throw new NotFoundException('FAQ not found after save');
		return this.mapToDTO(found);
	}

	async findAll(): Promise<FAQWithUser[]> {
			const list = await this.faqRepo.find({ where: { Visible: true }, relations: ['Usuario'] });
		return list.map((f) => this.mapToDTO(f));
	}

		//get exclusivo para el admin
		async findAllAdmin(): Promise<FAQWithUser[]> {
			const list = await this.faqRepo.find({ relations: ['Usuario'] });
			return list.map((f) => this.mapToDTO(f));
		}

	async findOne(id: number): Promise<FAQWithUser> {
		const faq = await this.faqRepo.findOne({ where: { Id_FAG: id }, relations: ['Usuario'] });
		if (!faq) throw new NotFoundException('FAQ not found');
		return this.mapToDTO(faq);
	}

	async update(id: number, updateDto: UpdateFAQDto, idUsuario: number): Promise<FAQWithUser> {
		const faq = await this.faqRepo.findOne({ where: { Id_FAG: id } });
		if (!faq) throw new NotFoundException('FAQ not found');

		if (updateDto.Pregunta !== undefined) faq.Pregunta = updateDto.Pregunta;
		if (updateDto.Respuesta !== undefined) faq.Respuesta = updateDto.Respuesta;

		faq.Fecha_Actualizacion = new Date();
		faq.Id_Usuario = idUsuario;

		const saved = await this.faqRepo.save(faq);
		const found = await this.faqRepo.findOne({ where: { Id_FAG: saved.Id_FAG }, relations: ['Usuario'] });
		if (!found) throw new NotFoundException('FAQ not found after update');
		return this.mapToDTO(found);
	}

	private mapToDTO(faq: FAQEntity): FAQWithUser {
		const result: FAQWithUser = {
			Id_FAG: faq.Id_FAG,
			Pregunta: faq.Pregunta,
			Respuesta: faq.Respuesta,
			Fecha_Creacion: faq.Fecha_Creacion,
			Fecha_Actualizacion: faq.Fecha_Actualizacion,
			Id_Usuario: faq.Id_Usuario,
		};

		if (faq.Usuario) {
			const usuario = faq.Usuario as Usuario;
			const publicUsuario: UsuarioPublic = {
				Id_Usuario: usuario.Id_Usuario,
				Nombre_Usuario: usuario.Nombre_Usuario,
				Correo_Electronico: usuario.Correo_Electronico,
			};
			result.Usuario = publicUsuario;
		}

			result.Visible = faq.Visible;

		return result;
	}

	async remove(id: number) {
		const faq = await this.faqRepo.findOne({ where: { Id_FAG: id } });
		if (!faq) throw new NotFoundException('FAQ not found');
		return this.faqRepo.remove(faq);
	}

			async toggleVisible(id: number, idUsuario: number): Promise<FAQWithUser> {
				const faq = await this.faqRepo.findOne({ where: { Id_FAG: id } });
				if (!faq) throw new NotFoundException('FAQ not found');

				faq.Visible = !faq.Visible;
				faq.Fecha_Actualizacion = new Date();
				faq.Id_Usuario = idUsuario;

				const saved = await this.faqRepo.save(faq);
				const found = await this.faqRepo.findOne({ where: { Id_FAG: saved.Id_FAG }, relations: ['Usuario'] });
				if (!found) throw new NotFoundException('FAQ not found after toggleVisible');
				return this.mapToDTO(found);
			}
}

