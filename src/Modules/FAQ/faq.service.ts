import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FAQEntity } from './FAQEntities/FAQ.Entity';
import { CreateFAQDto } from './DTOs/CreateFAQ.dto';
import { UpdateFAQDto } from './DTOs/UpdateFAQ.dto';

@Injectable()
export class FAQService {
	constructor(
		@InjectRepository(FAQEntity)
		private readonly faqRepo: Repository<FAQEntity>,
	) {}

	async create(createDto: CreateFAQDto, idUsuario: number) {
		const now = new Date();
		const faq = this.faqRepo.create({
			Pregunta: createDto.Pregunta,
			Respuesta: createDto.Respuesta,
			Fecha_Creacion: now,
			Fecha_Actualizacion: now,
			Id_Usuario: idUsuario,
		});

		return this.faqRepo.save(faq);
	}

	async findAll() {
		return this.faqRepo.find({ relations: ['Usuario'] });
	}

	async findOne(id: number) {
		const faq = await this.faqRepo.findOne({ where: { Id_FAG: id }, relations: ['Usuario'] });
		if (!faq) throw new NotFoundException('FAQ not found');
		return faq;
	}

	async update(id: number, updateDto: UpdateFAQDto, idUsuario: number) {
		const faq = await this.faqRepo.findOne({ where: { Id_FAG: id } });
		if (!faq) throw new NotFoundException('FAQ not found');

		if (updateDto.Pregunta !== undefined) faq.Pregunta = updateDto.Pregunta;
		if (updateDto.Respuesta !== undefined) faq.Respuesta = updateDto.Respuesta;

		faq.Fecha_Actualizacion = new Date();
		faq.Id_Usuario = idUsuario; // registrar quién actualizó

		return this.faqRepo.save(faq);
	}

	async remove(id: number) {
		const faq = await this.faqRepo.findOne({ where: { Id_FAG: id } });
		if (!faq) throw new NotFoundException('FAQ not found');
		return this.faqRepo.remove(faq);
	}
}

