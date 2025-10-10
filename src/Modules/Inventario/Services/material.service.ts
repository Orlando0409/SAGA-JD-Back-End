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

        @InjectRepository(UnidadMedicion)
        private readonly unidadMedicionRepository: Repository<UnidadMedicion>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        @InjectRepository(ProveedorFisico)
        private readonly proveedorFisicoRepository: Repository<ProveedorFisico>,

        @InjectRepository(ProveedorJuridico)
        private readonly proveedorJuridicoRepository: Repository<ProveedorJuridico>
    ) { }

    async getAllMateriales() {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estadoMaterial')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario_Creador', 'usuarioCreador')
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .leftJoinAndSelect('proveedor.Tipo_Proveedor', 'tipoProveedor')
            .getMany();

        return materiales.map(material => {
            const { Usuario_Creador, materialCategorias, Proveedor, ...materialSinRelaciones } = material;

            // Construir objeto de proveedor
            let proveedorFormateado: any = null;
            if (material.Proveedor) {
                const proveedor = material.Proveedor as any; // Usar any para acceder a campos de subclases

                // Determinar el tipo basándose en los campos que existen
                let idTipoProveedor: number | null = null;
                if (proveedor.Tipo_Identificacion !== undefined && proveedor.Identificacion !== undefined) {
                    idTipoProveedor = 1; // Físico
                } else if (proveedor.Cedula_Juridica !== undefined && proveedor.Razon_Social !== undefined) {
                    idTipoProveedor = 2; // Jurídico
                }

                proveedorFormateado = {
                    Id_Proveedor: proveedor.Id_Proveedor,
                    Id_Tipo_Proveedor: idTipoProveedor,
                    Nombre_Proveedor: proveedor.Nombre_Proveedor,
                    Telefono_Proveedor: proveedor.Telefono_Proveedor
                };

                if (idTipoProveedor === 1) {
                    proveedorFormateado.Tipo_Identificacion = proveedor.Tipo_Identificacion;
                    proveedorFormateado.Identificacion = proveedor.Identificacion;
                } else if (idTipoProveedor === 2) {
                    proveedorFormateado.Cedula_Juridica = proveedor.Cedula_Juridica;
                    proveedorFormateado.Razon_Social = proveedor.Razon_Social;
                }
            }

            return {
                ...materialSinRelaciones,
                Categorias: materialCategorias,
                Usuario_Creador: material.Usuario_Creador ? {
                    Id_Usuario: material.Usuario_Creador.Id_Usuario,
                    Nombre_Usuario: material.Usuario_Creador.Nombre_Usuario,
                    Id_Rol: material.Usuario_Creador.Id_Rol
                } : null,
                Proveedor: proveedorFormateado
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
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .leftJoinAndSelect('proveedor.Tipo_Proveedor', 'tipoProveedor')
            .where('Categorias.Id_Material_Categoria IS NOT NULL')
            .getMany();

        return materiales.map(material => {
            const { Usuario_Creador, materialCategorias, Proveedor, ...materialSinRelaciones } = material;

            if (material.Proveedor?.Tipo_Proveedor != null && material.Proveedor?.Tipo_Proveedor.Id_Tipo_Proveedor === 1) {
                return {
                    ...materialSinRelaciones,
                    Categorias: materialCategorias,
                    Usuario_Creador: material.Usuario_Creador ? {
                        Id_Usuario: material.Usuario_Creador.Id_Usuario,
                        Nombre_Usuario: material.Usuario_Creador.Nombre_Usuario,
                        Id_Rol: material.Usuario_Creador.Id_Rol
                    } : null,
                    Proveedor: material.Proveedor ? {
                        Id_Proveedor: material.Proveedor.Id_Proveedor,
                        Tipo_Proveedor: material.Proveedor.Tipo_Proveedor,
                        Tipo_Identificacion: (material.Proveedor as ProveedorFisico).Tipo_Identificacion,
                        Identificacion: (material.Proveedor as ProveedorFisico).Identificacion,
                        Nombre_Proveedor: material.Proveedor.Nombre_Proveedor,
                        Telefono_Proveedor: material.Proveedor.Telefono_Proveedor
                    } : null
                };
            }

            else if (material.Proveedor?.Tipo_Proveedor != null && material.Proveedor?.Tipo_Proveedor.Id_Tipo_Proveedor === 2) {
                return {
                    ...materialSinRelaciones,
                    Categorias: materialCategorias,
                    Usuario_Creador: material.Usuario_Creador ? {
                        Id_Usuario: material.Usuario_Creador.Id_Usuario,
                        Nombre_Usuario: material.Usuario_Creador.Nombre_Usuario,
                        Id_Rol: material.Usuario_Creador.Id_Rol
                    } : null,
                    Proveedor: material.Proveedor ? {
                        Id_Proveedor: material.Proveedor.Id_Proveedor,
                        Tipo_Proveedor: material.Proveedor.Tipo_Proveedor,
                        Cedula_Juridica: (material.Proveedor as ProveedorJuridico).Cedula_Juridica,
                        Razon_Social: (material.Proveedor as ProveedorJuridico).Razon_Social,
                        Nombre_Proveedor: material.Proveedor.Nombre_Proveedor,
                        Telefono_Proveedor: material.Proveedor.Telefono_Proveedor
                    } : null
                };
            }
        });
    }

    async getMaterialesSinCategorias() {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.Usuario_Creador', 'usuarioCreador')
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .leftJoinAndSelect('proveedor.Tipo_Proveedor', 'tipoProveedor')
            .leftJoin('material.materialCategorias', 'Categorias')
            .where('Categorias.Id_Material_Categoria IS NULL')
            .getMany();

        return materiales.map(material => {
            const { Usuario_Creador, materialCategorias, Proveedor, ...materialSinRelaciones } = material;

            if (material.Proveedor?.Tipo_Proveedor != null && material.Proveedor?.Tipo_Proveedor.Id_Tipo_Proveedor === 1) {
                return {
                    ...materialSinRelaciones,
                    Categorias: [],
                    Usuario_Creador: material.Usuario_Creador ? {
                        Id_Usuario: material.Usuario_Creador.Id_Usuario,
                        Nombre_Usuario: material.Usuario_Creador.Nombre_Usuario,
                        Id_Rol: material.Usuario_Creador.Id_Rol
                    } : null,
                    Proveedor: material.Proveedor ? {
                        Id_Proveedor: material.Proveedor.Id_Proveedor,
                        Tipo_Proveedor: material.Proveedor.Tipo_Proveedor,
                        tipo_Identificacion: (material.Proveedor as ProveedorFisico).Tipo_Identificacion,
                        Identificacion: (material.Proveedor as ProveedorFisico).Identificacion,
                        Nombre_Proveedor: material.Proveedor.Nombre_Proveedor,
                        Telefono_Proveedor: material.Proveedor.Telefono_Proveedor
                    } : null
                };
            }

            else if (material.Proveedor?.Tipo_Proveedor != null && material.Proveedor?.Tipo_Proveedor.Id_Tipo_Proveedor === 2) {
                return {
                    ...materialSinRelaciones,
                    Categorias: [],
                    Usuario_Creador: material.Usuario_Creador ? {
                        Id_Usuario: material.Usuario_Creador.Id_Usuario,
                        Nombre_Usuario: material.Usuario_Creador.Nombre_Usuario,
                        Id_Rol: material.Usuario_Creador.Id_Rol
                    } : null,
                    Proveedor: material.Proveedor ? {
                        Id_Proveedor: material.Proveedor.Id_Proveedor,
                        Tipo_Proveedor: material.Proveedor.Tipo_Proveedor,
                        Cedula_Juridica: (material.Proveedor as ProveedorJuridico).Cedula_Juridica,
                        Razon_Social: (material.Proveedor as ProveedorJuridico).Razon_Social,
                        Nombre_Proveedor: material.Proveedor.Nombre_Proveedor,
                        Telefono_Proveedor: material.Proveedor.Telefono_Proveedor
                    } : null
                };
            }
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
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .leftJoinAndSelect('proveedor.Tipo_Proveedor', 'tipoProveedor')
            .where('material.Cantidad > :threshold', { threshold })
            .orderBy('material.Cantidad', 'DESC')
            .getMany();

        return materiales.map(material => {
            const { Usuario_Creador, materialCategorias, Proveedor, ...materialSinRelaciones } = material;

            if (material.Proveedor?.Tipo_Proveedor != null && material.Proveedor?.Tipo_Proveedor.Id_Tipo_Proveedor === 1) {
                return {
                    ...materialSinRelaciones,
                    Categorias: materialCategorias,
                    Usuario_Creador: material.Usuario_Creador ? {
                        Id_Usuario: material.Usuario_Creador.Id_Usuario,
                        Nombre_Usuario: material.Usuario_Creador.Nombre_Usuario,
                        Id_Rol: material.Usuario_Creador.Id_Rol
                    } : null,
                    Proveedor: material.Proveedor ? {
                        Id_Proveedor: material.Proveedor.Id_Proveedor,
                        Tipo_Proveedor: material.Proveedor.Tipo_Proveedor,
                        tipo_Identificacion: (material.Proveedor as ProveedorFisico).Tipo_Identificacion,
                        Identificacion: (material.Proveedor as ProveedorFisico).Identificacion,
                        Nombre_Proveedor: material.Proveedor.Nombre_Proveedor,
                        Telefono_Proveedor: material.Proveedor.Telefono_Proveedor
                    } : null
                };
            }

            else if (material.Proveedor?.Tipo_Proveedor != null && material.Proveedor?.Tipo_Proveedor.Id_Tipo_Proveedor === 2) {
                return {
                    ...materialSinRelaciones,
                    Categorias: materialCategorias,
                    Usuario_Creador: material.Usuario_Creador ? {
                        Id_Usuario: material.Usuario_Creador.Id_Usuario,
                        Nombre_Usuario: material.Usuario_Creador.Nombre_Usuario,
                        Id_Rol: material.Usuario_Creador.Id_Rol
                    } : null,
                    Proveedor: material.Proveedor ? {
                        Id_Proveedor: material.Proveedor.Id_Proveedor,
                        Tipo_Proveedor: material.Proveedor.Tipo_Proveedor,
                        Cedula_Juridica: (material.Proveedor as ProveedorJuridico).Cedula_Juridica,
                        Razon_Social: (material.Proveedor as ProveedorJuridico).Razon_Social,
                        Nombre_Proveedor: material.Proveedor.Nombre_Proveedor,
                        Telefono_Proveedor: material.Proveedor.Telefono_Proveedor
                    } : null
                };
            }
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
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .leftJoinAndSelect('proveedor.Tipo_Proveedor', 'tipoProveedor')
            .where('material.Cantidad < :threshold', { threshold })
            .orderBy('material.Cantidad', 'ASC')
            .getMany();

        return materiales.map(material => {
            const { Usuario_Creador, materialCategorias, Proveedor, ...materialSinRelaciones } = material;

            if (material.Proveedor?.Tipo_Proveedor != null && material.Proveedor?.Tipo_Proveedor.Id_Tipo_Proveedor === 1) {
                return {
                    ...materialSinRelaciones,
                    Categorias: materialCategorias,
                    Usuario_Creador: material.Usuario_Creador ? {
                        Id_Usuario: material.Usuario_Creador.Id_Usuario,
                        Nombre_Usuario: material.Usuario_Creador.Nombre_Usuario,
                        Id_Rol: material.Usuario_Creador.Id_Rol
                    } : null,
                    Proveedor: material.Proveedor ? {
                        Id_Proveedor: material.Proveedor.Id_Proveedor,
                        Tipo_Proveedor: material.Proveedor.Tipo_Proveedor,
                        tipo_Identificacion: (material.Proveedor as ProveedorFisico).Tipo_Identificacion,
                        Identificacion: (material.Proveedor as ProveedorFisico).Identificacion,
                        Nombre_Proveedor: material.Proveedor.Nombre_Proveedor,
                        Telefono_Proveedor: material.Proveedor.Telefono_Proveedor
                    } : null
                };
            }

            else if (material.Proveedor?.Tipo_Proveedor != null && material.Proveedor?.Tipo_Proveedor.Id_Tipo_Proveedor === 2) {
                return {
                    ...materialSinRelaciones,
                    Categorias: materialCategorias,
                    Usuario_Creador: material.Usuario_Creador ? {
                        Id_Usuario: material.Usuario_Creador.Id_Usuario,
                        Nombre_Usuario: material.Usuario_Creador.Nombre_Usuario,
                        Id_Rol: material.Usuario_Creador.Id_Rol
                    } : null,
                    Proveedor: material.Proveedor ? {
                        Id_Proveedor: material.Proveedor.Id_Proveedor,
                        Tipo_Proveedor: material.Proveedor.Tipo_Proveedor,
                        Cedula_Juridica: (material.Proveedor as ProveedorJuridico).Cedula_Juridica,
                        Razon_Social: (material.Proveedor as ProveedorJuridico).Razon_Social,
                        Nombre_Proveedor: material.Proveedor.Nombre_Proveedor,
                        Telefono_Proveedor: material.Proveedor.Telefono_Proveedor
                    } : null
                };
            }
        });
    }

    async createMaterial(dto: CreateMaterialDto, idUsuarioCreador: number) {
        const NombreNormalizado = dto.Nombre_Material[0].toUpperCase() + dto.Nombre_Material.slice(1).toLowerCase();

        const materialExistente = await this.inventarioRepository.findOne({ where: { Nombre_Material: NombreNormalizado } });
        if (materialExistente) { throw new ConflictException('Ya existe un material con este nombre'); }

        const unidadMedicionExistente = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: dto.Id_Unidad_Medicion } });
        if (!unidadMedicionExistente) { throw new BadRequestException('La unidad de medición proporcionada no existe'); }
        if (unidadMedicionExistente.Estado_Unidad_Medicion.Id_Estado_Unidad_Medicion !== 1) { throw new BadRequestException('La unidad de medición proporcionada no está activa'); }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuarioCreador }, relations: ['Rol'] });
        if (!usuario) { throw new BadRequestException(`Usuario con ID ${idUsuarioCreador} no encontrado`); }

        // Validar y obtener proveedor según su tipo
        let proveedorFisico: ProveedorFisico | null = null;
        let proveedorJuridico: ProveedorJuridico | null = null;

        if (dto.Id_Tipo_Proveedor === 1) {
            const proveedorFisicoExistente = await this.proveedorFisicoRepository.findOne({ where: { Id_Proveedor: dto.Id_Proveedor }, relations: ['Estado_Proveedor', 'Tipo_Proveedor'] });
            if (!proveedorFisicoExistente) { throw new BadRequestException('Proveedor físico no encontrado'); }
            if (proveedorFisicoExistente.Estado_Proveedor.Id_Estado_Proveedor !== 1) { throw new BadRequestException('El proveedor físico no está activo'); }
            proveedorFisico = dto.Id_Proveedor ? proveedorFisicoExistente : null;
        }

        else if (dto.Id_Tipo_Proveedor === 2) {
            const proveedorJuridicoExistente = await this.proveedorJuridicoRepository.findOne({ where: { Id_Proveedor: dto.Id_Proveedor }, relations: ['Estado_Proveedor', 'Tipo_Proveedor'] });
            if (!proveedorJuridicoExistente) { throw new BadRequestException('Proveedor jurídico no encontrado'); }
            if (proveedorJuridicoExistente.Estado_Proveedor.Id_Estado_Proveedor !== 1) { throw new BadRequestException('El proveedor jurídico no está activo'); }
            proveedorJuridico = dto.Id_Proveedor ? proveedorJuridicoExistente : null;
        }

        else { throw new BadRequestException('El tipo de proveedor debe ser 1 (físico) o 2 (jurídico)'); }

        // Validar categorías si se proporcionan
        let categorias: Categoria[] = [];
        if (dto.IDS_Categorias && dto.IDS_Categorias.length > 0) {
            categorias = await this.categoriaRepository.find({ where: { Id_Categoria: In(dto.IDS_Categorias) } });
            if (categorias.length !== dto.IDS_Categorias.length) {
                throw new BadRequestException('Una o más categorías no existen');
            }
        }

        let Material: Material;
        var savedMaterial;

        if (proveedorFisico && dto.Id_Tipo_Proveedor === 1) {
            Material = this.inventarioRepository.create({
                Nombre_Material: NombreNormalizado,
                Descripcion: dto.Descripcion,
                Cantidad: dto.Cantidad,
                Proveedor: proveedorFisico,
                Precio_Unitario: dto.Precio_Unitario,
                Unidad_Medicion: unidadMedicionExistente,
                Usuario_Creador: usuario,
            });

            savedMaterial = await this.inventarioRepository.save(Material);
        }

        else if (proveedorJuridico && dto.Id_Tipo_Proveedor === 2) {
            Material = this.inventarioRepository.create({
                Nombre_Material: NombreNormalizado,
                Descripcion: dto.Descripcion,
                Cantidad: dto.Cantidad,
                Proveedor: proveedorJuridico,
                Precio_Unitario: dto.Precio_Unitario,
                Unidad_Medicion: unidadMedicionExistente,
                Usuario_Creador: usuario,
            });

            savedMaterial = await this.inventarioRepository.save(Material);
        }

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

        if (proveedorFisico && dto.Id_Tipo_Proveedor === 1) {
            const materialCreado = await this.inventarioRepository.createQueryBuilder('material')
                .leftJoinAndSelect('material.Estado_Material', 'estadoMaterial')
                .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
                .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
                .leftJoinAndSelect('material.materialCategorias', 'Categorias')
                .leftJoinAndSelect('Categorias.Categoria', 'categoria')
                .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
                .leftJoinAndSelect('material.Usuario_Creador', 'usuarioCreador')
                .leftJoinAndSelect('material.Proveedor', 'proveedor')
                .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
                .leftJoinAndSelect('proveedor.Tipo_Proveedor', 'tipoProveedor')
                .where('material.Id_Material = :id', { id: savedMaterial.Id_Material })
                .getOne();

            if (!materialCreado) {
                throw new NotFoundException('Error al recuperar el material creado');
            }

            const { Usuario_Creador, materialCategorias, ...materialSinUsuario } = materialCreado;

            return {
                ...materialSinUsuario,
                Categorias: materialCategorias,
                Usuario_Creador: {
                    Id_Usuario: usuario.Id_Usuario,
                    Nombre_Usuario: usuario.Nombre_Usuario,
                    Id_Rol: usuario.Id_Rol
                },
                Proveedor: materialCreado.Proveedor ? {
                    Id_Proveedor: materialCreado.Proveedor.Id_Proveedor,
                    Tipo_Proveedor: materialCreado.Proveedor.Tipo_Proveedor,
                    Tipo_Identificacion: (materialCreado.Proveedor as ProveedorFisico).Tipo_Identificacion,
                    Identificacion: (materialCreado.Proveedor as ProveedorFisico).Identificacion,
                    Nombre_Proveedor: materialCreado.Proveedor.Nombre_Proveedor,
                    Telefono_Proveedor: materialCreado.Proveedor.Telefono_Proveedor
                } : null
            };
        }

        else if (proveedorJuridico && dto.Id_Tipo_Proveedor === 2) {
            const materialCreado = await this.inventarioRepository.createQueryBuilder('material')
                .leftJoinAndSelect('material.Estado_Material', 'estadoMaterial')
                .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
                .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
                .leftJoinAndSelect('material.materialCategorias', 'Categorias')
                .leftJoinAndSelect('Categorias.Categoria', 'categoria')
                .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
                .leftJoinAndSelect('material.Usuario_Creador', 'usuarioCreador')
                .leftJoinAndSelect('material.Proveedor', 'proveedor')
                .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
                .leftJoinAndSelect('proveedor.Tipo_Proveedor', 'tipoProveedor')
                .where('material.Id_Material = :id', { id: savedMaterial.Id_Material })
                .getOne();

            if (!materialCreado) {
                throw new NotFoundException('Error al recuperar el material creado');
            }

            const { Usuario_Creador, materialCategorias, ...materialSinUsuario } = materialCreado;

            return {
                ...materialSinUsuario,
                Categorias: materialCategorias,
                Usuario_Creador: {
                    Id_Usuario: usuario.Id_Usuario,
                    Nombre_Usuario: usuario.Nombre_Usuario,
                    Id_Rol: usuario.Id_Rol
                },
                Proveedor: materialCreado.Proveedor ? {
                    Id_Proveedor: materialCreado.Proveedor.Id_Proveedor,
                    Tipo_Proveedor: materialCreado.Proveedor.Tipo_Proveedor,
                    Cedula_Juridica: (materialCreado.Proveedor as ProveedorJuridico).Cedula_Juridica,
                    Razon_Social: (materialCreado.Proveedor as ProveedorJuridico).Razon_Social,
                    Nombre_Proveedor: materialCreado.Proveedor.Nombre_Proveedor,
                    Telefono_Proveedor: materialCreado.Proveedor.Telefono_Proveedor
                } : null
            };
        }

        else {
            const materialCreado = await this.inventarioRepository.createQueryBuilder('material')
                .leftJoinAndSelect('material.Estado_Material', 'estadoMaterial')
                .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
                .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
                .leftJoinAndSelect('material.materialCategorias', 'Categorias')
                .leftJoinAndSelect('Categorias.Categoria', 'categoria')
                .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
                .leftJoinAndSelect('material.Usuario_Creador', 'usuarioCreador')
                .where('material.Id_Material = :id', { id: savedMaterial.Id_Material })
                .getOne();

            if (!materialCreado) {
                throw new NotFoundException('Error al recuperar el material creado');
            }

            const { Usuario_Creador, materialCategorias, ...materialSinUsuario } = materialCreado;

            return {
                ...materialSinUsuario,
                Categorias: materialCategorias,
                Usuario_Creador: {
                    Id_Usuario: usuario.Id_Usuario,
                    Nombre_Usuario: usuario.Nombre_Usuario,
                    Id_Rol: usuario.Id_Rol
                }
            };
        }
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

        if (material.Cantidad === 0 && nuevoEstadoId === 1) {
            throw new BadRequestException('No se puede cambiar el estado a "Disponible" si la cantidad en stock es 0');
        }

        // Si está "Agotado" (2) y se cambia a "De baja" (3) → cambiar a "Agotado y de baja" (4)
        else if (estadoActualId === 2 && nuevoEstadoId === 3) {
            const estadoAgotadoYBaja = await this.estadoMaterialRepository.findOne({ where: { Id_Estado_Material: 4 } });
            if (!estadoAgotadoYBaja) { throw new NotFoundException(`Estado "Agotado y de baja" no encontrado`); }

            material.Estado_Material = estadoAgotadoYBaja;
            material.Ultima_Fecha_Baja = new Date();
            return await this.inventarioRepository.save(material);
        }

        // Si ya estaba "Agotado y de baja" (4) y se cambia a "De baja" (3) → no crear nueva fecha de baja
        else if (estadoActualId === 4 && nuevoEstadoId === 3) {
            const estadoDeBaja = await this.estadoMaterialRepository.findOne({ where: { Id_Estado_Material: 3 } });
            if (!estadoDeBaja) { throw new NotFoundException(`Estado "De baja" no encontrado`); }

            material.Estado_Material = estadoDeBaja;
            // No actualizar Ultima_Fecha_Baja porque ya tenía una fecha de baja anterior
            return await this.inventarioRepository.save(material);
        }

        // Si está "Agotado y de baja" (4) y se cambia a "Agotado" (2) → cambiar a "Agotado" sin fecha de baja
        else if (estadoActualId === 4 && nuevoEstadoId === 2) {
            const estadoAgotado = await this.estadoMaterialRepository.findOne({ where: { Id_Estado_Material: 2 } });
            if (!estadoAgotado) { throw new NotFoundException(`Estado "Agotado" no encontrado`); }

            material.Estado_Material = estadoAgotado;
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
}