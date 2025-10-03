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
import { UserEntity } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';

@Injectable()
export class MaterialService {
    constructor(
        @InjectRepository(Material)
        private readonly inventarioRepository: Repository<Material>,

        @InjectRepository(Categoria)
        private readonly categoriaRepository: Repository<Categoria>,

        @InjectRepository(MaterialCategoria)
        private readonly materialCategoriaRepository: Repository<MaterialCategoria>,

        @InjectRepository(UnidadMedicion)
        private readonly unidadMedicionRepository: Repository<UnidadMedicion>,

        @InjectRepository(UserEntity)
        private readonly usuarioRepository: Repository<UserEntity>,
    ) {}

    async getAllMateriales() {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estadoMaterial')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario_Creador', 'usuarioCreador')
            .getMany();

        return materiales.map(material => {
            const { Usuario_Creador, materialCategorias, ...materialSinUsuario } = material;
            return {
                ...materialSinUsuario,
                Categorias: materialCategorias,
                Usuario_Creador: material.Usuario_Creador ? {
                    Id_Usuario: material.Usuario_Creador.Id_Usuario,
                    Nombre_Usuario: material.Usuario_Creador.Nombre_Usuario,
                    Id_Rol: material.Usuario_Creador.Id_Rol
                } : null
            };
        });
    }

    async getMaterialesConCategorias() {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario_Creador', 'usuarioCreador')
            .where('Categorias.Id_Material_Categoria IS NOT NULL')
            .getMany();

        return materiales.map(material => {
            const { Usuario_Creador, materialCategorias, ...materialSinUsuario } = material;
            return {
                ...materialSinUsuario,
                Categorias: materialCategorias,
                Usuario_Creador: material.Usuario_Creador ? {
                    Id_Usuario: material.Usuario_Creador.Id_Usuario,
                    Nombre_Usuario: material.Usuario_Creador.Nombre_Usuario,
                    Id_Rol: material.Usuario_Creador.Id_Rol
                } : null
            };
        });
    }

    async getMaterialesSinCategorias() {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.Usuario_Creador', 'usuarioCreador')
            .leftJoin('material.materialCategorias', 'Categorias')
            .where('Categorias.Id_Material_Categoria IS NULL')
            .getMany();

        return materiales.map(material => {
            const { Usuario_Creador, materialCategorias, ...materialSinUsuario } = material;
            return {
                ...materialSinUsuario,
                Categorias: materialCategorias,
                Usuario_Creador: material.Usuario_Creador ? {
                    Id_Usuario: material.Usuario_Creador.Id_Usuario,
                    Nombre_Usuario: material.Usuario_Creador.Nombre_Usuario,
                    Id_Rol: material.Usuario_Creador.Id_Rol
                } : null
            };
        });
    }

    async getMaterialesPorEncimaDeStock(threshold: number) {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario_Creador', 'usuarioCreador')
            .where('material.Cantidad > :threshold', { threshold })
            .orderBy('material.Cantidad', 'DESC')
            .getMany();

        return materiales.map(material => {
            const { Usuario_Creador, materialCategorias, ...materialSinUsuario } = material;
            return {
                ...materialSinUsuario,
                Categorias: materialCategorias,
                Usuario_Creador: material.Usuario_Creador ? {
                    Id_Usuario: material.Usuario_Creador.Id_Usuario,
                    Nombre_Usuario: material.Usuario_Creador.Nombre_Usuario,
                    Id_Rol: material.Usuario_Creador.Id_Rol
                } : null
            };
        });
    }

    async getMaterialesPorDebajoDeStock(threshold: number) {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario_Creador', 'usuarioCreador')
            .where('material.Cantidad < :threshold', { threshold })
            .orderBy('material.Cantidad', 'ASC')
            .getMany();

        return materiales.map(material => {
            const { Usuario_Creador, materialCategorias, ...materialSinUsuario } = material;
            return {
                ...materialSinUsuario,
                Categorias: materialCategorias,
                Usuario_Creador: material.Usuario_Creador ? {
                    Id_Usuario: material.Usuario_Creador.Id_Usuario,
                    Nombre_Usuario: material.Usuario_Creador.Nombre_Usuario,
                    Id_Rol: material.Usuario_Creador.Id_Rol
                } : null
            };
        });
    }

    async createMaterial(dto: CreateMaterialDto, idUsuarioCreador: number) {
        const NombreNormalizado = dto.Nombre_Material[0].toUpperCase() + dto.Nombre_Material.slice(1).toLowerCase();

        const materialExistente = await this.inventarioRepository.findOne({ where: { Nombre_Material: NombreNormalizado }, });
        if (materialExistente) { throw new ConflictException('Ya existe un material con este nombre'); }

        const UnidadMedicionExistente = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: dto.Id_Unidad_Medicion }, });
        if (!UnidadMedicionExistente) { throw new BadRequestException('La unidad de medición proporcionada no existe'); }

        if (UnidadMedicionExistente.Estado_Unidad_Medicion.Nombre_Estado_Unidad_Medicion !== 'Activo') {
            throw new BadRequestException('La unidad de medición proporcionada no está activa');
        }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuarioCreador }, relations: ['Rol'] });
        if (!usuario) { throw new BadRequestException(`Usuario con ID ${idUsuarioCreador} no encontrado`); }

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
            Usuario_Creador: usuario,
        });

        const savedMaterial = await this.inventarioRepository.save(material);

        // Crear las relaciones con categorías si existen
        if (categorias.length > 0) {
            const materialCategorias = categorias.map(categoria => {
                return this.materialCategoriaRepository.create({ Material: savedMaterial, Categoria: categoria });
            });

            await this.materialCategoriaRepository.save(materialCategorias);
        }

        const materialCreado = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estadoMaterial')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .where('material.Id_Material = :id', { id: savedMaterial.Id_Material })
            .getOne();

        if (!materialCreado) {
            throw new NotFoundException('Error al recuperar el material creado');
        }

        // Excluir Usuario_Creador del spread para evitar duplicados
        const { Usuario_Creador, materialCategorias, ...materialSinUsuario } = materialCreado;

        return {
            ...materialSinUsuario,
            Categorias: materialCategorias,
            Usuario_Creador: {
                Id_Usuario: usuario.Id_Usuario,
                Nombre_Usuario: usuario.Nombre_Usuario,
                Id_Rol: usuario.Id_Rol
            }
        }
    }

    async updateMaterial(Id_Material: number, dto: UpdateMaterialDto) {
        const materialExistente = await this.inventarioRepository.findOne({ where: { Id_Material: Id_Material }, relations: ['materialCategorias', 'materialCategorias.Categoria'] });
        if (!materialExistente) { throw new NotFoundException(`Material con ID ${Id_Material} no encontrado`); }

        const UnidadMedicionExistente = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: dto.Id_Unidad_Medicion } });
        if (!UnidadMedicionExistente) { throw new BadRequestException('La unidad de medición proporcionada no existe'); }

        if (UnidadMedicionExistente.Estado_Unidad_Medicion.Nombre_Estado_Unidad_Medicion !== 'Activo') {
            throw new BadRequestException('La unidad de medición proporcionada no esta activa');
        }

        if (dto.Nombre_Material && (dto.Nombre_Material[0].toUpperCase() + dto.Nombre_Material.slice(1).toLowerCase()) !== materialExistente.Nombre_Material) {
            const NombreNormalizado = dto.Nombre_Material[0].toUpperCase() + dto.Nombre_Material.slice(1).toLowerCase();

            const materialExistenteConNombre = await this.inventarioRepository.findOne({ where: { Nombre_Material: NombreNormalizado } });
            if (materialExistenteConNombre) { throw new BadRequestException(`Ya existe un material con el nombre "${NombreNormalizado}"`); }
        }

        // Manejar categorias si se proporcionan (incluso si es array vacio)
        if (dto.IDS_Categorias !== undefined) {
            let nuevasCategorias: Categoria[] = [];
            if (dto.IDS_Categorias && dto.IDS_Categorias.length > 0) {
                nuevasCategorias = await this.categoriaRepository.find({ where: { Id_Categoria: In(dto.IDS_Categorias) } });

                if (nuevasCategorias.length !== dto.IDS_Categorias.length) { throw new BadRequestException('Una o más categorías no existen'); }
            }

            // Obtener las categorias actualmente asignadas al material
            const categoriasActuales = materialExistente.materialCategorias || [];
            const idsCategoriasActuales = categoriasActuales.map(mc => mc.Categoria.Id_Categoria);
            const idsCategoriasNuevas = dto.IDS_Categorias || [];

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
        const { materialCategorias: categoriasExistentes, Estado_Material, ...materialSinRelaciones } = materialExistente;
        
        const materialActualizado = {
            ...materialSinRelaciones,
            ...datosActualizacion,
            Unidad_Medicion: UnidadMedicionExistente,
        };

        if (datosActualizacion.Nombre_Material) {
            materialActualizado.Nombre_Material = datosActualizacion.Nombre_Material[0].toUpperCase() + datosActualizacion.Nombre_Material.slice(1).toLowerCase();
        }

        await this.inventarioRepository.save(materialActualizado);

        const materialActualizadoCompleto = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estadoMaterial')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario_Creador', 'usuarioCreador')
            .where('material.Id_Material = :id', { id: Id_Material })
            .getOne();

        if (!materialActualizadoCompleto) {
            throw new NotFoundException('Error al recuperar el material actualizado');
        }

        // Excluir Usuario_Creador del spread para evitar duplicados
        const { Usuario_Creador, materialCategorias, ...materialSinUsuario } = materialActualizadoCompleto;

        return {
            ...materialSinUsuario,
            Categorias: materialCategorias,
            Usuario_Creador: {
                Id_Usuario: materialActualizadoCompleto.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: materialActualizadoCompleto.Usuario_Creador.Nombre_Usuario,
                Id_Rol: materialActualizadoCompleto.Usuario_Creador.Id_Rol
            }
        };
    }
}