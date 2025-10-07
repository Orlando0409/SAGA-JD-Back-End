import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from '../InventarioEntities/Material.Entity';
import { In, Repository } from 'typeorm';
import { EstadoMaterial } from '../InventarioEntities/EstadoMaterial.Entity';
import { CreateMaterialDto } from "../InventarioDTO's/CreateMaterial.dto";
import { Categoria } from '../InventarioEntities/Categoria.Entity';
import { MaterialCategoria } from '../InventarioEntities/MaterialCategoria.Entity';
import { MaterialProveedor } from '../InventarioEntities/MaterialProveedor.Entity';
import { UpdateMaterialDto } from "../InventarioDTO's/UpdateMaterial.dto";
import { UnidadMedicion } from '../InventarioEntities/UnidadMedicion.Entity';
import { Usuario } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';
import { ProveedorFisico, ProveedorJuridico } from 'src/Modules/Proveedores/ProveedorEntities/Proveedor.Entity';

@Injectable()
export class MaterialService {
    constructor(
        @InjectRepository(Material)
        private readonly inventarioRepository: Repository<Material>,

        @InjectRepository(EstadoMaterial)
        private readonly estadoMaterialRepository: Repository<EstadoMaterial>,

        @InjectRepository(Categoria)
        private readonly categoriaRepository: Repository<Categoria>,

        @InjectRepository(MaterialCategoria)
        private readonly materialCategoriaRepository: Repository<MaterialCategoria>,

        @InjectRepository(MaterialProveedor)
        private readonly materialProveedorRepository: Repository<MaterialProveedor>,

        @InjectRepository(UnidadMedicion)
        private readonly unidadMedicionRepository: Repository<UnidadMedicion>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        @InjectRepository(ProveedorFisico)
        private readonly proveedorFisicoRepository: Repository<ProveedorFisico>,

        @InjectRepository(ProveedorJuridico)
        private readonly proveedorJuridicoRepository: Repository<ProveedorJuridico>
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
            .leftJoinAndSelect('material.materialProveedores', 'Proveedores')
            .getMany();

        const materialesFormateados: any[] = [];
        for (const material of materiales) {
            const materialFormateado = await this.formatMaterialResponse(material);
            materialesFormateados.push(materialFormateado);
        }
        return materialesFormateados;
    }

