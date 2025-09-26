import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './InventarioEntities/Material.Entity';
import { In, Repository } from 'typeorm';
import { EstadoMaterial } from './InventarioEntities/EstadoMaterial.Entity';
import { CreateMaterialDto } from './InventarioDTO\'s/CreateMaterial.dto';
import { CreateCategoriaDto } from './InventarioDTO\'s/CreateCategoria.dto';
import { Categoria } from './InventarioEntities/Categoria.Entity';
import { MaterialCategoria } from './InventarioEntities/MaterialCategoria.Entity';
import { UpdateMaterialDto } from './InventarioDTO\'s/UpdateMaterial.dto';

@Injectable()
export class InventarioService {
    constructor(
        @InjectRepository(Material)
        private readonly inventarioRepository: Repository<Material>,

        @InjectRepository(Categoria)
        private readonly categoriaRepository: Repository<Categoria>,

        @InjectRepository(EstadoMaterial)
        private readonly estadoMaterialRepository: Repository<EstadoMaterial>,

        @InjectRepository(MaterialCategoria)
        private readonly materialCategoriaRepository: Repository<MaterialCategoria>,
    ) {}

    async getAllMaterials() {
        return this.inventarioRepository.find({ relations: ['Estado_Material', 'materialCategorias', 'materialCategorias.Categoria'] });
    }

    async getAllCategories() {
        return this.categoriaRepository.find();
    }

    async getMaterialesConCategorias() {
        return this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.materialCategorias', 'materialCategorias')
            .leftJoinAndSelect('materialCategorias.Categoria', 'categoria')
            .where('materialCategorias.Id_Material_Categoria IS NOT NULL')
            .getMany();
    }

    async getMaterialesSinCategorias() {
        return this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoin('material.materialCategorias', 'materialCategorias')
            .where('materialCategorias.Id_Material_Categoria IS NULL')
            .getMany();
    }

    async getMaterialesPorEncimaDeStock(threshold: number) {
        return this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.materialCategorias', 'materialCategorias')
            .leftJoinAndSelect('materialCategorias.Categoria', 'categoria')
            .where('material.Cantidad > :threshold', { threshold })
            .orderBy('material.Cantidad', 'DESC')
            .getMany();
    }

    async getMaterialesPorDebajoDeStock(threshold: number) {
        return this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.materialCategorias', 'materialCategorias')
            .leftJoinAndSelect('materialCategorias.Categoria', 'categoria')
            .where('material.Cantidad < :threshold', { threshold })
            .orderBy('material.Cantidad', 'ASC')
            .getMany();
    }

    async createMaterial(dto: CreateMaterialDto) {
        const NombreToUpperCase = dto.Nombre_Material.toUpperCase();

        const materialExistente = await this.inventarioRepository.findOne({ where: { Nombre_Material: NombreToUpperCase }, });
        if (materialExistente) { throw new ConflictException('Ya existe un material con este nombre'); }

        // Validar categorías si se proporcionan
        let categorias: Categoria[] = [];
        if (dto.IDS_Categorias && dto.IDS_Categorias.length > 0) {
            categorias = await this.categoriaRepository.find({ where: { Id_Categoria: In(dto.IDS_Categorias) } });

            if (categorias.length !== dto.IDS_Categorias.length) { throw new BadRequestException('Una o más categorías no existen'); }
        }

        // Crear el material
        const material = this.inventarioRepository.create({
            ...dto,
            Nombre_Material: NombreToUpperCase
        });

        const savedMaterial = await this.inventarioRepository.save(material);

        // Crear las relaciones con categorías si existen
        if (categorias.length > 0) {
            const materialCategorias = categorias.map(categoria => {
                return this.materialCategoriaRepository.create({ Material: savedMaterial, Categoria: categoria });
            });

            await this.materialCategoriaRepository.save(materialCategorias);
        }

        return this.inventarioRepository.findOne({ where: { Id_Material: savedMaterial.Id_Material }, relations: ['Estado_Material', 'materialCategorias', 'materialCategorias.Categoria'] });
    }

    async createCategoria(dto: CreateCategoriaDto) {
        const CategoriaToUpperCase = dto.Nombre_Categoria.toUpperCase();

        const categoriaExistente = await this.categoriaRepository.findOne({ where: { Nombre_Categoria: CategoriaToUpperCase } });
        if (categoriaExistente) { throw new BadRequestException(`La categoría "${CategoriaToUpperCase}" ya se encuentra registrada`); }

        const categoria = this.categoriaRepository.create({
            ...dto,
            Nombre_Categoria: CategoriaToUpperCase,
        });

        return this.categoriaRepository.save(categoria);
    }

