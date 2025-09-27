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
import { UnidadMedicion } from './InventarioEntities/UnidadMedicion.Entity';
import { CreateUnidadMedicionDto } from './InventarioDTO\'s/CreateUnidadMedicion.dto';
import { IngresoEgresoMaterialDto } from './InventarioDTO\'s/IngresoEgresoMaterial.dto';
import { EstadoUnidadMedicion } from './InventarioEntities/EstadoUnidadMedicion.Entity';
import { UpdateCategoriaDto } from './InventarioDTO\'s/UpdateCategoria.dto';
import { UpdateUnidadMedicionDto } from './InventarioDTO\'s/UpdateUnidadMedicion.dto';

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

        @InjectRepository(UnidadMedicion)
        private readonly unidadMedicionRepository: Repository<UnidadMedicion>,

        @InjectRepository(EstadoUnidadMedicion)
        private readonly estadoUnidadMedicionRepository: Repository<EstadoUnidadMedicion>,
    ) {}

    async getAllMaterials() {
        return this.inventarioRepository.find({ relations: ['Estado_Material', 'Unidad_Medicion', 'materialCategorias', 'materialCategorias.Categoria'] });
    }

    async getAllCategories() {
        return this.categoriaRepository.find();
    }

    async getAllUnidadesMedicion() {
        return this.unidadMedicionRepository.find({ relations: ['Estado_Unidad_Medicion'] });
    }

    async getMaterialesConCategorias() {
        return this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'materialCategorias')
            .leftJoinAndSelect('materialCategorias.Categoria', 'categoria')
            .where('materialCategorias.Id_Material_Categoria IS NOT NULL')
            .getMany();
    }

    async getMaterialesSinCategorias() {
        return this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
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

        // Validar unidad de medición si se proporciona
        if (dto.Id_Unidad_Medicion) {
            const unidadMedicion = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: dto.Id_Unidad_Medicion } });
            if (!unidadMedicion) { throw new BadRequestException('La unidad de medición no existe o está inactiva'); }
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

        return this.inventarioRepository.findOne({ where: { Id_Material: savedMaterial.Id_Material }, relations: ['Estado_Material', 'Unidad_Medicion', 'materialCategorias', 'materialCategorias.Categoria'] });
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

    async createUnidadMedicion(dto: CreateUnidadMedicionDto) {
        const nombreToUpperCase = dto.Nombre_Unidad_Medicion.toUpperCase();
        const abreviaturaToLowerCase = dto.Abreviatura.toLowerCase();

        // Verificar que no exista una unidad con el mismo nombre
        const unidadExistentePorNombre = await this.unidadMedicionRepository.findOne({ 
            where: { Nombre_Unidad: nombreToUpperCase } 
        });
        if (unidadExistentePorNombre) {
            throw new ConflictException(`Ya existe una unidad de medición con el nombre "${nombreToUpperCase}"`);
        }

        // Verificar que no exista una unidad con la misma abreviatura
        const unidadExistentePorAbrev = await this.unidadMedicionRepository.findOne({ 
            where: { Abreviatura: abreviaturaToLowerCase } 
        });
        if (unidadExistentePorAbrev) {
            throw new ConflictException(`Ya existe una unidad de medición con la abreviatura "${abreviaturaToLowerCase}"`);
        }

        const unidad = this.unidadMedicionRepository.create({
            Nombre_Unidad: nombreToUpperCase,
            Abreviatura: abreviaturaToLowerCase,
            Descripcion: dto.Descripcion,
        });

        await this.unidadMedicionRepository.save(unidad);
        return this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: unidad.Id_Unidad_Medicion }, relations: ['Estado_Unidad_Medicion'] });
    }

    async updateMaterial(Id_Material: number, dto: UpdateMaterialDto) {
        const materialExistente = await this.inventarioRepository.findOne({ where: { Id_Material: Id_Material }, relations: ['materialCategorias', 'materialCategorias.Categoria'] });
        if (!materialExistente) { throw new NotFoundException(`Material con ID ${Id_Material} no encontrado`); }

        // Validar si el nuevo nombre ya existe en otro material
        if (dto.Nombre_Material && dto.Nombre_Material.toUpperCase() !== materialExistente.Nombre_Material) {
            const NombreToUpperCase = dto.Nombre_Material.toUpperCase();

            const materialExistenteConNombre = await this.inventarioRepository.findOne({ where: { Nombre_Material: NombreToUpperCase } });
            if (materialExistenteConNombre) { throw new BadRequestException(`Ya existe un material con el nombre "${NombreToUpperCase}"`); }
        }

        // Manejar categorias si se proporcionan (incluso si es array vacio)
        if (dto.IDS_Categorias !== undefined) {
            // Validar que las nuevas categorias existan
            let nuevasCategorias: Categoria[] = [];
            if (dto.IDS_Categorias && dto.IDS_Categorias.length > 0) {
                nuevasCategorias = await this.categoriaRepository.find({ where: { Id_Categoria: In(dto.IDS_Categorias) } });

                if (nuevasCategorias.length !== dto.IDS_Categorias.length) { throw new BadRequestException('Una o más categorías no existen'); }
            }

            // Obtener las categorias actualmente asignadas al material
            const categoriasActuales = materialExistente.materialCategorias || [];
            const idsCategoriasActuales = categoriasActuales.map(mc => mc.Categoria.Id_Categoria);
            const idsCategoriasNuevas = dto.IDS_Categorias || [];

            // Determinar cuales agregar y borrar
            const categoriasParaAgregar = idsCategoriasNuevas.filter(id => !idsCategoriasActuales.includes(id));
            const categoriasParaEliminar = idsCategoriasActuales.filter(id => !idsCategoriasNuevas.includes(id));

            // Eliminar SOLO las categorias que ya no están en el material
            if (categoriasParaEliminar.length > 0) {
                await this.materialCategoriaRepository.delete({ Material: { Id_Material: Id_Material }, Categoria: { Id_Categoria: In(categoriasParaEliminar) } });
            }

            // Agregar SOLO las categorias nuevas
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
        return this.inventarioRepository.findOne({ where: { Id_Material: Id_Material }, relations: ['Estado_Material', 'Tipo_Unidad_Medicion', 'materialCategorias', 'materialCategorias.Categoria'] });
    }

    async updateCategoria(Id_Categoria: number, dto: UpdateCategoriaDto) {
        const categoriaExistente = await this.categoriaRepository.findOne({ where: { Id_Categoria: Id_Categoria } });
        if (!categoriaExistente) { throw new NotFoundException(`Categoría con ID ${Id_Categoria} no encontrada`); }

        // Validar nombre único si se está actualizando
        if (dto.Nombre_Categoria && dto.Nombre_Categoria.toLowerCase() !== categoriaExistente.Nombre_Categoria.toLowerCase()) {
            const nombreToLowerCase = dto.Nombre_Categoria.toLowerCase();
            const categoriaConNombre = await this.categoriaRepository.findOne({ where: { Nombre_Categoria: nombreToLowerCase } });
            if (categoriaConNombre) { throw new ConflictException(`Ya existe una categoría con el nombre "${nombreToLowerCase}"`); }
        }

        // Actualizar la categoría
        Object.assign(categoriaExistente, dto);
        return this.categoriaRepository.save(categoriaExistente);
    }

    async updateUnidadMedicion(Id_Unidad_Medicion: number, dto: UpdateUnidadMedicionDto) {
        const unidadExistente = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: Id_Unidad_Medicion } });
        if (!unidadExistente) { throw new NotFoundException(`Unidad de medición con ID ${Id_Unidad_Medicion} no encontrada`); }

        // Validar nombre único si se está actualizando
        if (dto.Nombre_Unidad_Medicion && dto.Nombre_Unidad_Medicion.toUpperCase() !== unidadExistente.Nombre_Unidad) {
            const nombreToUpperCase = dto.Nombre_Unidad_Medicion.toUpperCase();

            const unidadConNombre = await this.unidadMedicionRepository.findOne({ where: { Nombre_Unidad: nombreToUpperCase } });
            if (unidadConNombre) { throw new ConflictException(`Ya existe una unidad de medición con el nombre "${nombreToUpperCase}"`); }
        }

        // Validar abreviatura única si se está actualizando
        if (dto.Abreviatura && dto.Abreviatura.toUpperCase() !== unidadExistente.Abreviatura) {
            const abreviaturaToUpperCase = dto.Abreviatura.toUpperCase();

            const unidadConAbrev = await this.unidadMedicionRepository.findOne({ where: { Abreviatura: abreviaturaToUpperCase } });
            if (unidadConAbrev) { throw new ConflictException(`Ya existe una unidad de medición con la abreviatura "${abreviaturaToUpperCase}"`); }
        }

        const unidadActualizada = {
            ...unidadExistente,
            ...dto,
        };

        if (dto.Nombre_Unidad_Medicion) {
            unidadActualizada.Nombre_Unidad_Medicion = dto.Nombre_Unidad_Medicion.toUpperCase();
        }
        if (dto.Abreviatura) {
            unidadActualizada.Abreviatura = dto.Abreviatura.toUpperCase();
        }

        return this.unidadMedicionRepository.save(unidadActualizada);
    }

    async updateEstadoUnidadMedicion(Id_Unidad_Medicion: number, Id_Estado_Unidad_Medicion: number) {
        const unidad = await this.unidadMedicionRepository.findOne({ 
            where: { Id_Unidad_Medicion: Id_Unidad_Medicion }, 
            relations: ['Estado_Unidad_Medicion'] 
        });
        if (!unidad) { 
            throw new NotFoundException(`Unidad de medición con ID ${Id_Unidad_Medicion} no encontrada`); 
        }

        // Verificar que el nuevo estado existe
        const nuevoEstado = await this.estadoUnidadMedicionRepository.findOne({ 
            where: { Id_Estado_Unidad_Medicion: Id_Estado_Unidad_Medicion } 
        });
        if (!nuevoEstado) { 
            throw new NotFoundException(`Estado con ID ${Id_Estado_Unidad_Medicion} no encontrado en la base de datos`); 
        }

        // Actualizar el estado de la unidad
        unidad.Estado_Unidad_Medicion = nuevoEstado;
        await this.unidadMedicionRepository.save(unidad);
        return this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: Id_Unidad_Medicion }, relations: ['Estado_Unidad_Medicion'] });
    }

    async IngresoMaterial(Id_Material: number, dto: IngresoEgresoMaterialDto) {
        if (dto.Cantidad <= 0) { throw new BadRequestException('La cantidad a ingresar debe ser mayor que cero'); }

        const materialExistente = await this.inventarioRepository.findOne({ where: { Id_Material: Id_Material } });
        if (!materialExistente) { throw new NotFoundException('Material no encontrado'); }

        materialExistente.Cantidad += dto.Cantidad;
        if(materialExistente.Cantidad > 0) {
            const estadoActivo = await this.estadoMaterialRepository.findOne({ where: { Nombre_Estado_Material: 'DISPONIBLE' } });
            if(estadoActivo) {
                materialExistente.Estado_Material = estadoActivo;
            }
        }

        await this.inventarioRepository.save(materialExistente);
        return this.inventarioRepository.findOne({ where: { Id_Material: Id_Material }, relations: ['Estado_Material', 'materialCategorias', 'materialCategorias.Categoria'] });
    }

    async EgresoMaterial(Id_Material: number, dto: IngresoEgresoMaterialDto) {
        if (dto.Cantidad <= 0) { throw new BadRequestException('La cantidad a egresar debe ser mayor que cero'); }

        const materialExistente = await this.inventarioRepository.findOne({ where: { Id_Material: Id_Material } });
        if (!materialExistente) { throw new NotFoundException('Material no encontrado'); }

        if (materialExistente.Cantidad < dto.Cantidad) { throw new BadRequestException('No hay suficiente cantidad en inventario para realizar el egreso'); }

        materialExistente.Cantidad -= dto.Cantidad;
        if(materialExistente.Cantidad === 0) {
            const estadoInactivo = await this.estadoMaterialRepository.findOne({ where: { Nombre_Estado_Material: 'AGOTADO' } });
            if(estadoInactivo) {
                materialExistente.Estado_Material = estadoInactivo;
            }
        }

        await this.inventarioRepository.save(materialExistente);
        return this.inventarioRepository.findOne({ where: { Id_Material: Id_Material }, relations: ['Estado_Material', 'Tipo_Unidad_Medicion', 'materialCategorias', 'materialCategorias.Categoria'] });
    }

    async deleteUnidadMedicion(Id_Unidad_Medicion: number) {
        const unidad = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: Id_Unidad_Medicion }, relations: ['Materiales'] });
        if (!unidad) { throw new NotFoundException(`Unidad de medición con ID ${Id_Unidad_Medicion} no encontrada`); }

        // Verificar si hay materiales usando esta unidad
        if (unidad.Materiales && unidad.Materiales.length > 0) { throw new BadRequestException(`No se puede eliminar la unidad de medición porque ${unidad.Materiales.length} material(es) la están usando`); }

        await this.unidadMedicionRepository.remove(unidad);
        return { message: `Unidad de medición "${unidad.Nombre_Unidad}" eliminada exitosamente` };
    }
}