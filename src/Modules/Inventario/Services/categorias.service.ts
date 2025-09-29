import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../InventarioEntities/Categoria.Entity';
import { CreateCategoriaDto } from "../InventarioDTO's/CreateCategoria.dto";
import { UpdateCategoriaDto } from "../InventarioDTO's/UpdateCategoria.dto";

@Injectable()
export class CategoriasService {
    constructor(
        @InjectRepository(Categoria)
        private readonly categoriaRepository: Repository<Categoria>,
    ) {}

    async getAllCategories() {
        return this.categoriaRepository.find();
    }

    async createCategoria(dto: CreateCategoriaDto) {
        const CategoriaNormalizada = dto.Nombre_Categoria[0].toUpperCase() + dto.Nombre_Categoria.slice(1).toLowerCase();

        const categoriaExistente = await this.categoriaRepository.findOne({ where: { Nombre_Categoria: CategoriaNormalizada } });
        if (categoriaExistente) { throw new BadRequestException(`La categoría "${CategoriaNormalizada}" ya se encuentra registrada`); }

        const categoria = this.categoriaRepository.create({
            ...dto,
            Nombre_Categoria: CategoriaNormalizada,
        });

        return this.categoriaRepository.save(categoria);
    }

    async updateCategoria(Id_Categoria: number, dto: UpdateCategoriaDto) {
        const categoriaExistente = await this.categoriaRepository.findOne({ where: { Id_Categoria: Id_Categoria } });
        if (!categoriaExistente) { throw new NotFoundException(`Categoría con ID ${Id_Categoria} no encontrada`); }

        // Validar nombre único si se está actualizando
        if (dto.Nombre_Categoria && (dto.Nombre_Categoria[0].toUpperCase() + dto.Nombre_Categoria.slice(1).toLowerCase()) !== categoriaExistente.Nombre_Categoria) {
            const nombreNormalizado = dto.Nombre_Categoria[0].toUpperCase() + dto.Nombre_Categoria.slice(1).toLowerCase();
            const categoriaConNombre = await this.categoriaRepository.findOne({ where: { Nombre_Categoria: nombreNormalizado } });
            if (categoriaConNombre) { throw new ConflictException(`Ya existe una categoría con el nombre "${nombreNormalizado}"`); }
        }

        // Actualizar la categoría con normalización
        const datosActualizados = { ...dto };
        if (dto.Nombre_Categoria) {
            datosActualizados.Nombre_Categoria = dto.Nombre_Categoria[0].toUpperCase() + dto.Nombre_Categoria.slice(1).toLowerCase();
        }
        Object.assign(categoriaExistente, datosActualizados);
        return this.categoriaRepository.save(categoriaExistente);
    }
}
