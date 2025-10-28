import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FAQEntity } from './FAQEntities/FAQ.Entity';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { CreateFAQDto } from './FAQDTO\'s/CreateFAQ.dto';
import { UpdateFAQDto } from './FAQDTO\'s/UpdateFAQ.dto';
import { GetFAQSimpleDTO } from './FAQDTO\'s/GetFAQSimple.dto';
import { UsuariosService } from '../Usuarios/Services/usuarios.service';
import { AuditoriaService } from '../Auditoria/auditoria.service';

@Injectable()
export class FAQService {
	constructor(
		@InjectRepository(FAQEntity)
		private readonly faqRepo: Repository<FAQEntity>,

		@InjectRepository(Usuario)
		private readonly usuarioRepo: Repository<Usuario>,

		private readonly usuariosService: UsuariosService,

		private readonly auditoriaService: AuditoriaService,
	) { }

	async create(createDto: CreateFAQDto, idUsuario: number) {
		if (!idUsuario) throw new BadRequestException('El ID de usuario es obligatorio para crear una FAQ.');

		const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
		if (!usuario) throw new NotFoundException('Usuario no encontrado.');

		// Validar duplicados (pregunta o respuesta) - case insensitive
		const existing = await this.faqRepo
			.createQueryBuilder('faq')
			.where('LOWER(faq.Pregunta) = LOWER(:pregunta) OR LOWER(faq.Respuesta) = LOWER(:respuesta)', {
				pregunta: createDto.Pregunta,
				respuesta: createDto.Respuesta,
			})
			.getOne();

		if (existing) throw new BadRequestException('Ya existe una pregunta o respuesta igual.');

		const faq = this.faqRepo.create({
			...createDto,
			Visible: true,
			Usuario: usuario,
		});

		const saved = await this.faqRepo.save(faq);

		try {
			await this.auditoriaService.logCreacion('FAQ', idUsuario, saved.Id_FAQ, {
				Pregunta: saved.Pregunta,
				Respuesta: saved.Respuesta,
				Visible: saved.Visible,
			});
		} catch (error) {
			console.error('Error al registrar auditoría de creación de FAQ:', error);
		}

		return {
			...saved,
			Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario),
		};
	}

	async findAll(): Promise<GetFAQSimpleDTO[]> {
		const FAQ = await this.faqRepo.find({ where: { Visible: true } });
		return FAQ.map((f) => ({ Pregunta: f.Pregunta, Respuesta: f.Respuesta }));
	}

	//get exclusivo para el admin
	async findAllAdmin() {
		const FAQ = await this.faqRepo.createQueryBuilder('faq')
			.leftJoinAndSelect('faq.Usuario', 'usuario')
			.getMany();

		return Promise.all(FAQ.map(async (faq) => ({
			...faq,
			Usuario: faq.Usuario ?
				await this.usuariosService.FormatearUsuarioResponse(faq.Usuario) : null
		})));
	}

	async findOne(id: number) {
		const FAQ = await this.faqRepo.createQueryBuilder('faq')
			.leftJoinAndSelect('faq.Usuario', 'usuario')
			.where('faq.Id_FAQ = :id', { id })
			.getOne();

		if (!FAQ) throw new NotFoundException('FAQ not found');

		return {
			...FAQ,
			Usuario: FAQ.Usuario ?
				await this.usuariosService.FormatearUsuarioResponse(FAQ.Usuario) : null
		}
	}

	async update(id: number, updateDto: UpdateFAQDto, idUsuario: number) {
		if (!idUsuario) throw new BadRequestException('El ID de usuario es obligatorio para actualizar una FAQ.');

		const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
		if (!usuario) throw new NotFoundException('Usuario no encontrado.');

		const faq = await this.faqRepo.findOne({ where: { Id_FAQ: id } });
		if (!faq) throw new NotFoundException('FAQ not found');

		const datosAnteriores = {
			Pregunta: faq.Pregunta,
			Respuesta: faq.Respuesta
		};

		// Validar duplicados si se actualiza pregunta o respuesta
		if (updateDto.Pregunta !== undefined || updateDto.Respuesta !== undefined) {
			const preguntaToCheck = updateDto.Pregunta ?? faq.Pregunta;
			const respuestaToCheck = updateDto.Respuesta ?? faq.Respuesta;

			const existing = await this.faqRepo
				.createQueryBuilder('faq')
				.where('(LOWER(faq.Pregunta) = LOWER(:pregunta) OR LOWER(faq.Respuesta) = LOWER(:respuesta)) AND faq.Id_FAQ != :id', {
					pregunta: preguntaToCheck,
					respuesta: respuestaToCheck,
					id,
				})
				.getOne();

			if (existing) throw new BadRequestException('Ya existe una pregunta o respuesta igual.');
		}

		if (updateDto.Pregunta !== undefined) faq.Pregunta = updateDto.Pregunta;
		if (updateDto.Respuesta !== undefined) faq.Respuesta = updateDto.Respuesta;

		const saved = await this.faqRepo.save(faq);

		try {
			await this.auditoriaService.logActualizacion('FAQ', idUsuario, saved.Id_FAQ, datosAnteriores, {
				Pregunta: saved.Pregunta,
				Respuesta: saved.Respuesta,
			});
		} catch (error) {
			console.error('Error al registrar auditoría de actualización de FAQ:', error);
		}

		return {
			...saved,
			Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario),
		}
	}

	async remove(id: number, idUsuario: number) {
		if (!idUsuario) throw new BadRequestException('El ID de usuario es obligatorio para eliminar una FAQ.');

		const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
		if (!usuario) throw new NotFoundException('Usuario no encontrado.');

		const faq = await this.faqRepo.findOne({ where: { Id_FAQ: id } });
		if (!faq) throw new NotFoundException('FAQ not found');

		const datosEliminados = {
			Id_FAQ: faq.Id_FAQ,
			Pregunta: faq.Pregunta,
			Respuesta: faq.Respuesta
		};

		try {
			await this.auditoriaService.logEliminacion('FAQ', idUsuario, faq.Id_FAQ, datosEliminados);
		} catch (error) {
			console.error('Error al registrar auditoría de eliminación de FAQ:', error);
		}

		return this.faqRepo.remove(faq);
	}

	async toggleVisible(id: number, idUsuario: number) {
		if (!idUsuario) throw new BadRequestException('El ID de usuario es obligatorio para cambiar la visibilidad de una FAQ.');

		const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
		if (!usuario) throw new NotFoundException('Usuario no encontrado.');

		const faq = await this.faqRepo.findOne({ where: { Id_FAQ: id } });
		if (!faq) throw new NotFoundException('FAQ not found');

		const datosAnteriores = {
			Visible: faq.Visible
		};

		faq.Visible = !faq.Visible;

		const saved = await this.faqRepo.save(faq);

		try {
			await this.auditoriaService.logActualizacion('FAQ', idUsuario, saved.Id_FAQ, datosAnteriores, {
				Visible: saved.Visible,
			});
		} catch (error) {
			console.error('Error al registrar auditoría de actualización de visibilidad de FAQ:', error);
		}

		return {
			...saved,
			Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario),
		}
	}
}