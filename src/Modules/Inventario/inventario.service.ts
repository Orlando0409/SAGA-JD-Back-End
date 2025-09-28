import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './InventarioEntities/Material.Entity';
import { Repository } from 'typeorm';
import { EstadoMaterial } from './InventarioEntities/EstadoMaterial.Entity';
import { CategoriaMaterial } from './InventarioEntities/CategoriaMaterial.Entity';
import { CreateMaterialDto } from './InventarioDTO\'s/CreateMaterial.dto';
import { CreateCategoriaMaterialDto } from './InventarioDTO\'s/CreateCategoriaMaterial.dto';

@Injectable()
export class InventarioService {
    constructor(
        @InjectRepository(Material)
        private readonly inventarioRepository: Repository<Material>,

        @InjectRepository(EstadoMaterial)
        private readonly estadoMaterialRepository: Repository<EstadoMaterial>,

        @InjectRepository(CategoriaMaterial)
        private readonly categoriaMaterialRepository: Repository<CategoriaMaterial>,
    ) {}

    async getAllMaterials() {
        return this.inventarioRepository.find({ relations: ['Estado_Material'] });
    }

    async getAllCategories() {
        return this.categoriaMaterialRepository.find();
    }

    async getMaterialesWithCategory() {
        return this.inventarioRepository.find({ relations: ['Estado_Material', 'Categoria'] });
    }

    async getMaterialsWithStock() {
        return this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .where('material.Cantidad > 0')
            .orderBy('material.Nombre_Material')
            .getMany();
    }

    async createMaterial(dto: CreateMaterialDto) {
        const NombreToUpperCase = dto.Nombre_Material.toUpperCase();

        const materialExistente = await this.inventarioRepository.findOne({ where: { Nombre_Material: NombreToUpperCase } });
        if (materialExistente) {
            throw new BadRequestException(`El material "${NombreToUpperCase}" ya se encuentra registrado`);
        }

        // Buscar las categorías por sus IDs
        const categorias = await this.categoriaMaterialRepository.findByIds(dto.IDS_Categorias);
        if (categorias.length === 0) {
            throw new BadRequestException('No se encontraron categorías válidas');
        }
        if (categorias.length !== dto.IDS_Categorias.length) {
            throw new BadRequestException('Algunas categorías no existen');
        }

        // Crear el material con las categorías asignadas
        const { IDS_Categorias, ...materialData } = dto; // Excluir IDS_Categorias del spread
        const material = this.inventarioRepository.create({
            ...materialData,
            Nombre_Material: NombreToUpperCase,
            Categorias: categorias
        });

        return this.inventarioRepository.save(material);
    }

    async createCategoria(dto: CreateCategoriaMaterialDto) {
        const CategoriaToUpperCase = dto.Nombre_Categoria.toUpperCase();
        const categoriaExistente = await this.categoriaMaterialRepository.findOne({ where: { Nombre_Categoria_Material: CategoriaToUpperCase } });
        if (categoriaExistente) {
            throw new BadRequestException(`La categoría "${CategoriaToUpperCase}" ya se encuentra registrada`);
        }

        const categoria = this.categoriaMaterialRepository.create({
            ...dto,
            Nombre_Categoria_Material: CategoriaToUpperCase,
        });

        return this.categoriaMaterialRepository.save(categoria);
    }
}