    private async formatMaterialResponse(material: Material) {
        const { Usuario_Creador, materialCategorias, materialProveedores, ...materialSinUsuario } = material;
        
        // Obtener proveedores físicos
        const proveedoresFisicos: any[] = [];
        const proveedoresJuridicos: any[] = [];
        
        if (materialProveedores && materialProveedores.length > 0) {
            // Obtener IDs de proveedores físicos y jurídicos
            const idsFisicos = materialProveedores.filter(mp => mp.Tipo_Proveedor === 1).map(mp => mp.Id_Proveedor);
            const idsJuridicos = materialProveedores.filter(mp => mp.Tipo_Proveedor === 2).map(mp => mp.Id_Proveedor);
            
            // Obtener datos de proveedores físicos
            if (idsFisicos.length > 0) {
                const proveedoresFisicosData = await this.proveedorFisicoRepository.find({
                    where: { Id_Proveedor: In(idsFisicos) },
                    relations: ['Estado_Proveedor', 'Tipo_Proveedor']
                });
                
                proveedoresFisicosData.forEach(proveedor => {
                    const materialProveedor = materialProveedores.find(mp => mp.Id_Proveedor === proveedor.Id_Proveedor);
                    if (materialProveedor) {
                        proveedoresFisicos.push({
                            Id_Material_Proveedor: materialProveedor.Id_Material_Proveedor,
                            Proveedor: {
                                Id_Proveedor: proveedor.Id_Proveedor,
                                Nombre_Proveedor: proveedor.Nombre_Proveedor,
                                Telefono_Proveedor: proveedor.Telefono_Proveedor,
                                Estado_Proveedor: proveedor.Estado_Proveedor,
                                Tipo_Proveedor: proveedor.Tipo_Proveedor,
                                Tipo_Identificacion: proveedor.Tipo_Identificacion,
                                Identificacion: proveedor.Identificacion
                            }
                        });
                    }
                });
            }
            
            // Obtener datos de proveedores jurídicos
            if (idsJuridicos.length > 0) {
                const proveedoresJuridicosData = await this.proveedorJuridicoRepository.find({
                    where: { Id_Proveedor: In(idsJuridicos) },
                    relations: ['Estado_Proveedor', 'Tipo_Proveedor']
                });
                
                proveedoresJuridicosData.forEach(proveedor => {
                    const materialProveedor = materialProveedores.find(mp => mp.Id_Proveedor === proveedor.Id_Proveedor);
                    if (materialProveedor) {
                        proveedoresJuridicos.push({
                            Id_Material_Proveedor: materialProveedor.Id_Material_Proveedor,
                            Proveedor: {
                                Id_Proveedor: proveedor.Id_Proveedor,
                                Nombre_Proveedor: proveedor.Nombre_Proveedor,
                                Telefono_Proveedor: proveedor.Telefono_Proveedor,
                                Estado_Proveedor: proveedor.Estado_Proveedor,
                                Tipo_Proveedor: proveedor.Tipo_Proveedor,
                                Cedula_Juridica: proveedor.Cedula_Juridica,
                                Razon_Social: proveedor.Razon_Social
                            }
                        });
                    }
                });
            }
        }

        return {
            ...materialSinUsuario,
            Categorias: materialCategorias,
            Usuario_Creador: material.Usuario_Creador ? {
                Id_Usuario: material.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: material.Usuario_Creador.Nombre_Usuario,
                Id_Rol: material.Usuario_Creador.Id_Rol
            } : null,
            Proveedores_Fisicos: proveedoresFisicos,
            Proveedores_Juridicos: proveedoresJuridicos
        };
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

        const materialExistente = await this.inventarioRepository.findOne({ where: { Nombre_Material: NombreNormalizado } });
        if (materialExistente) { throw new ConflictException('Ya existe un material con este nombre'); }

        const unidadMedicionExistente = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: dto.Id_Unidad_Medicion } });
        if (!unidadMedicionExistente) { throw new BadRequestException('La unidad de medición proporcionada no existe'); }

        if (unidadMedicionExistente.Estado_Unidad_Medicion.Id_Estado_Unidad_Medicion !== 1) { 
            throw new BadRequestException('La unidad de medición proporcionada no está activa'); 
        }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuarioCreador }, relations: ['Rol'] });
        if (!usuario) { throw new BadRequestException(`Usuario con ID ${idUsuarioCreador} no encontrado`); }

        // Validar categorías si se proporcionan
        let categorias: Categoria[] = [];
        if (dto.IDS_Categorias && dto.IDS_Categorias.length > 0) {
            categorias = await this.categoriaRepository.find({ where: { Id_Categoria: In(dto.IDS_Categorias) } });
            if (categorias.length !== dto.IDS_Categorias.length) { 
                throw new BadRequestException('Una o más categorías no existen'); 
            }
        }

        // Validar y obtener proveedores físicos
        let proveedoresFisicos: ProveedorFisico[] = [];
        if (dto.IDS_Proveedores_Fisicos && dto.IDS_Proveedores_Fisicos.length > 0) {
            proveedoresFisicos = await this.proveedorFisicoRepository.find({ 
                where: { Id_Proveedor: In(dto.IDS_Proveedores_Fisicos) },
                relations: ['Estado_Proveedor', 'Tipo_Proveedor']
            });

            if (proveedoresFisicos.length !== dto.IDS_Proveedores_Fisicos.length) {
                throw new BadRequestException('Uno o más proveedores físicos no existen');
            }

            // Verificar que todos sean proveedores físicos activos
            const proveedoresInactivos = proveedoresFisicos.filter(p => p.Estado_Proveedor.Id_Estado_Proveedor !== 1);
            if (proveedoresInactivos.length > 0) {
                throw new BadRequestException('Uno o más proveedores físicos están inactivos');
            }
        }

        // Validar y obtener proveedores jurídicos
        let proveedoresJuridicos: ProveedorJuridico[] = [];
        if (dto.IDS_Proveedores_Juridicos && dto.IDS_Proveedores_Juridicos.length > 0) {
            proveedoresJuridicos = await this.proveedorJuridicoRepository.find({ 
                where: { Id_Proveedor: In(dto.IDS_Proveedores_Juridicos) },
                relations: ['Estado_Proveedor', 'Tipo_Proveedor']
            });

            if (proveedoresJuridicos.length !== dto.IDS_Proveedores_Juridicos.length) {
                throw new BadRequestException('Uno o más proveedores jurídicos no existen');
            }

            // Verificar que todos sean proveedores jurídicos activos
            const proveedoresInactivos = proveedoresJuridicos.filter(p => p.Estado_Proveedor.Id_Estado_Proveedor !== 1);
            if (proveedoresInactivos.length > 0) {
                throw new BadRequestException('Uno o más proveedores jurídicos están inactivos');
            }

            const proveedoresNoJuridicos = proveedoresJuridicos.filter(p => p.Tipo_Proveedor.Id_Tipo_Proveedor !== 2);
            if (proveedoresNoJuridicos.length > 0) {
                throw new BadRequestException('Uno o más proveedores no son de tipo jurídico');
            }
        }

        // Crear el material
        const material = this.inventarioRepository.create({
            Nombre_Material: NombreNormalizado,
            Descripcion: dto.Descripcion,
            Cantidad: dto.Cantidad,
            Precio_Unitario: dto.Precio_Unitario,
            Unidad_Medicion: unidadMedicionExistente,
            Usuario_Creador: usuario,
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

        // Crear relaciones con proveedores físicos
        if (proveedoresFisicos.length > 0) {
            const materialProveedoresFisicos = proveedoresFisicos.map(proveedor => {
                return this.materialProveedorRepository.create({
                    Material: savedMaterial,
                    Id_Proveedor: proveedor.Id_Proveedor,
                    Tipo_Proveedor: 1
                });
            });
            await this.materialProveedorRepository.save(materialProveedoresFisicos);
        }

        // Crear relaciones con proveedores jurídicos
        if (proveedoresJuridicos.length > 0) {
            const materialProveedoresJuridicos = proveedoresJuridicos.map(proveedor => {
                return this.materialProveedorRepository.create({
                    Material: savedMaterial,
                    Id_Proveedor: proveedor.Id_Proveedor,
                    Tipo_Proveedor: 2
                });
            });
            await this.materialProveedorRepository.save(materialProveedoresJuridicos);
        }

        // Retornar el material completo con todas sus relaciones
        return this.getMaterialCompleto(savedMaterial.Id_Material);
    }

    private async getMaterialCompleto(idMaterial: number) {
        const material = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estadoMaterial')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario_Creador', 'usuarioCreador')
            .leftJoinAndSelect('material.materialProveedores', 'Proveedores')
            .where('material.Id_Material = :id', { id: idMaterial })
            .getOne();

        if (!material) {
            throw new NotFoundException('Material no encontrado');
        }

        return await this.formatMaterialResponse(material);
    }

    async updateMaterial(Id_Material: number, dto: UpdateMaterialDto) {
        const materialExistente = await this.inventarioRepository.findOne({ where: { Id_Material: Id_Material }, relations: ['materialCategorias', 'materialCategorias.Categoria'] });
        if (!materialExistente) { throw new NotFoundException(`Material con ID ${Id_Material} no encontrado`); }

        const UnidadMedicionExistente = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: dto.Id_Unidad_Medicion } });
        if (!UnidadMedicionExistente) { throw new BadRequestException('La unidad de medición proporcionada no existe'); }

        if (UnidadMedicionExistente.Estado_Unidad_Medicion.Id_Estado_Unidad_Medicion !== 1) {
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

    async updateEstadoMaterial(Id_Material: number, nuevoEstadoId: number) {
        const material = await this.inventarioRepository.findOne({ where: { Id_Material: Id_Material }, relations: ['Estado_Material'] });
        if (!material) { throw new NotFoundException(`Material con ID ${Id_Material} no encontrado`); }

        const estadoActualId = material.Estado_Material.Id_Estado_Material;

        // Si está "Agotado" (2) y se cambia a "De baja" (3) → cambiar a "Agotado y de baja" (4)
        if (estadoActualId === 2 && nuevoEstadoId === 3) {
            const estadoAgotadoYBaja = await this.estadoMaterialRepository.findOne({ where: { Id_Estado_Material: 4 } });
            if (!estadoAgotadoYBaja) { throw new NotFoundException(`Estado "Agotado y de baja" no encontrado`); }
            
            material.Estado_Material = estadoAgotadoYBaja;
            material.Ultima_Fecha_Baja = new Date();
            return await this.inventarioRepository.save(material);
        }

        // Si ya estaba "Agotado y de baja" (4) y se cambia a "De baja" (3) → no crear nueva fecha de baja
        if (estadoActualId === 4 && nuevoEstadoId === 3) {
            const estadoDeBaja = await this.estadoMaterialRepository.findOne({ where: { Id_Estado_Material: 3 } });
            if (!estadoDeBaja) { throw new NotFoundException(`Estado "De baja" no encontrado`); }
            
            material.Estado_Material = estadoDeBaja;
            // No actualizar Ultima_Fecha_Baja porque ya tenía una fecha de baja anterior
            return await this.inventarioRepository.save(material);
        }

        // Para cualquier otro cambio de estado
        const nuevoEstado = await this.estadoMaterialRepository.findOne({ where: { Id_Estado_Material: nuevoEstadoId } });
        if (!nuevoEstado) { throw new NotFoundException(`Estado con ID ${nuevoEstadoId} no encontrado`); }

        // Si el nuevo estado es "De baja" (3) y no viene de estado 4, actualizar fecha de baja
        if (nuevoEstadoId === 3 && estadoActualId !== 4) {
            material.Ultima_Fecha_Baja = new Date();
        }

        material.Estado_Material = nuevoEstado;
        return await this.inventarioRepository.save(material);
    }

    // Método para obtener materiales que tienen proveedores físicos
    async getMaterialesConProveedoresFisicos() {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estadoMaterial')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('material.Usuario_Creador', 'usuarioCreador')
            .leftJoinAndSelect('material.materialProveedores', 'Proveedores')
            .where('Proveedores.Tipo_Proveedor = :tipoId', { tipoId: 1 })
            .getMany();

        const materialesFormateados: any[] = [];
        for (const material of materiales) {
            const materialFormateado = await this.formatMaterialResponse(material);
            materialesFormateados.push(materialFormateado);
        }
        return materialesFormateados;
    }

    // Método para obtener materiales que tienen proveedores jurídicos
    async getMaterialesConProveedoresJuridicos() {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estadoMaterial')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('material.Usuario_Creador', 'usuarioCreador')
            .leftJoinAndSelect('material.materialProveedores', 'Proveedores')
            .where('Proveedores.Tipo_Proveedor = :tipoId', { tipoId: 2 })
            .getMany();

        const materialesFormateados: any[] = [];
        for (const material of materiales) {
            const materialFormateado = await this.formatMaterialResponse(material);
            materialesFormateados.push(materialFormateado);
        }
        return materialesFormateados;
    }
}