    async addCategoriaToMaterial(Id_Material: number, Id_Categoria: number) {
        // Buscar el material
        const material = await this.inventarioRepository.findOne({ where: { Id_Material: Id_Material } });
        if (!material) { throw new NotFoundException(`Material con ID ${Id_Material} no encontrado`); }

        // Buscar la categoría
        const categoria = await this.categoriaRepository.findOne({ where: { Id_Categoria: Id_Categoria } });
        if (!categoria) { throw new NotFoundException(`Categoría con ID ${Id_Categoria} no encontrada`); }

        // Verificar si ya existe la relación
        const relacionExistente = await this.materialCategoriaRepository.findOne({ where: { Material: { Id_Material: Id_Material }, Categoria: { Id_Categoria: Id_Categoria } } });
        if (relacionExistente) { throw new BadRequestException('La categoría ya está asignada a este material'); }

        // Crear la relación
        const materialCategoria = this.materialCategoriaRepository.create({ Material: material, Categoria: categoria });
        await this.materialCategoriaRepository.save(materialCategoria);

        return this.inventarioRepository.findOne({ where: { Id_Material: Id_Material }, relations: ['Estado_Material', 'materialCategorias', 'materialCategorias.Categoria'] });
    }

    async removeCategoriaFromMaterial(Id_Material: number, Id_Categoria: number) {
        const relacion = await this.materialCategoriaRepository.findOne({ where: { Material: { Id_Material: Id_Material }, Categoria: { Id_Categoria: Id_Categoria } } });
        if (!relacion) { throw new NotFoundException('La relación entre el material y la categoría no existe'); }

        await this.materialCategoriaRepository.remove(relacion);
        return this.inventarioRepository.findOne({ where: { Id_Material: Id_Material }, relations: ['Estado_Material', 'materialCategorias', 'materialCategorias.Categoria'] });
    }

    async UpdateMaterial(Id_Material: number, dto: UpdateMaterialDto) {
        const materialExistente = await this.inventarioRepository.findOne({ where: { Id_Material: Id_Material }, relations: ['materialCategorias', 'materialCategorias.Categoria'] });
        if (!materialExistente) { throw new NotFoundException(`Material con ID ${Id_Material} no encontrado`); }

        // Validar si el nuevo nombre ya existe en otro material
        if (dto.Nombre_Material && dto.Nombre_Material.toUpperCase() !== materialExistente.Nombre_Material) {
            const NombreToUpperCase = dto.Nombre_Material.toUpperCase();

            const materialExistenteConNombre = await this.inventarioRepository.findOne({ where: { Nombre_Material: NombreToUpperCase } });
            if (materialExistenteConNombre) { throw new BadRequestException(`Ya existe un material con el nombre "${NombreToUpperCase}"`); }
        }

        // Manejar categorías si se proporcionan (incluso si es array vacío)
        if (dto.IDS_Categorias !== undefined) {
            // Validar que las nuevas categorías existan
            let nuevasCategorias: Categoria[] = [];
            if (dto.IDS_Categorias && dto.IDS_Categorias.length > 0) {
                nuevasCategorias = await this.categoriaRepository.find({ where: { Id_Categoria: In(dto.IDS_Categorias) } });

                if (nuevasCategorias.length !== dto.IDS_Categorias.length) { throw new BadRequestException('Una o más categorías no existen'); }
            }

            // Obtener las categorías actualmente asignadas
            const categoriasActuales = materialExistente.materialCategorias || [];
            const idsCategoriasActuales = categoriasActuales.map(mc => mc.Categoria.Id_Categoria);
            const idsCategoriasNuevas = dto.IDS_Categorias || [];

            // Determinar qué categorías agregar y cuáles eliminar
            const categoriasParaAgregar = idsCategoriasNuevas.filter(id => !idsCategoriasActuales.includes(id));
            const categoriasParaEliminar = idsCategoriasActuales.filter(id => !idsCategoriasNuevas.includes(id));

            // Eliminar solo las categorías que ya no están en la nueva lista
            if (categoriasParaEliminar.length > 0) {
                await this.materialCategoriaRepository.delete({ Material: { Id_Material: Id_Material }, Categoria: { Id_Categoria: In(categoriasParaEliminar) } });
            }

            // Agregar solo las categorías nuevas
            if (categoriasParaAgregar.length > 0) {
                const categoriasAAgregar = nuevasCategorias.filter(cat => 
                    categoriasParaAgregar.includes(cat.Id_Categoria)
                );

                const nuevasRelaciones = categoriasAAgregar.map(categoria => {
                    return this.materialCategoriaRepository.create({ Material: { Id_Material: Id_Material } as Material, Categoria: categoria });
                });

                await this.materialCategoriaRepository.save(nuevasRelaciones);
            }
        }

        // Actualizar los campos del material (excluyendo IDS_Categorias y relaciones)
        const { IDS_Categorias, ...datosActualizacion } = dto;
        
        // Excluir explícitamente las relaciones del merge para evitar conflictos
        const { materialCategorias, Estado_Material, ...materialSinRelaciones } = materialExistente;
        
        const materialActualizado = {
            ...materialSinRelaciones,
            ...datosActualizacion,
        };

        // Convertir nombre a mayúsculas si se proporciona
        if (datosActualizacion.Nombre_Material) {
            materialActualizado.Nombre_Material = datosActualizacion.Nombre_Material.toUpperCase();
        }

        await this.inventarioRepository.save(materialActualizado);

        // Retornar el material con todas sus relaciones
        return this.inventarioRepository.findOne({ where: { Id_Material: Id_Material }, relations: ['Estado_Material', 'materialCategorias', 'materialCategorias.Categoria'] });
    }
}