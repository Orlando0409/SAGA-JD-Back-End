import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from '../InventarioEntities/Material.Entity';
import { In, Repository } from 'typeorm';
import { EstadoMaterial } from '../InventarioEntities/EstadoMaterial.Entity';
import { CreateMaterialDto } from "../InventarioDTO's/CreateMaterial.dto";
import { Categoria } from '../InventarioEntities/Categoria.Entity';
import { MaterialCategoria } from '../InventarioEntities/MaterialCategoria.Entity';
import { UpdateMaterialDto } from "../InventarioDTO's/UpdateMaterial.dto";
import { UnidadMedicion } from '../InventarioEntities/UnidadMedicion.Entity';
import { IngresoEgresoMaterialDto } from "../InventarioDTO's/IngresoEgresoMaterial.dto";

@Injectable()
export class MaterialService {
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
    ) {}

    async getAllMaterials() {
        return this.inventarioRepository.find({ relations: ['Estado_Material', 'Unidad_Medicion', 'materialCategorias', 'materialCategorias.Categoria'] });
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
        const NombreNormalizado = dto.Nombre_Material[0].toUpperCase() + dto.Nombre_Material.slice(1).toLowerCase();

        const materialExistente = await this.inventarioRepository.findOne({ where: { Nombre_Material: NombreNormalizado }, });
        if (materialExistente) { throw new ConflictException('Ya existe un material con este nombre'); }

        const UnidadMedicionExistente = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: dto.Id_Unidad_Medicion }, });
        if (!UnidadMedicionExistente) { throw new BadRequestException('La unidad de medición proporcionada no existe'); }

        if (UnidadMedicionExistente.Estado_Unidad_Medicion.Nombre_Estado_Unidad_Medicion !== 'Activo') {
            throw new BadRequestException('La unidad de medición proporcionada no está activa');
        }

        // Validar categorías si se proporcionan
        let categorias: Categoria[] = [];
        if (dto.IDS_Categorias && dto.IDS_Categorias.length > 0) {
            categorias = await this.categoriaRepository.find({ where: { Id_Categoria: In(dto.IDS_Categorias) } });

            if (categorias.length !== dto.IDS_Categorias.length) { throw new BadRequestException('Una o más categorías no existen'); }
        }

        // Crear el material
        const material = this.inventarioRepository.create({
            ...dto,
            Nombre_Material: NombreNormalizado,
            Unidad_Medicion: UnidadMedicionExistente,
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

    async updateMaterial(Id_Material: number, dto: UpdateMaterialDto) {
        const materialExistente = await this.inventarioRepository.findOne({ where: { Id_Material: Id_Material }, relations: ['materialCategorias', 'materialCategorias.Categoria'] });
        if (!materialExistente) { throw new NotFoundException(`Material con ID ${Id_Material} no encontrado`); }

        const UnidadMedicionExistente = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: dto.Id_Unidad_Medicion } });
        if (!UnidadMedicionExistente) { throw new BadRequestException('La unidad de medición proporcionada no existe'); }

        if (UnidadMedicionExistente.Estado_Unidad_Medicion.Nombre_Estado_Unidad_Medicion !== 'Activo') {
            throw new BadRequestException('La unidad de medición proporcionada no esta activa');
        }

        // Validar si el nuevo nombre ya existe en otro material
        if (dto.Nombre_Material && (dto.Nombre_Material[0].toUpperCase() + dto.Nombre_Material.slice(1).toLowerCase()) !== materialExistente.Nombre_Material) {
            const NombreNormalizado = dto.Nombre_Material[0].toUpperCase() + dto.Nombre_Material.slice(1).toLowerCase();

            const materialExistenteConNombre = await this.inventarioRepository.findOne({ where: { Nombre_Material: NombreNormalizado } });
            if (materialExistenteConNombre) { throw new BadRequestException(`Ya existe un material con el nombre "${NombreNormalizado}"`); }
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
            Unidad_Medicion: UnidadMedicionExistente,
        };

        // Normalizar nombre si se proporciona
        if (datosActualizacion.Nombre_Material) {
            materialActualizado.Nombre_Material = datosActualizacion.Nombre_Material[0].toUpperCase() + datosActualizacion.Nombre_Material.slice(1).toLowerCase();
        }

        await this.inventarioRepository.save(materialActualizado);

        // Retornar el material con todas sus relaciones
        return this.inventarioRepository.findOne({ where: { Id_Material: Id_Material }, relations: ['Estado_Material', 'Unidad_Medicion', 'materialCategorias', 'materialCategorias.Categoria'] });
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
        return this.inventarioRepository.findOne({ where: { Id_Material: Id_Material }, relations: ['Estado_Material', 'Unidad_Medicion', 'materialCategorias', 'materialCategorias.Categoria'] });
    }


}