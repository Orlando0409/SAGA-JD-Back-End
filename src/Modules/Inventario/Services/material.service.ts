import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { Proveedor, ProveedorFisico, ProveedorJuridico } from 'src/Modules/Proveedores/ProveedorEntities/Proveedor.Entity';
import { AuditoriaService } from 'src/Modules/Auditoria/auditoria.service';
import { UsuariosService } from 'src/Modules/Usuarios/Services/usuarios.service';
import { UnidadesDeMedicionService } from './unidadesDeMedicion.service';
import { CategoriasService } from './categorias.service';
import { ProveedorService } from 'src/Modules/Proveedores/proveedor.service';

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
        private readonly proveedorJuridicoRepository: Repository<ProveedorJuridico>,

        private readonly auditoriaService: AuditoriaService,
        private readonly usuariosService: UsuariosService,
        private readonly unidadesDeMedicionService: UnidadesDeMedicionService,
        private readonly categoriasService: CategoriasService,
        private readonly proveedorService: ProveedorService,
    ) {}

    async getAllMateriales() {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estadoMaterial')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rolUsuario')
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .getMany();

        // Formatear los materiales usando los métodos de formateo
        return Promise.all(materiales.map(async (material) => {
            // Formatear categorías usando el método del servicio
            const categoriasFormateadas = await Promise.all(
                material.materialCategorias?.map(async (mc) => 
                    await this.categoriasService.FormatearCategoriaParaResponse(mc.Categoria)
                ) || []
            );

            // Formatear unidad de medición usando el método del servicio
            const unidadMedicionFormateada = await this.unidadesDeMedicionService.FormatearUnidadMedicionParaResponse(material.Unidad_Medicion);

            // Formatear usuario usando el método del servicio
            const usuarioFormateado = material.Usuario
                ? await this.usuariosService.FormatearUsuarioResponse(material.Usuario)
                : null;

            // Formatear proveedor usando el método del servicio (si existe)
            let proveedorFormateado: any = null;
            if (material.Proveedor) {
                proveedorFormateado = await this.proveedorService.FormatearProveedorParaResponse(material.Proveedor as any);
            }

            return {
                Id_Material: material.Id_Material,
                Nombre_Material: material.Nombre_Material,
                Descripcion: material.Descripcion,
                Cantidad: material.Cantidad,
                Precio_Unitario: material.Precio_Unitario,
                Fecha_Creacion: material.Fecha_Entrada,
                Fecha_Actualizacion: material.Fecha_Actualizacion,
                Ultima_Fecha_Baja: material.Ultima_Fecha_Baja,
                Estado_Material: {
                    Id_Estado_Material: material.Estado_Material.Id_Estado_Material,
                    Nombre_Estado_Material: material.Estado_Material.Nombre_Estado_Material
                },
                Unidad_Medicion: unidadMedicionFormateada,
                Categorias: categoriasFormateadas,
                Proveedor: proveedorFormateado,
                Usuario: usuarioFormateado
            };
        }));
    }

    async getMaterialesDisponibles() {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rolUsuario')
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .where('estado.Id_Estado_Material = :estado', { estado: 1 }) // 1 = Disponible
            .getMany();

        return Promise.all(materiales.map(async (material) => {
            const categoriasFormateadas = await Promise.all(
                material.materialCategorias?.map(async (mc) => 
                    await this.categoriasService.FormatearCategoriaParaResponse(mc.Categoria)
                ) || []
            );

            const unidadMedicionFormateada = await this.unidadesDeMedicionService.FormatearUnidadMedicionParaResponse(material.Unidad_Medicion);

            const usuarioFormateado = material.Usuario
                ? await this.usuariosService.FormatearUsuarioResponse(material.Usuario)
                : null;

            let proveedorFormateado: any = null;
            if (material.Proveedor) {
                proveedorFormateado = await this.proveedorService.FormatearProveedorParaResponse(material.Proveedor as any);
            }

            return {
                Id_Material: material.Id_Material,
                Nombre_Material: material.Nombre_Material,
                Descripcion: material.Descripcion,
                Cantidad: material.Cantidad,
                Precio_Unitario: material.Precio_Unitario,
                Fecha_Entrada: material.Fecha_Entrada,
                Fecha_Actualizacion: material.Fecha_Actualizacion,
                Ultima_Fecha_Baja: material.Ultima_Fecha_Baja,
                Estado_Material: {
                    Id_Estado_Material: material.Estado_Material.Id_Estado_Material,
                    Nombre_Estado_Material: material.Estado_Material.Nombre_Estado_Material
                },
                Unidad_Medicion: unidadMedicionFormateada,
                Categorias: categoriasFormateadas,
                Proveedor: proveedorFormateado,
                Usuario: usuarioFormateado
            };
        }));
    }

    async getMaterialesAgotados() {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rolUsuario')
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .where('estado.Id_Estado_Material = :estado', { estado: 2 }) // 2 = Agotado
            .getMany();

        return Promise.all(materiales.map(async (material) => {
            const categoriasFormateadas = await Promise.all(
                material.materialCategorias?.map(async (mc) => 
                    await this.categoriasService.FormatearCategoriaParaResponse(mc.Categoria)
                ) || []
            );

            const unidadMedicionFormateada = await this.unidadesDeMedicionService.FormatearUnidadMedicionParaResponse(material.Unidad_Medicion);

            const usuarioFormateado = material.Usuario
                ? await this.usuariosService.FormatearUsuarioResponse(material.Usuario)
                : null;

            let proveedorFormateado: any = null;
            if (material.Proveedor) {
                proveedorFormateado = await this.proveedorService.FormatearProveedorParaResponse(material.Proveedor as any);
            }

            return {
                Id_Material: material.Id_Material,
                Nombre_Material: material.Nombre_Material,
                Descripcion: material.Descripcion,
                Cantidad: material.Cantidad,
                Precio_Unitario: material.Precio_Unitario,
                Fecha_Entrada: material.Fecha_Entrada,
                Fecha_Actualizacion: material.Fecha_Actualizacion,
                Ultima_Fecha_Baja: material.Ultima_Fecha_Baja,
                Estado_Material: {
                    Id_Estado_Material: material.Estado_Material.Id_Estado_Material,
                    Nombre_Estado_Material: material.Estado_Material.Nombre_Estado_Material
                },
                Unidad_Medicion: unidadMedicionFormateada,
                Categorias: categoriasFormateadas,
                Proveedor: proveedorFormateado,
                Usuario: usuarioFormateado
            };
        }));
    }

    async getMaterialesDeBaja() {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rolUsuario')
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .where('estado.Id_Estado_Material = :estado', { estado: 3 }) // 3 = De baja
            .getMany();

        return Promise.all(materiales.map(async (material) => {
            const categoriasFormateadas = await Promise.all(
                material.materialCategorias?.map(async (mc) => 
                    await this.categoriasService.FormatearCategoriaParaResponse(mc.Categoria)
                ) || []
            );

            const unidadMedicionFormateada = await this.unidadesDeMedicionService.FormatearUnidadMedicionParaResponse(material.Unidad_Medicion);

            const usuarioFormateado = material.Usuario
                ? await this.usuariosService.FormatearUsuarioResponse(material.Usuario)
                : null;

            let proveedorFormateado: any = null;
            if (material.Proveedor) {
                proveedorFormateado = await this.proveedorService.FormatearProveedorParaResponse(material.Proveedor as any);
            }

            return {
                Id_Material: material.Id_Material,
                Nombre_Material: material.Nombre_Material,
                Descripcion: material.Descripcion,
                Cantidad: material.Cantidad,
                Precio_Unitario: material.Precio_Unitario,
                Fecha_Entrada: material.Fecha_Entrada,
                Fecha_Actualizacion: material.Fecha_Actualizacion,
                Ultima_Fecha_Baja: material.Ultima_Fecha_Baja,
                Estado_Material: {
                    Id_Estado_Material: material.Estado_Material.Id_Estado_Material,
                    Nombre_Estado_Material: material.Estado_Material.Nombre_Estado_Material
                },
                Unidad_Medicion: unidadMedicionFormateada,
                Categorias: categoriasFormateadas,
                Proveedor: proveedorFormateado,
                Usuario: usuarioFormateado
            };
        }));
    }

    async getMaterialesAgotadosYDeBaja() {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rolUsuario')
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .where('estado.Id_Estado_Material = :estado', { estado: 4 }) // 4 = Agotado y de baja
            .getMany();

        return Promise.all(materiales.map(async (material) => {
            const categoriasFormateadas = await Promise.all(
                material.materialCategorias?.map(async (mc) => 
                    await this.categoriasService.FormatearCategoriaParaResponse(mc.Categoria)
                ) || []
            );

            const unidadMedicionFormateada = await this.unidadesDeMedicionService.FormatearUnidadMedicionParaResponse(material.Unidad_Medicion);

            const usuarioFormateado = material.Usuario
                ? await this.usuariosService.FormatearUsuarioResponse(material.Usuario)
                : null;

            let proveedorFormateado: any = null;
            if (material.Proveedor) {
                proveedorFormateado = await this.proveedorService.FormatearProveedorParaResponse(material.Proveedor as any);
            }

            return {
                Id_Material: material.Id_Material,
                Nombre_Material: material.Nombre_Material,
                Descripcion: material.Descripcion,
                Cantidad: material.Cantidad,
                Precio_Unitario: material.Precio_Unitario,
                Fecha_Entrada: material.Fecha_Entrada,
                Fecha_Actualizacion: material.Fecha_Actualizacion,
                Ultima_Fecha_Baja: material.Ultima_Fecha_Baja,
                Estado_Material: {
                    Id_Estado_Material: material.Estado_Material.Id_Estado_Material,
                    Nombre_Estado_Material: material.Estado_Material.Nombre_Estado_Material
                },
                Unidad_Medicion: unidadMedicionFormateada,
                Categorias: categoriasFormateadas,
                Proveedor: proveedorFormateado,
                Usuario: usuarioFormateado
            };
        }));
    }

    async getMaterialesConCategorias() {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rolUsuario')
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .where('Categorias.Id_Material_Categoria IS NOT NULL')
            .getMany();

        return Promise.all(materiales.map(async (material) => {
            const categoriasFormateadas = await Promise.all(
                material.materialCategorias?.map(async (mc) => 
                    await this.categoriasService.FormatearCategoriaParaResponse(mc.Categoria)
                ) || []
            );

            const unidadMedicionFormateada = await this.unidadesDeMedicionService.FormatearUnidadMedicionParaResponse(material.Unidad_Medicion);

            const usuarioFormateado = material.Usuario
                ? await this.usuariosService.FormatearUsuarioResponse(material.Usuario)
                : null;

            let proveedorFormateado: any = null;
            if (material.Proveedor) {
                proveedorFormateado = await this.proveedorService.FormatearProveedorParaResponse(material.Proveedor as any);
            }

            return {
                Id_Material: material.Id_Material,
                Nombre_Material: material.Nombre_Material,
                Descripcion: material.Descripcion,
                Cantidad: material.Cantidad,
                Precio_Unitario: material.Precio_Unitario,
                Fecha_Entrada: material.Fecha_Entrada,
                Fecha_Actualizacion: material.Fecha_Actualizacion,
                Ultima_Fecha_Baja: material.Ultima_Fecha_Baja,
                Estado_Material: {
                    Id_Estado_Material: material.Estado_Material.Id_Estado_Material,
                    Nombre_Estado_Material: material.Estado_Material.Nombre_Estado_Material
                },
                Unidad_Medicion: unidadMedicionFormateada,
                Categorias: categoriasFormateadas,
                Proveedor: proveedorFormateado,
                Usuario: usuarioFormateado
            };
        }));
    }

    async getMaterialesSinCategorias() {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rolUsuario')
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .leftJoin('material.materialCategorias', 'Categorias')
            .where('Categorias.Id_Material_Categoria IS NULL')
            .getMany();

        return Promise.all(materiales.map(async (material) => {
            const unidadMedicionFormateada = await this.unidadesDeMedicionService.FormatearUnidadMedicionParaResponse(material.Unidad_Medicion);

            const usuarioFormateado = material.Usuario
                ? await this.usuariosService.FormatearUsuarioResponse(material.Usuario)
                : null;

            let proveedorFormateado: any = null;
            if (material.Proveedor) {
                proveedorFormateado = await this.proveedorService.FormatearProveedorParaResponse(material.Proveedor as any);
            }

            return {
                Id_Material: material.Id_Material,
                Nombre_Material: material.Nombre_Material,
                Descripcion: material.Descripcion,
                Cantidad: material.Cantidad,
                Precio_Unitario: material.Precio_Unitario,
                Fecha_Entrada: material.Fecha_Entrada,
                Fecha_Actualizacion: material.Fecha_Actualizacion,
                Ultima_Fecha_Baja: material.Ultima_Fecha_Baja,
                Estado_Material: {
                    Id_Estado_Material: material.Estado_Material.Id_Estado_Material,
                    Nombre_Estado_Material: material.Estado_Material.Nombre_Estado_Material
                },
                Unidad_Medicion: unidadMedicionFormateada,
                Categorias: [],
                Proveedor: proveedorFormateado,
                Usuario: usuarioFormateado
            };
        }));
    }

    async getMaterialesPorEncimaDeStock(threshold: number) {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rolUsuario')
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .where('material.Cantidad > :threshold', { threshold })
            .orderBy('material.Cantidad', 'DESC')
            .getMany();

        return Promise.all(materiales.map(async (material) => {
            const categoriasFormateadas = await Promise.all(
                material.materialCategorias?.map(async (mc) => 
                    await this.categoriasService.FormatearCategoriaParaResponse(mc.Categoria)
                ) || []
            );

            const unidadMedicionFormateada = await this.unidadesDeMedicionService.FormatearUnidadMedicionParaResponse(material.Unidad_Medicion);

            const usuarioFormateado = material.Usuario
                ? await this.usuariosService.FormatearUsuarioResponse(material.Usuario)
                : null;

            let proveedorFormateado: any = null;
            if (material.Proveedor) {
                proveedorFormateado = await this.proveedorService.FormatearProveedorParaResponse(material.Proveedor as any);
            }

            return {
                Id_Material: material.Id_Material,
                Nombre_Material: material.Nombre_Material,
                Descripcion: material.Descripcion,
                Cantidad: material.Cantidad,
                Precio_Unitario: material.Precio_Unitario,
                Fecha_Entrada: material.Fecha_Entrada,
                Fecha_Actualizacion: material.Fecha_Actualizacion,
                Ultima_Fecha_Baja: material.Ultima_Fecha_Baja,
                Estado_Material: {
                    Id_Estado_Material: material.Estado_Material.Id_Estado_Material,
                    Nombre_Estado_Material: material.Estado_Material.Nombre_Estado_Material
                },
                Unidad_Medicion: unidadMedicionFormateada,
                Categorias: categoriasFormateadas,
                Proveedor: proveedorFormateado,
                Usuario: usuarioFormateado
            };
        }));
    }

    async getMaterialesPorDebajoDeStock(threshold: number) {
        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rolUsuario')
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .where('material.Cantidad < :threshold', { threshold })
            .orderBy('material.Cantidad', 'ASC')
            .getMany();

        return Promise.all(materiales.map(async (material) => {
            const categoriasFormateadas = await Promise.all(
                material.materialCategorias?.map(async (mc) => 
                    await this.categoriasService.FormatearCategoriaParaResponse(mc.Categoria)
                ) || []
            );

            const unidadMedicionFormateada = await this.unidadesDeMedicionService.FormatearUnidadMedicionParaResponse(material.Unidad_Medicion);

            const usuarioFormateado = material.Usuario
                ? await this.usuariosService.FormatearUsuarioResponse(material.Usuario)
                : null;

            let proveedorFormateado: any = null;
            if (material.Proveedor) {
                proveedorFormateado = await this.proveedorService.FormatearProveedorParaResponse(material.Proveedor as any);
            }

            return {
                Id_Material: material.Id_Material,
                Nombre_Material: material.Nombre_Material,
                Descripcion: material.Descripcion,
                Cantidad: material.Cantidad,
                Precio_Unitario: material.Precio_Unitario,
                Fecha_Entrada: material.Fecha_Entrada,
                Fecha_Actualizacion: material.Fecha_Actualizacion,
                Ultima_Fecha_Baja: material.Ultima_Fecha_Baja,
                Estado_Material: {
                    Id_Estado_Material: material.Estado_Material.Id_Estado_Material,
                    Nombre_Estado_Material: material.Estado_Material.Nombre_Estado_Material
                },
                Unidad_Medicion: unidadMedicionFormateada,
                Categorias: categoriasFormateadas,
                Proveedor: proveedorFormateado,
                Usuario: usuarioFormateado
            };
        }));
    }

    async getMaterialesEntreRangoPrecio(minPrice: number, maxPrice: number) {
        if (minPrice < 0 || maxPrice < 0) {
            throw new BadRequestException('Los precios no pueden ser negativos');
        }

        const materiales = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estado')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rolUsuario')
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .where('material.Precio_Unitario BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice })
            .getMany();

        return Promise.all(materiales.map(async (material) => {
            const categoriasFormateadas = await Promise.all(
                material.materialCategorias?.map(async (mc) => 
                    await this.categoriasService.FormatearCategoriaParaResponse(mc.Categoria)
                ) || []
            );

            const unidadMedicionFormateada = await this.unidadesDeMedicionService.FormatearUnidadMedicionParaResponse(material.Unidad_Medicion);

            const usuarioFormateado = material.Usuario
                ? await this.usuariosService.FormatearUsuarioResponse(material.Usuario)
                : null;

            let proveedorFormateado: any = null;
            if (material.Proveedor) {
                proveedorFormateado = await this.proveedorService.FormatearProveedorParaResponse(material.Proveedor as any);
            }

            return {
                Id_Material: material.Id_Material,
                Nombre_Material: material.Nombre_Material,
                Descripcion: material.Descripcion,
                Cantidad: material.Cantidad,
                Precio_Unitario: material.Precio_Unitario,
                Fecha_Entrada: material.Fecha_Entrada,
                Fecha_Actualizacion: material.Fecha_Actualizacion,
                Ultima_Fecha_Baja: material.Ultima_Fecha_Baja,
                Estado_Material: {
                    Id_Estado_Material: material.Estado_Material.Id_Estado_Material,
                    Nombre_Estado_Material: material.Estado_Material.Nombre_Estado_Material
                },
                Unidad_Medicion: unidadMedicionFormateada,
                Categorias: categoriasFormateadas,
                Proveedor: proveedorFormateado,
                Usuario: usuarioFormateado
            };
        }));
    }

    async createMaterial(dto: CreateMaterialDto, idUsuario: number) {
        const NombreNormalizado = dto.Nombre_Material[0].toUpperCase() + dto.Nombre_Material.slice(1).toLowerCase();

        const materialExistente = await this.inventarioRepository.findOne({ where: { Nombre_Material: NombreNormalizado } });
        if (materialExistente) { throw new ConflictException('Ya existe un material con este nombre'); }

        const unidadMedicionExistente = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: dto.Id_Unidad_Medicion } });
        if (!unidadMedicionExistente) { throw new BadRequestException('La unidad de medición proporcionada no existe'); }
        if (unidadMedicionExistente.Estado_Unidad_Medicion.Id_Estado_Unidad_Medicion !== 1) { throw new BadRequestException('La unidad de medición proporcionada no está activa'); }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario }, relations: ['Rol'] });
        if (!usuario) { throw new BadRequestException(`Usuario con ID ${idUsuario} no encontrado`); }

        // Validar y obtener proveedor según su tipo (opcional)
        let proveedorFisico: ProveedorFisico | null = null;
        let proveedorJuridico: ProveedorJuridico | null = null;

        // Solo validar proveedor si se proporciona
        if (dto.Id_Proveedor && dto.Id_Tipo_Proveedor) {
            // Primero validar que el proveedor existe en la tabla base y que el tipo coincide
            const proveedorBase = await this.inventarioRepository.manager.findOne(Proveedor, {
                where: { Id_Proveedor: dto.Id_Proveedor },
                relations: ['Estado_Proveedor']
            });
            
            if (!proveedorBase) {
                throw new BadRequestException(`Proveedor con ID ${dto.Id_Proveedor} no encontrado`);
            }

            // Validar que el Tipo_Entidad coincide con el tipo especificado
            if (proveedorBase.Tipo_Entidad !== dto.Id_Tipo_Proveedor) {
                throw new BadRequestException(
                    `El proveedor con ID ${dto.Id_Proveedor} es de tipo ${proveedorBase.Tipo_Entidad === 1 ? 'Físico' : 'Jurídico'}, ` +
                    `pero se especificó tipo ${dto.Id_Tipo_Proveedor === 1 ? 'Físico' : 'Jurídico'}`
                );
            }

            // Validar que el proveedor está activo
            if (proveedorBase.Estado_Proveedor?.Id_Estado_Proveedor !== 1) {
                throw new BadRequestException('El proveedor no está activo');
            }

            // Ahora obtener el proveedor específico según el tipo
            if (dto.Id_Tipo_Proveedor === 1) {
                const proveedorFisicoExistente = await this.proveedorFisicoRepository.findOne({ 
                    where: { Id_Proveedor: dto.Id_Proveedor }, 
                    relations: ['Estado_Proveedor'] 
                });
                if (!proveedorFisicoExistente) { 
                    throw new BadRequestException('Proveedor físico no encontrado en la tabla específica'); 
                }
                proveedorFisico = proveedorFisicoExistente;
            }

            else if (dto.Id_Tipo_Proveedor === 2) {
                const proveedorJuridicoExistente = await this.proveedorJuridicoRepository.findOne({ 
                    where: { Id_Proveedor: dto.Id_Proveedor }, 
                    relations: ['Estado_Proveedor'] 
                });
                if (!proveedorJuridicoExistente) { 
                    throw new BadRequestException('Proveedor jurídico no encontrado en la tabla específica'); 
                }
                proveedorJuridico = proveedorJuridicoExistente;
            }

            else { 
                throw new BadRequestException('El tipo de proveedor debe ser 1 (físico) o 2 (jurídico)'); 
            }
        }

        // Validar categorías si se proporcionan
        let categorias: Categoria[] = [];
        if (dto.IDS_Categorias && dto.IDS_Categorias.length > 0) {
            categorias = await this.categoriaRepository.find({ where: { Id_Categoria: In(dto.IDS_Categorias) } });
            if (categorias.length !== dto.IDS_Categorias.length) {
                throw new BadRequestException('Una o más categorías no existen');
            }
        }

        // Crear el material con o sin proveedor
        const materialData: any = {
            Nombre_Material: NombreNormalizado,
            Descripcion: dto.Descripcion,
            Cantidad: dto.Cantidad,
            Precio_Unitario: dto.Precio_Unitario,
            Unidad_Medicion: unidadMedicionExistente,
            Usuario: usuario,
        };

        // Solo agregar proveedor si existe
        if (proveedorFisico) {
            materialData.Proveedor = proveedorFisico;
        } else if (proveedorJuridico) {
            materialData.Proveedor = proveedorJuridico;
        }

        const nuevoMaterial = this.inventarioRepository.create(materialData);
        const savedMaterial = await this.inventarioRepository.save(nuevoMaterial) as unknown as Material;

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

        // Obtener el material creado con todas sus relaciones
        const materialCreado = await this.inventarioRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estadoMaterial')
            .leftJoinAndSelect('material.Unidad_Medicion', 'unidadMedicion')
            .leftJoinAndSelect('unidadMedicion.Estado_Unidad_Medicion', 'estadoUnidadMedicion')
            .leftJoinAndSelect('material.materialCategorias', 'Categorias')
            .leftJoinAndSelect('Categorias.Categoria', 'categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estadoCategoria')
            .leftJoinAndSelect('material.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rolUsuario')
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .where('material.Id_Material = :id', { id: savedMaterial.Id_Material })
            .getOne();

        if (!materialCreado) {
            throw new NotFoundException('Error al recuperar el material creado');
        }

        // Formatear todas las relaciones usando los métodos de formateo
        const categoriasFormateadas = await Promise.all(
            materialCreado.materialCategorias?.map(async (mc) => 
                await this.categoriasService.FormatearCategoriaParaResponse(mc.Categoria)
            ) || []
        );

        const unidadMedicionFormateada = await this.unidadesDeMedicionService.FormatearUnidadMedicionParaResponse(materialCreado.Unidad_Medicion);

        const usuarioFormateado = await this.usuariosService.FormatearUsuarioResponse(materialCreado.Usuario);

        let proveedorFormateado: any = null;
        if (materialCreado.Proveedor) {
            proveedorFormateado = await this.proveedorService.FormatearProveedorParaResponse(materialCreado.Proveedor as any);
        }

        // Registrar auditoría de creación
        try {
            await this.auditoriaService.logCreacion(
                'Material',
                idUsuario,
                savedMaterial.Id_Material,
                {
                    Nombre_Material: materialCreado.Nombre_Material,
                    Descripcion: materialCreado.Descripcion,
                    Cantidad: materialCreado.Cantidad,
                    Precio_Unitario: materialCreado.Precio_Unitario,
                    Id_Unidad_Medicion: materialCreado.Unidad_Medicion.Id_Unidad_Medicion,
                    Id_Proveedor: materialCreado.Proveedor ? (materialCreado.Proveedor as any).Id_Proveedor : null,
                    Categorias: materialCreado.materialCategorias?.map(mc => mc.Categoria.Nombre_Categoria) || []
                }
            );
        } catch (error) {
            console.error('Error al registrar auditoría de creación de material:', error);
        }

        return {
            Id_Material: materialCreado.Id_Material,
            Nombre_Material: materialCreado.Nombre_Material,
            Descripcion: materialCreado.Descripcion,
            Cantidad: materialCreado.Cantidad,
            Precio_Unitario: materialCreado.Precio_Unitario,
            Ultima_Fecha_Baja: materialCreado.Ultima_Fecha_Baja,
            Estado_Material: {
                Id_Estado_Material: materialCreado.Estado_Material.Id_Estado_Material,
                Nombre_Estado_Material: materialCreado.Estado_Material.Nombre_Estado_Material
            },
            Unidad_Medicion: unidadMedicionFormateada,
            Categorias: categoriasFormateadas,
            Proveedor: proveedorFormateado,
            Usuario: usuarioFormateado
        };
    }

    async updateMaterial(Id_Material: number, dto: UpdateMaterialDto, usuarioId: number) {
        const materialExistente = await this.inventarioRepository.findOne({ where: { Id_Material: Id_Material }, relations: ['materialCategorias', 'materialCategorias.Categoria', 'Unidad_Medicion', 'Proveedor', 'Estado_Material'] });
        if (!materialExistente) { throw new NotFoundException(`Material con ID ${Id_Material} no encontrado`); }

        // Capturar datos anteriores para auditoría
        const datosAnteriores = {
            Nombre_Material: materialExistente.Nombre_Material,
            Descripcion: materialExistente.Descripcion,
            Cantidad: materialExistente.Cantidad,
            Precio_Unitario: materialExistente.Precio_Unitario,
            Id_Unidad_Medicion: materialExistente.Unidad_Medicion?.Id_Unidad_Medicion,
            Id_Proveedor: materialExistente.Proveedor ? (materialExistente.Proveedor as any).Id_Proveedor : null,
            Categorias: materialExistente.materialCategorias?.map(mc => mc.Categoria.Nombre_Categoria) || []
        };

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
        const { materialCategorias: categoriasExistentes, Estado_Material, ...materialSinRelacionesTemp } = materialExistente;

        const materialActualizado = {
            ...materialSinRelacionesTemp,
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
            .leftJoinAndSelect('material.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rolUsuario')
            .leftJoinAndSelect('material.Proveedor', 'proveedor')
            .leftJoinAndSelect('proveedor.Estado_Proveedor', 'estadoProveedor')
            .where('material.Id_Material = :id', { id: Id_Material })
            .getOne();

        if (!materialActualizadoCompleto) {
            throw new NotFoundException('Error al recuperar el material actualizado');
        }

        // Registrar auditoría de actualización
        try {
            const datosNuevos = {
                Nombre_Material: materialActualizadoCompleto.Nombre_Material,
                Descripcion: materialActualizadoCompleto.Descripcion,
                Cantidad: materialActualizadoCompleto.Cantidad,
                Precio_Unitario: materialActualizadoCompleto.Precio_Unitario,
                Id_Unidad_Medicion: materialActualizadoCompleto.Unidad_Medicion.Id_Unidad_Medicion,
                Id_Proveedor: materialActualizadoCompleto.Proveedor ? (materialActualizadoCompleto.Proveedor as any).Id_Proveedor : null,
                Categorias: materialActualizadoCompleto.materialCategorias?.map(mc => mc.Categoria.Nombre_Categoria) || []
            };

            await this.auditoriaService.logActualizacion(
                'Material',
                usuarioId,
                Id_Material,
                datosAnteriores,
                datosNuevos
            );
        } catch (error) {
            console.error('Error al registrar auditoría de actualización de material:', error);
        }

        // Formatear todas las relaciones usando los métodos de formateo
        const categoriasFormateadas = await Promise.all(
            materialActualizadoCompleto.materialCategorias?.map(async (mc) => 
                await this.categoriasService.FormatearCategoriaParaResponse(mc.Categoria)
            ) || []
        );

        const unidadMedicionFormateada = await this.unidadesDeMedicionService.FormatearUnidadMedicionParaResponse(materialActualizadoCompleto.Unidad_Medicion);

        const usuarioFormateado = await this.usuariosService.FormatearUsuarioResponse(materialActualizadoCompleto.Usuario);

        let proveedorFormateado: any = null;
        if (materialActualizadoCompleto.Proveedor) {
            proveedorFormateado = await this.proveedorService.FormatearProveedorParaResponse(materialActualizadoCompleto.Proveedor as any);
        }

        return {
            Id_Material: materialActualizadoCompleto.Id_Material,
            Nombre_Material: materialActualizadoCompleto.Nombre_Material,
            Descripcion: materialActualizadoCompleto.Descripcion,
            Cantidad: materialActualizadoCompleto.Cantidad,
            Precio_Unitario: materialActualizadoCompleto.Precio_Unitario,
            Ultima_Fecha_Baja: materialActualizadoCompleto.Ultima_Fecha_Baja,
            Estado_Material: {
                Id_Estado_Material: materialActualizadoCompleto.Estado_Material.Id_Estado_Material,
                Nombre_Estado_Material: materialActualizadoCompleto.Estado_Material.Nombre_Estado_Material
            },
            Unidad_Medicion: unidadMedicionFormateada,
            Categorias: categoriasFormateadas,
            Proveedor: proveedorFormateado,
            Usuario: usuarioFormateado
        };
    }

    async updateEstadoMaterial(Id_Material: number, nuevoEstadoId: number, usuarioId: number) {
        const material = await this.inventarioRepository.findOne({ where: { Id_Material: Id_Material }, relations: ['Estado_Material'] });
        if (!material) { throw new NotFoundException(`Material con ID ${Id_Material} no encontrado`); }

        const estadoActualId = material.Estado_Material.Id_Estado_Material;
        const estadoAnterior = {
            Id_Estado: estadoActualId,
            Nombre_Estado: material.Estado_Material.Nombre_Estado_Material
        };

        if (material.Cantidad === 0 && nuevoEstadoId === 1) {
            throw new BadRequestException('No se puede cambiar el estado a "Disponible" si la cantidad en stock es 0');
        }

        // Si está "Agotado" (2) y se cambia a "De baja" (3) → cambiar a "Agotado y de baja" (4)
        else if (estadoActualId === 2 && nuevoEstadoId === 3) {
            const estadoAgotadoYBaja = await this.estadoMaterialRepository.findOne({ where: { Id_Estado_Material: 4 } });
            if (!estadoAgotadoYBaja) { throw new NotFoundException(`Estado "Agotado y de baja" no encontrado`); }

            material.Estado_Material = estadoAgotadoYBaja;
            material.Ultima_Fecha_Baja = new Date();
            const materialActualizado = await this.inventarioRepository.save(material);

            // Registrar auditoría
            if (usuarioId) {
                try {
                    await this.auditoriaService.logActualizacion(
                        'Material',
                        usuarioId,
                        Id_Material,
                        estadoAnterior,
                        { Id_Estado: 4, Nombre_Estado: estadoAgotadoYBaja.Nombre_Estado_Material }
                    );
                } catch (error) {
                    console.error('Error al registrar auditoría de cambio de estado de material:', error);
                }
            }

            return materialActualizado;
        }

        // Si ya estaba "Agotado y de baja" (4) y se cambia a "De baja" (3) → no crear nueva fecha de baja
        else if (estadoActualId === 4 && nuevoEstadoId === 3) {
            const estadoDeBaja = await this.estadoMaterialRepository.findOne({ where: { Id_Estado_Material: 3 } });
            if (!estadoDeBaja) { throw new NotFoundException(`Estado "De baja" no encontrado`); }

            material.Estado_Material = estadoDeBaja;
            // No actualizar Ultima_Fecha_Baja porque ya tenía una fecha de baja anterior
            const materialActualizado = await this.inventarioRepository.save(material);

            // Registrar auditoría
            if (usuarioId) {
                try {
                    await this.auditoriaService.logActualizacion(
                        'Material',
                        usuarioId,
                        Id_Material,
                        estadoAnterior,
                        { Id_Estado: 3, Nombre_Estado: estadoDeBaja.Nombre_Estado_Material }
                    );
                } catch (error) {
                    console.error('Error al registrar auditoría de cambio de estado de material:', error);
                }
            }

            return materialActualizado;
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
        const materialActualizado = await this.inventarioRepository.save(material);

        // Registrar auditoría
        if (usuarioId) {
            try {
                await this.auditoriaService.logActualizacion(
                    'Material',
                    usuarioId,
                    Id_Material,
                    estadoAnterior,
                    { Id_Estado: nuevoEstadoId, Nombre_Estado: nuevoEstado.Nombre_Estado_Material }
                );
            } catch (error) {
                console.error('Error al registrar auditoría de cambio de estado de material:', error);
            }
        }

        return materialActualizado;
    }
}