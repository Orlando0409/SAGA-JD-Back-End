import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './InventarioEntities/Material.Entity';
import { In, Repository } from 'typeorm';
import { EstadoMaterial } from './InventarioEntities/EstadoMaterial.Entity';
import { MaterialCategoria } from './InventarioEntities/MaterialCategoria.Entity';
import { CreateMaterialDto } from './InventarioDTO\'s/CreateMaterial.dto';
import { CreateCategoriaDto } from './InventarioDTO\'s/CreateCategoria.dto';
import { Categoria } from './InventarioEntities/Categoria.Entity';

@Injectable()
export class InventarioService {
    constructor(
        @InjectRepository(Material)
        private readonly inventarioRepository: Repository<Material>,

        @InjectRepository(EstadoMaterial)
        private readonly estadoMaterialRepository: Repository<EstadoMaterial>,

        @InjectRepository(Categoria)
        private readonly categoriaRepository: Repository<Categoria>,

        @InjectRepository(MaterialCategoria)
        private readonly materialCategoriaRepository: Repository<MaterialCategoria>,
    ) {}

    async getAllMaterials() {
        return this.inventarioRepository.find({ 
            relations: ['Estado_Material', '_Categorias', '_Categorias.Categoria'] 
        });
    }

    async getAllCategories() {
        return this.categoriaRepository.find();
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

        const materialExistente = await this.inventarioRepository.findOne({
            where: { Nombre_Material: NombreToUpperCase },
        });
        
        if (materialExistente) {
            throw new ConflictException('Ya existe un material con este nombre');
        }

        // Validar categorías si se proporcionan
        let categorias: Categoria[] = [];
        if (dto.IDS_Categorias && dto.IDS_Categorias.length > 0) {
            categorias = await this.categoriaRepository.find({
                where: { Id_Categoria: In(dto.IDS_Categorias) }
            });

            if (categorias.length !== dto.IDS_Categorias.length) {
                throw new BadRequestException('Una o más categorías no existen');
            }
        }

        // Crear el material
        const material = this.inventarioRepository.create({
            Nombre_Material: NombreToUpperCase,
            Descripcion: dto.Descripcion,
            Cantidad: dto.Cantidad,
            Precio_Unitario: dto.Precio_Unitario,
        });

        const savedMaterial = await this.inventarioRepository.save(material);

        // Crear las relaciones con categorías si existen
        if (categorias.length > 0) {
            const materialCategorias = categorias.map(categoria => {
                return this.materialCategoriaRepository.create({
                    Material: savedMaterial,
                    Categoria: categoria
                });
            });

            await this.materialCategoriaRepository.save(materialCategorias);
        }

        // Retornar el material con las categorías cargadas
        return this.inventarioRepository.findOne({
            where: { Id_Material: savedMaterial.Id_Material },
            relations: ['Estado_Material', '_Categorias', '_Categorias.Categoria']
        });
    }

    async addCategoriaToMaterial(Id_Material: number, Id_Categoria: number) {
        // Buscar el material
        const material = await this.inventarioRepository.findOne({ 
            where: { Id_Material: Id_Material },
            relations: ['_Categorias', '_Categorias.Categoria']
        });
        if (!material) {
            throw new NotFoundException(`Material con ID ${Id_Material} no encontrado`);
        }

        // Buscar la categoría
        const categoria = await this.categoriaRepository.findOne({
            where: { Id_Categoria: Id_Categoria }
        });
        if (!categoria) {
            throw new NotFoundException(`Categoría con ID ${Id_Categoria} no encontrada`);
        }

        // Verificar si ya existe la relación
        const relacionExistente = await this.materialCategoriaRepository.findOne({
            where: {
                Material: { Id_Material: Id_Material },
                Categoria: { Id_Categoria: Id_Categoria }
            }
        });
        if (relacionExistente) {
            throw new BadRequestException('La categoría ya está asignada a este material');
        }

        // Crear la relación
        const materialCategoria = this.materialCategoriaRepository.create({
            Material: material,
            Categoria: categoria
        });

        await this.materialCategoriaRepository.save(materialCategoria);

        // Retornar el material actualizado con todas las categorías
        return this.inventarioRepository.findOne({
            where: { Id_Material: Id_Material },
            relations: ['Estado_Material', '_Categorias', '_Categorias.Categoria']
        });
    }

    async removeCategoriaFromMaterial(Id_Material: number, Id_Categoria: number) {
        const relacion = await this.materialCategoriaRepository.findOne({
            where: {
                Material: { Id_Material: Id_Material },
                Categoria: { Id_Categoria: Id_Categoria }
            }
        });

        if (!relacion) {
            throw new NotFoundException('La relación entre el material y la categoría no existe');
        }

        await this.materialCategoriaRepository.remove(relacion);

        // Retornar el material actualizado con las categorías restantes
        return this.inventarioRepository.findOne({
            where: { Id_Material: Id_Material },
            relations: ['Estado_Material', '_Categorias', '_Categorias.Categoria']
        });
    }

    async createCategoria(dto: CreateCategoriaDto) {
        const CategoriaToUpperCase = dto.Nombre_Categoria.toUpperCase();
        const categoriaExistente = await this.categoriaRepository.findOne({ where: { Nombre_Categoria: CategoriaToUpperCase } });
        if (categoriaExistente) {
            throw new BadRequestException(`La categoría "${CategoriaToUpperCase}" ya se encuentra registrada`);
        }

        const categoria = this.categoriaRepository.create({
            ...dto,
            Nombre_Categoria: CategoriaToUpperCase,
        });

        return this.categoriaRepository.save(categoria);
    }
}