import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Permiso } from 'src/Modules/Usuarios/UsuarioEntities/Permiso.Entity';
import { Usuario } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';
import { UsuarioRol } from 'src/Modules/Usuarios/UsuarioEntities/UsuarioRol.Entity';
import { EstadoProveedor } from 'src/Modules/Proveedores/ProveedorEntities/EstadoProveedor.Entity';
import { EstadoProyecto } from 'src/Modules/Proyectos/ProyectoEntities/EstadoProyecto.Entity';
import { EstadoSolicitud } from 'src/Modules/Solicitudes/SolicitudEntities/EstadoSolicitud.Entity';
import { EstadoAfiliado } from 'src/Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity';
import { TipoAfiliado } from 'src/Modules/Afiliados/AfiliadoEntities/TipoAfiliado.Entity';
import { EstadoMaterial } from 'src/Modules/Inventario/InventarioEntities/EstadoMaterial.Entity';
import { Categoria } from 'src/Modules/Inventario/InventarioEntities/Categoria.Entity';
import { EstadoUnidadMedicion } from 'src/Modules/Inventario/InventarioEntities/EstadoUnidadMedicion.Entity';
import { UnidadMedicion } from 'src/Modules/Inventario/InventarioEntities/UnidadMedicion.Entity';
import { EstadoCategoria } from 'src/Modules/Inventario/InventarioEntities/EstadoCategoria.Entity';
import { EstadoMedidor } from 'src/Modules/Inventario/InventarioEntities/EstadoMedidor.Entity';
import { TipoTarifaLectura } from 'src/Modules/Lecturas/LecturaEntities/TipoTarifaLectura.Entity';
import { TipoTarifaServiciosFijos } from 'src/Modules/Lecturas/LecturaEntities/TipoTarifaServiciosFijos.Entity';
import { TipoTarifaVentaAgua } from 'src/Modules/Lecturas/LecturaEntities/TipoTarifaVentaAgua.Entity';
import { RangoAfiliados } from 'src/Modules/Lecturas/LecturaEntities/RangoAfiliados.Entity';
import { RangoConsumo } from 'src/Modules/Lecturas/LecturaEntities/RangoConsumo.Entity';
import { EstadoReporte } from 'src/Modules/Reportes/ReporteEntities/EstadoReporte.Entity';
import { EstadoSugerencia } from 'src/Modules/Sugerencias/SugerenciaEntities/EstadoSugerencia.Entity';
import { EstadoQueja } from 'src/Modules/Quejas/QuejaEntities/EstadoQueja.Entity';

@Injectable()
export class SeederService implements OnModuleInit {
    constructor(
        @InjectRepository(UsuarioRol)
        private readonly rolRepository: Repository<UsuarioRol>,

        @InjectRepository(Permiso)
        private readonly permisoRepository: Repository<Permiso>,

        @InjectRepository(Usuario)
        private readonly userRepository: Repository<Usuario>,

        @InjectRepository(EstadoProveedor)
        private readonly estadoProveedorRepo: Repository<EstadoProveedor>,

        @InjectRepository(EstadoProyecto)
        private readonly proyectoEstadoRepository: Repository<EstadoProyecto>,

        @InjectRepository(EstadoSolicitud)
        private readonly solicitudEstadoRepository: Repository<EstadoSolicitud>,

        @InjectRepository(EstadoAfiliado)
        private readonly afiliadoEstadoRepository: Repository<EstadoAfiliado>,

        @InjectRepository(TipoAfiliado)
        private readonly tipoAfiliadoRepository: Repository<TipoAfiliado>,

        @InjectRepository(EstadoMaterial)
        private readonly estadoMaterialRepository: Repository<EstadoMaterial>,

        @InjectRepository(Categoria)
        private readonly categoriaMaterialRepository: Repository<Categoria>,

        @InjectRepository(EstadoCategoria)
        private readonly estadoCategoriaRepository: Repository<EstadoCategoria>,

        @InjectRepository(EstadoUnidadMedicion)
        private readonly estadoUnidadMedicionRepository: Repository<EstadoUnidadMedicion>,

        @InjectRepository(UnidadMedicion)
        private readonly unidadMedicionRepository: Repository<UnidadMedicion>,

        @InjectRepository(EstadoReporte)
        private readonly estadoReporteRepository: Repository<EstadoReporte>,

        @InjectRepository(EstadoSugerencia)
        private readonly estadoSugerenciaRepository: Repository<EstadoSugerencia>,

        @InjectRepository(EstadoQueja)
        private readonly estadoQuejaRepository: Repository<EstadoQueja>,

        @InjectRepository(EstadoMedidor)
        private readonly estadoMedidorRepository: Repository<EstadoMedidor>,

        @InjectRepository(TipoTarifaLectura)
        private readonly tipoTarifaLecturaRepository: Repository<TipoTarifaLectura>,

        @InjectRepository(TipoTarifaServiciosFijos)
        private readonly tipoTarifaServiciosFijosRepository: Repository<TipoTarifaServiciosFijos>,

        @InjectRepository(TipoTarifaVentaAgua)
        private readonly tipoTarifaVentaAguaRepository: Repository<TipoTarifaVentaAgua>,

        @InjectRepository(RangoAfiliados)
        private readonly rangoAfiliadosRepository: Repository<RangoAfiliados>,

        @InjectRepository(RangoConsumo)
        private readonly rangoConsumoRepository: Repository<RangoConsumo>,
    ) { }

    async onModuleInit() {
        try {
            await this.createInitialData();
            await this.createDefaultEstadosProveedor();
            await this.createDefaultEstadosProyecto();
            await this.createDefaultEstadosSolicitud();
            await this.createDefaultEstadosReporte();
            await this.createDefaultEstadosSugerencia();
            await this.createDefaultEstadosQueja();
            await this.createDefaultEstadosAfiliado();
            await this.createDefaultTiposAfiliado();
            await this.createDefaultEstadosMaterial();
            await this.createDefaultEstadosCategoria();
            await this.createDefaultCategoriasMaterial();
            await this.createDefaultEstadosUnidadMedicion();
            await this.createDefaultUnidadesMedicion();
            await this.createDefaultEstadosMedidor();
            await this.createDefaultTiposTarifaLectura();
            await this.createDefaultTiposTarifaServiciosFijos();
            await this.createDefaultTiposTarifaVentaAgua();
            await this.createRangosAfiliados();
            await this.createRangosConsumo();
        } catch (err) {
            console.error('Error ejecutando Seeder.onModuleInit:', err);
        }
    }

    private async createInitialData() {
        try {
            // Crear en orden: rol → permisos → asignar permisos → usuario
            await this.createAdminRole();
            await this.createPermisos();
            await this.assignPermisosToAdminRole(); //  Asignar permisos
            await this.createAdminUser();
        }
        catch (error) {
            console.error('Error en seeder:', error);
        }
    }

    private async createDefaultEstadosProyecto() {
        const estados = [
            { Id_Estado_Proyecto: 1, Nombre_Estado: 'En Planeamiento' },
            { Id_Estado_Proyecto: 2, Nombre_Estado: 'En Progreso' },
            { Id_Estado_Proyecto: 3, Nombre_Estado: 'Terminado' },
        ];

        for (const estado of estados) {
            const existe = await this.proyectoEstadoRepository.findOne({
                where: { Id_Estado_Proyecto: estado.Id_Estado_Proyecto }
            });

            if (!existe) {
                const nuevoEstado = this.proyectoEstadoRepository.create(estado);
                await this.proyectoEstadoRepository.save(nuevoEstado);
            }
        }
    }

    private async createDefaultEstadosSolicitud() {
        const estados = [
            { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' },
            { Id_Estado_Solicitud: 2, Nombre_Estado: 'En revisión' },
            { Id_Estado_Solicitud: 3, Nombre_Estado: 'Aprobada y en espera' },
            { Id_Estado_Solicitud: 4, Nombre_Estado: 'Completada' },
            { Id_Estado_Solicitud: 5, Nombre_Estado: 'Rechazada' },
        ];

        for (const estado of estados) {
            const existe = await this.solicitudEstadoRepository.findOne({
                where: { Id_Estado_Solicitud: estado.Id_Estado_Solicitud }
            });

            if (!existe) {
                const nuevoEstado = this.solicitudEstadoRepository.create(estado);
                await this.solicitudEstadoRepository.save(nuevoEstado);
            }
        }
    }

    private async createDefaultEstadosAfiliado() {
        const estados = [
            { Id_Estado_Afiliado: 1, Nombre_Estado: 'Activo' },
            { Id_Estado_Afiliado: 2, Nombre_Estado: 'Inactivo' },
            { Id_Estado_Afiliado: 3, Nombre_Estado: 'En Espera' },
        ];

        for (const estado of estados) {
            const existe = await this.afiliadoEstadoRepository.findOne({
                where: { Id_Estado_Afiliado: estado.Id_Estado_Afiliado }
            });

            if (!existe) {
                const nuevoEstado = this.afiliadoEstadoRepository.create(estado);
                await this.afiliadoEstadoRepository.save(nuevoEstado);
            }
        }
    }

    private async createDefaultTiposAfiliado() {
        const tipos = [
            { Id_Tipo_Afiliado: 1, Nombre_Tipo_Afiliado: 'Abonado' },
            { Id_Tipo_Afiliado: 2, Nombre_Tipo_Afiliado: 'Asociado' }
        ];

        for (const tipo of tipos) {
            const existe = await this.tipoAfiliadoRepository.findOne({
                where: { Id_Tipo_Afiliado: tipo.Id_Tipo_Afiliado }
            });

            if (!existe) {
                const nuevoTipo = this.tipoAfiliadoRepository.create(tipo);
                await this.tipoAfiliadoRepository.save(nuevoTipo);
            }
        }
    }

    private async createDefaultEstadosMaterial() {
        const estados = [
            { Id_Estado_Material: 1, Nombre_Estado_Material: 'Disponible' },
            { Id_Estado_Material: 2, Nombre_Estado_Material: 'Agotado' },
            { Id_Estado_Material: 3, Nombre_Estado_Material: 'De baja' },
            { Id_Estado_Material: 4, Nombre_Estado_Material: 'Agotado y de baja' }
        ];

        for (const estado of estados) {
            const existe = await this.estadoMaterialRepository.findOne({
                where: { Id_Estado_Material: estado.Id_Estado_Material }
            });

            if (!existe) {
                const nuevoEstado = this.estadoMaterialRepository.create(estado);
                await this.estadoMaterialRepository.save(nuevoEstado);
            }
        }
    }

    private async createDefaultEstadosCategoria() {
        const estados = [
            { Id_Estado_Categoria: 1, Nombre_Estado_Categoria: 'Activa' },
            { Id_Estado_Categoria: 2, Nombre_Estado_Categoria: 'Inactiva' },
        ];

        for (const estado of estados) {
            const existe = await this.estadoCategoriaRepository.findOne({
                where: { Id_Estado_Categoria: estado.Id_Estado_Categoria }
            });

            if (!existe) {
                const nuevoEstado = this.estadoCategoriaRepository.create(estado);
                await this.estadoCategoriaRepository.save(nuevoEstado);
            }
        }
    }

    private async createDefaultCategoriasMaterial() {
        // Buscar el usuario admin para asignarlo como creador
        const adminUser = await this.userRepository.findOne({
            where: { Nombre_Usuario: 'admin' }
        });

        if (!adminUser) {
            console.warn('Usuario admin no encontrado. Las categorías se crearán sin usuario creador.');
        }

        const categorias = [
            { Id_Categoria: 1, Nombre_Categoria: 'Plomeria', Descripcion_Categoria: 'Materiales relacionados con plomería' },
            { Id_Categoria: 2, Nombre_Categoria: 'Electricidad', Descripcion_Categoria: 'Materiales relacionados con electricidad' },
            { Id_Categoria: 3, Nombre_Categoria: 'Herramientas', Descripcion_Categoria: 'Materiales relacionados con herramientas' },
            { Id_Categoria: 4, Nombre_Categoria: 'Otros', Descripcion_Categoria: 'Materiales de otras categorías' },
        ];

        for (const categoria of categorias) {
            const existe = await this.categoriaMaterialRepository.findOne({
                where: { Id_Categoria: categoria.Id_Categoria }
            });

            if (!existe) {
                const nuevaCategoria = this.categoriaMaterialRepository.create(categoria);

                // Asignar el usuario creador si existe
                if (adminUser) {
                    nuevaCategoria.Usuario = adminUser;
                }

                await this.categoriaMaterialRepository.save(nuevaCategoria);
            }
        }
    }

    private async createDefaultEstadosUnidadMedicion() {
        const estados = [
            { Id_Estado_Unidad_Medicion: 1, Nombre_Estado_Unidad_Medicion: 'Activo' },
            { Id_Estado_Unidad_Medicion: 2, Nombre_Estado_Unidad_Medicion: 'Inactivo' },
        ];

        for (const estado of estados) {
            const existe = await this.estadoUnidadMedicionRepository.findOne({
                where: { Id_Estado_Unidad_Medicion: estado.Id_Estado_Unidad_Medicion }
            });

            if (!existe) {
                const nuevoEstado = this.estadoUnidadMedicionRepository.create(estado);
                await this.estadoUnidadMedicionRepository.save(nuevoEstado);
            }
        }
    }

    private async createDefaultUnidadesMedicion() {
        // Buscar el usuario admin para asignarlo como creador
        const adminUser = await this.userRepository.findOne({
            where: { Nombre_Usuario: 'admin' }
        });

        if (!adminUser) {
            console.warn('Usuario admin no encontrado. Las categorías se crearán sin usuario creador.');
        }

        const unidades = [
            { Id_Unidad_Medicion: 1, Nombre_Unidad: 'Unidad', Abreviatura: 'u', Descripcion: 'Unidades simples', Id_Estado_Unidad_Medicion: 1 },
            { Id_Unidad_Medicion: 2, Nombre_Unidad: 'Paquete', Abreviatura: 'p', Descripcion: 'De entre 4 a 8 por paquete', Id_Estado_Unidad_Medicion: 1 },
            { Id_Unidad_Medicion: 3, Nombre_Unidad: 'Litro', Abreviatura: 'l', Descripcion: 'Unidad de medida para líquidos', Id_Estado_Unidad_Medicion: 1 },
        ];

        for (const unidad of unidades) {
            const existe = await this.unidadMedicionRepository.findOne({
                where: { Id_Unidad_Medicion: unidad.Id_Unidad_Medicion }
            });

            if (!existe) {
                const nuevaUnidad = this.unidadMedicionRepository.create(unidad);

                // Asignar el usuario creador si existe
                if (adminUser) {
                    nuevaUnidad.Usuario = adminUser;
                }

                await this.unidadMedicionRepository.save(nuevaUnidad);
            }
        }
    }

    private async createDefaultEstadosMedidor() {
        const estados = [
            { Id_Estado_Medidor: 1, Nombre_Estado_Medidor: 'No instalado' },
            { Id_Estado_Medidor: 2, Nombre_Estado_Medidor: 'Instalado' },
            { Id_Estado_Medidor: 3, Nombre_Estado_Medidor: 'Averiado' },
        ];

        for (const estado of estados) {
            const existe = await this.estadoMedidorRepository.findOne({
                where: { Id_Estado_Medidor: estado.Id_Estado_Medidor }
            });

            if (!existe) {
                const nuevoEstado = this.estadoMedidorRepository.create(estado);
                await this.estadoMedidorRepository.save(nuevoEstado);
            }
        }
    }

    private async createDefaultEstadosProveedor() {
        const estados = [
            { Id_Estado_Proveedor: 1, Estado_Proveedor: 'Activo' },
            { Id_Estado_Proveedor: 2, Estado_Proveedor: 'Inactivo' },
        ];

        for (const estado of estados) {
            const existe = await this.estadoProveedorRepo.findOne({
                where: { Id_Estado_Proveedor: estado.Id_Estado_Proveedor }
            });

            if (!existe) {
                const nuevoEstado = this.estadoProveedorRepo.create(estado);
                await this.estadoProveedorRepo.save(nuevoEstado);
            }
        }
    }

    private async createDefaultEstadosQueja() {
        const estados = [
            { Id_Estado_Queja: 1, Estado_Queja: 'Pendiente' },
            { Id_Estado_Queja: 2, Estado_Queja: 'Contestado' },
            { Id_Estado_Queja: 3, Estado_Queja: 'Archivado' }
        ];

        for (const estado of estados) {
            const existe = await this.estadoQuejaRepository.findOne({
                where: { Id_Estado_Queja: estado.Id_Estado_Queja },
            });
            if (!existe) {
                const nuevo = this.estadoQuejaRepository.create(estado as any);
                await this.estadoQuejaRepository.save(nuevo);
            }
        }
    }

    private async createDefaultEstadosSugerencia() {
        const estados = [
            { Id_Estado_Sugerencia: 1, Estado_Sugerencia: 'Pendiente' },
            { Id_Estado_Sugerencia: 2, Estado_Sugerencia: 'Contestado' },
            { Id_Estado_Sugerencia: 3, Estado_Sugerencia: 'Archivado' },
            { Id_Estado_Sugerencia: 3, Estado_Sugerencia: 'Archivado' },
        ];

        for (const estado of estados) {
            const existe = await this.estadoSugerenciaRepository.findOne({
                where: { Id_Estado_Sugerencia: estado.Id_Estado_Sugerencia },
            });
            if (!existe) {
                const nuevo = this.estadoSugerenciaRepository.create(estado);
                await this.estadoSugerenciaRepository.save(nuevo);
            }
        }
    }

    private async createDefaultEstadosReporte() {
        const estados = [
            { Id_Estado_Reporte: 1, Estado_Reporte: 'Pendiente' },
            { Id_Estado_Reporte: 2, Estado_Reporte: 'Contestado' },
            { Id_Estado_Reporte: 3, Estado_Reporte: 'Archivado' }
        ];

        for (const estado of estados) {
            const existe = await this.estadoReporteRepository.findOne({
                where: { Id_Estado_Reporte: estado.Id_Estado_Reporte }
            });
            if (!existe) {
                const nuevoEstado = this.estadoReporteRepository.create(estado);
                await this.estadoReporteRepository.save(nuevoEstado);
            }
        }
    }

    // VALORES FIJOS PARA TARIFAS DEL 10/26/2025
    private async createDefaultTiposTarifaLectura() {
        const tipos = [
            { Id_Tipo_Tarifa_Lectura: 1, Nombre_Tipo_Tarifa: 'Residencial', Cargo_Fijo_Por_Mes: 3100 },
            { Id_Tipo_Tarifa_Lectura: 2, Nombre_Tipo_Tarifa: 'Comercio y Servicios', Cargo_Fijo_Por_Mes: 508 },
            { Id_Tipo_Tarifa_Lectura: 3, Nombre_Tipo_Tarifa: 'Industrial', Cargo_Fijo_Por_Mes: 536 },
            { Id_Tipo_Tarifa_Lectura: 4, Nombre_Tipo_Tarifa: 'Preferencial', Cargo_Fijo_Por_Mes: 480 },
            { Id_Tipo_Tarifa_Lectura: 5, Nombre_Tipo_Tarifa: 'Grandes Consumidores', Cargo_Fijo_Por_Mes: 513 },
            { Id_Tipo_Tarifa_Lectura: 6, Nombre_Tipo_Tarifa: 'Residencial Pobreza Basica', Cargo_Fijo_Por_Mes: 360 },
            { Id_Tipo_Tarifa_Lectura: 7, Nombre_Tipo_Tarifa: 'Residencial Pobreza Extrema', Cargo_Fijo_Por_Mes: 180 },
            { Id_Tipo_Tarifa_Lectura: 8, Nombre_Tipo_Tarifa: 'Grandes Consumidores Residenciales Bien Social', Cargo_Fijo_Por_Mes: 360 },
        ];

        for (const tipo of tipos) {
            const existe = await this.tipoTarifaLecturaRepository.findOne({
                where: { Id_Tipo_Tarifa_Lectura: tipo.Id_Tipo_Tarifa_Lectura }
            });
            if (!existe) {
                const nuevo = this.tipoTarifaLecturaRepository.create(tipo);
                await this.tipoTarifaLecturaRepository.save(nuevo);
            }
        }
    }

    private async createDefaultTiposTarifaServiciosFijos() {
        const tipos = [
            // RESIDENCIA (Tarifa 1)
            { Id_Tipo_Tarifa: 1, Minimo: 1, Maximo: 100, Nombre_Rango: '1-100', Cargo_Base: 7535 },
            { Id_Tipo_Tarifa: 1, Minimo: 101, Maximo: 300, Nombre_Rango: '101-300', Cargo_Base: 6228 },
            { Id_Tipo_Tarifa: 1, Minimo: 301, Maximo: 1000, Nombre_Rango: '301-1000', Cargo_Base: 5132 },
            { Id_Tipo_Tarifa: 1, Minimo: 1001, Maximo: 999999, Nombre_Rango: '1000+', Cargo_Base: 3772 },

            // RESIDENCIAL POBREZA BÁSICA (Tarifa 6)
            { Id_Tipo_Tarifa: 6, Minimo: 1, Maximo: 100, Nombre_Rango: '1-100', Cargo_Base: 6185 },
            { Id_Tipo_Tarifa: 6, Minimo: 101, Maximo: 300, Nombre_Rango: '101-300', Cargo_Base: 5112 },
            { Id_Tipo_Tarifa: 6, Minimo: 301, Maximo: 1000, Nombre_Rango: '301-1000', Cargo_Base: 4212 },
            { Id_Tipo_Tarifa: 6, Minimo: 1001, Maximo: 999999, Nombre_Rango: '1000+', Cargo_Base: 3096 },

            // RESIDENCIAL POBREZA EXTREMA (Tarifa 7)
            { Id_Tipo_Tarifa: 7, Minimo: 1, Maximo: 100, Nombre_Rango: '1-100', Cargo_Base: 4834 },
            { Id_Tipo_Tarifa: 7, Minimo: 101, Maximo: 300, Nombre_Rango: '101-300', Cargo_Base: 3995 },
            { Id_Tipo_Tarifa: 7, Minimo: 301, Maximo: 1000, Nombre_Rango: '301-1000', Cargo_Base: 3292 },
            { Id_Tipo_Tarifa: 7, Minimo: 1001, Maximo: 999999, Nombre_Rango: '1000+', Cargo_Base: 2420 },

            // COMERCIO Y SERVICIOS (Tarifa 2)
            { Id_Tipo_Tarifa: 2, Minimo: 1, Maximo: 100, Nombre_Rango: '1-100', Cargo_Base: 9110 },
            { Id_Tipo_Tarifa: 2, Minimo: 101, Maximo: 300, Nombre_Rango: '101-300', Cargo_Base: 5919 },
            { Id_Tipo_Tarifa: 2, Minimo: 301, Maximo: 1000, Nombre_Rango: '301-1000', Cargo_Base: 4815 },
            { Id_Tipo_Tarifa: 2, Minimo: 1001, Maximo: 999999, Nombre_Rango: '1000+', Cargo_Base: 3564 },

            // INDUSTRIAL (Tarifa 3)
            { Id_Tipo_Tarifa: 3, Minimo: 1, Maximo: 100, Nombre_Rango: '1-100', Cargo_Base: 51554 },
            { Id_Tipo_Tarifa: 3, Minimo: 101, Maximo: 300, Nombre_Rango: '101-300', Cargo_Base: 34545 },
            { Id_Tipo_Tarifa: 3, Minimo: 301, Maximo: 1000, Nombre_Rango: '301-1000', Cargo_Base: 27771 },
            { Id_Tipo_Tarifa: 3, Minimo: 1001, Maximo: 999999, Nombre_Rango: '1000+', Cargo_Base: 20327 },

            // PREFERENCIAL (Tarifa 4)
            { Id_Tipo_Tarifa: 4, Minimo: 1, Maximo: 100, Nombre_Rango: '1-100', Cargo_Base: 49405 },
            { Id_Tipo_Tarifa: 4, Minimo: 101, Maximo: 300, Nombre_Rango: '101-300', Cargo_Base: 32145 },
            { Id_Tipo_Tarifa: 4, Minimo: 301, Maximo: 1000, Nombre_Rango: '301-1000', Cargo_Base: 26488 },
            { Id_Tipo_Tarifa: 4, Minimo: 1001, Maximo: 999999, Nombre_Rango: '1000+', Cargo_Base: 19469 },

            // GRANDES CONSUMIDORES (Tarifa 5)
            { Id_Tipo_Tarifa: 5, Minimo: 1, Maximo: 100, Nombre_Rango: '1-100', Cargo_Base: 384754 },
            { Id_Tipo_Tarifa: 5, Minimo: 101, Maximo: 300, Nombre_Rango: '101-300', Cargo_Base: 251052 },
            { Id_Tipo_Tarifa: 5, Minimo: 301, Maximo: 1000, Nombre_Rango: '301-1000', Cargo_Base: 203833 },
            { Id_Tipo_Tarifa: 5, Minimo: 1001, Maximo: 999999, Nombre_Rango: '1000+', Cargo_Base: 151001 },

            // GC BIEN SOCIAL (Tarifa 8)
            { Id_Tipo_Tarifa: 8, Minimo: 1, Maximo: 100, Nombre_Rango: '1-100', Cargo_Base: 305518 },
            { Id_Tipo_Tarifa: 8, Minimo: 101, Maximo: 300, Nombre_Rango: '101-300', Cargo_Base: 199763 },
            { Id_Tipo_Tarifa: 8, Minimo: 301, Maximo: 1000, Nombre_Rango: '301-1000', Cargo_Base: 163616 },
            { Id_Tipo_Tarifa: 8, Minimo: 1001, Maximo: 999999, Nombre_Rango: '1000+', Cargo_Base: 120598 },
        ];

        for (const tipo of tipos) {
            const existe = await this.tipoTarifaServiciosFijosRepository.findOne({
                where: {
                    Tipo_Tarifa: { Id_Tipo_Tarifa_Lectura: tipo.Id_Tipo_Tarifa },
                    Minimo_Afiliados: tipo.Minimo,
                }
            });
            if (!existe) {
                const nuevo = this.tipoTarifaServiciosFijosRepository.create({
                    Tipo_Tarifa: { Id_Tipo_Tarifa_Lectura: tipo.Id_Tipo_Tarifa },
                    Minimo_Afiliados: tipo.Minimo,
                    Maximo_Afiliados: tipo.Maximo,
                    Nombre_Rango: tipo.Nombre_Rango,
                    Cargo_Base: tipo.Cargo_Base,
                });
                await this.tipoTarifaServiciosFijosRepository.save(nuevo);
            }
        }
        console.log('✅ Servicios Fijos creados (32 registros según rangos de afiliados)');
    }

    private async createDefaultTiposTarifaVentaAgua() {
        const tipos = [
            // CONDUCCIÓN por rango de afiliados
            { Nombre: 'Conducción', Minimo: 1, Maximo: 100, Rango: '1-100', Cargo_Por_M3: 159 },
            { Nombre: 'Conducción', Minimo: 101, Maximo: 300, Rango: '101-300', Cargo_Por_M3: 122 },
            { Nombre: 'Conducción', Minimo: 301, Maximo: 1000, Rango: '301-1000', Cargo_Por_M3: 101 },
            { Nombre: 'Conducción', Minimo: 1001, Maximo: 999999, Rango: '1000+', Cargo_Por_M3: 74 },

            // POTABILIZACIÓN por rango de afiliados
            { Nombre: 'Potabilización', Minimo: 1, Maximo: 100, Rango: '1-100', Cargo_Por_M3: 48 },
            { Nombre: 'Potabilización', Minimo: 101, Maximo: 300, Rango: '101-300', Cargo_Por_M3: 37 },
            { Nombre: 'Potabilización', Minimo: 301, Maximo: 1000, Rango: '301-1000', Cargo_Por_M3: 30 },
            { Nombre: 'Potabilización', Minimo: 1001, Maximo: 999999, Rango: '1000+', Cargo_Por_M3: 22 },

            // DISTRIBUCIÓN por rango de afiliados
            { Nombre: 'Distribución', Minimo: 1, Maximo: 100, Rango: '1-100', Cargo_Por_M3: 238 },
            { Nombre: 'Distribución', Minimo: 101, Maximo: 300, Rango: '101-300', Cargo_Por_M3: 183 },
            { Nombre: 'Distribución', Minimo: 301, Maximo: 1000, Rango: '301-1000', Cargo_Por_M3: 151 },
            { Nombre: 'Distribución', Minimo: 1001, Maximo: 999999, Rango: '1000+', Cargo_Por_M3: 111 },
        ];

        for (const tipo of tipos) {
            const existe = await this.tipoTarifaVentaAguaRepository.findOne({
                where: {
                    Nombre_Tipo_Tarifa: tipo.Nombre,
                    Minimo_Afiliados: tipo.Minimo,
                }
            });
            if (!existe) {
                const nuevo = this.tipoTarifaVentaAguaRepository.create({
                    Nombre_Tipo_Tarifa: tipo.Nombre,
                    Minimo_Afiliados: tipo.Minimo,
                    Maximo_Afiliados: tipo.Maximo,
                    Nombre_Rango: tipo.Rango,
                    Cargo_Por_M3: tipo.Cargo_Por_M3,
                });
                await this.tipoTarifaVentaAguaRepository.save(nuevo);
            }
        }
    }

    private async createRangosAfiliados() {
        const rangos = [
            // ==================== RESIDENCIAL (Tarifa 1) ====================
            { Id_Tipo_Tarifa: 1, Minimo: 1, Maximo: 100, Nombre: '1-100', Costo_Por_M3: 360 },
            { Id_Tipo_Tarifa: 1, Minimo: 101, Maximo: 300, Nombre: '101-300', Costo_Por_M3: 298 },
            { Id_Tipo_Tarifa: 1, Minimo: 301, Maximo: 1000, Nombre: '301-1000', Costo_Por_M3: 245 },
            { Id_Tipo_Tarifa: 1, Minimo: 1001, Maximo: 999999, Nombre: '1000+', Costo_Por_M3: 180 },

            // ==================== COMERCIO Y SERVICIOS (Tarifa 2) ====================
            { Id_Tipo_Tarifa: 2, Minimo: 1, Maximo: 100, Nombre: '1-100', Costo_Por_M3: 508 },
            { Id_Tipo_Tarifa: 2, Minimo: 101, Maximo: 300, Nombre: '101-300', Costo_Por_M3: 330 },
            { Id_Tipo_Tarifa: 2, Minimo: 301, Maximo: 1000, Nombre: '301-1000', Costo_Por_M3: 269 },
            { Id_Tipo_Tarifa: 2, Minimo: 1001, Maximo: 999999, Nombre: '1000+', Costo_Por_M3: 199 },

            // ==================== INDUSTRIAL (Tarifa 3) ====================
            { Id_Tipo_Tarifa: 3, Minimo: 1, Maximo: 100, Nombre: '1-100', Costo_Por_M3: 536 },
            { Id_Tipo_Tarifa: 3, Minimo: 101, Maximo: 300, Nombre: '101-300', Costo_Por_M3: 359 },
            { Id_Tipo_Tarifa: 3, Minimo: 301, Maximo: 1000, Nombre: '301-1000', Costo_Por_M3: 289 },
            { Id_Tipo_Tarifa: 3, Minimo: 1001, Maximo: 999999, Nombre: '1000+', Costo_Por_M3: 211 },

            // ==================== PREFERENCIAL (Tarifa 4) ====================
            { Id_Tipo_Tarifa: 4, Minimo: 1, Maximo: 100, Nombre: '1-100', Costo_Por_M3: 480 },
            { Id_Tipo_Tarifa: 4, Minimo: 101, Maximo: 300, Nombre: '101-300', Costo_Por_M3: 313 },
            { Id_Tipo_Tarifa: 4, Minimo: 301, Maximo: 1000, Nombre: '301-1000', Costo_Por_M3: 258 },
            { Id_Tipo_Tarifa: 4, Minimo: 1001, Maximo: 999999, Nombre: '1000+', Costo_Por_M3: 189 },

            // ==================== GRANDES CONSUMIDORES (Tarifa 5) ====================
            { Id_Tipo_Tarifa: 5, Minimo: 1, Maximo: 100, Nombre: '1-100', Costo_Por_M3: 513 },
            { Id_Tipo_Tarifa: 5, Minimo: 101, Maximo: 300, Nombre: '101-300', Costo_Por_M3: 333 },
            { Id_Tipo_Tarifa: 5, Minimo: 301, Maximo: 1000, Nombre: '301-1000', Costo_Por_M3: 271 },
            { Id_Tipo_Tarifa: 5, Minimo: 1001, Maximo: 999999, Nombre: '1000+', Costo_Por_M3: 201 },

            // ==================== RESIDENCIAL POBREZA BÁSICA (Tarifa 6) ====================
            { Id_Tipo_Tarifa: 6, Minimo: 1, Maximo: 100, Nombre: '1-100', Costo_Por_M3: 360 },
            { Id_Tipo_Tarifa: 6, Minimo: 101, Maximo: 300, Nombre: '101-300', Costo_Por_M3: 298 },
            { Id_Tipo_Tarifa: 6, Minimo: 301, Maximo: 1000, Nombre: '301-1000', Costo_Por_M3: 245 },
            { Id_Tipo_Tarifa: 6, Minimo: 1001, Maximo: 999999, Nombre: '1000+', Costo_Por_M3: 180 },

            // ==================== RESIDENCIAL POBREZA EXTREMA (Tarifa 7) ====================
            { Id_Tipo_Tarifa: 7, Minimo: 1, Maximo: 100, Nombre: '1-100', Costo_Por_M3: 180 },
            { Id_Tipo_Tarifa: 7, Minimo: 101, Maximo: 300, Nombre: '101-300', Costo_Por_M3: 149 },
            { Id_Tipo_Tarifa: 7, Minimo: 301, Maximo: 1000, Nombre: '301-1000', Costo_Por_M3: 123 },
            { Id_Tipo_Tarifa: 7, Minimo: 1001, Maximo: 999999, Nombre: '1000+', Costo_Por_M3: 90 },

            // ==================== GC BIEN SOCIAL (Tarifa 8) ====================
            { Id_Tipo_Tarifa: 8, Minimo: 1, Maximo: 100, Nombre: '1-100', Costo_Por_M3: 360 },
            { Id_Tipo_Tarifa: 8, Minimo: 101, Maximo: 300, Nombre: '101-300', Costo_Por_M3: 234 },
            { Id_Tipo_Tarifa: 8, Minimo: 301, Maximo: 1000, Nombre: '301-1000', Costo_Por_M3: 193 },
            { Id_Tipo_Tarifa: 8, Minimo: 1001, Maximo: 999999, Nombre: '1000+', Costo_Por_M3: 142 },
        ];

        for (const rango of rangos) {
            const existe = await this.rangoAfiliadosRepository.findOne({
                where: {
                    Tipo_Tarifa: { Id_Tipo_Tarifa_Lectura: rango.Id_Tipo_Tarifa },
                    Minimo_Afiliados: rango.Minimo,
                }
            });

            if (!existe) {
                const nuevo = this.rangoAfiliadosRepository.create({
                    Tipo_Tarifa: { Id_Tipo_Tarifa_Lectura: rango.Id_Tipo_Tarifa },
                    Minimo_Afiliados: rango.Minimo,
                    Maximo_Afiliados: rango.Maximo,
                    Nombre_Rango: rango.Nombre,
                    Costo_Por_M3: rango.Costo_Por_M3,
                });
                await this.rangoAfiliadosRepository.save(nuevo);
            }
        }
    }

    private async createRangosConsumo() {
        const rangos = [
            // ==================== RESIDENCIAL (Tarifa 1) - 4 bloques ====================
            { Id_Tipo_Tarifa: 1, Minimo_M3: 0, Maximo_M3: 15, Costo_Por_M3: 360 },
            { Id_Tipo_Tarifa: 1, Minimo_M3: 16, Maximo_M3: 30, Costo_Por_M3: 416 },
            { Id_Tipo_Tarifa: 1, Minimo_M3: 31, Maximo_M3: 60, Costo_Por_M3: 486 },
            { Id_Tipo_Tarifa: 1, Minimo_M3: 61, Maximo_M3: 999999, Costo_Por_M3: 540 },

            // ==================== COMERCIO Y SERVICIOS (Tarifa 2) - 3 bloques ====================
            { Id_Tipo_Tarifa: 2, Minimo_M3: 0, Maximo_M3: 20, Costo_Por_M3: 508 },
            { Id_Tipo_Tarifa: 2, Minimo_M3: 21, Maximo_M3: 65, Costo_Por_M3: 582 },
            { Id_Tipo_Tarifa: 2, Minimo_M3: 66, Maximo_M3: 999999, Costo_Por_M3: 762 },

            // ==================== INDUSTRIAL (Tarifa 3) - 2 bloques ====================
            { Id_Tipo_Tarifa: 3, Minimo_M3: 0, Maximo_M3: 120, Costo_Por_M3: 536 },
            { Id_Tipo_Tarifa: 3, Minimo_M3: 121, Maximo_M3: 999999, Costo_Por_M3: 832 },

            // ==================== PREFERENCIAL (Tarifa 4) - 2 bloques ====================
            { Id_Tipo_Tarifa: 4, Minimo_M3: 0, Maximo_M3: 120, Costo_Por_M3: 480 },
            { Id_Tipo_Tarifa: 4, Minimo_M3: 121, Maximo_M3: 999999, Costo_Por_M3: 709 },

            // ==================== GRANDES CONSUMIDORES (Tarifa 5) - 3 bloques ====================
            { Id_Tipo_Tarifa: 5, Minimo_M3: 0, Maximo_M3: 2500, Costo_Por_M3: 513 },
            { Id_Tipo_Tarifa: 5, Minimo_M3: 2501, Maximo_M3: 6000, Costo_Por_M3: 663 },
            { Id_Tipo_Tarifa: 5, Minimo_M3: 6001, Maximo_M3: 999999, Costo_Por_M3: 787 },

            // ==================== RESIDENCIAL POBREZA BÁSICA (Tarifa 6) - 4 bloques ====================
            { Id_Tipo_Tarifa: 6, Minimo_M3: 0, Maximo_M3: 15, Costo_Por_M3: 360 },
            { Id_Tipo_Tarifa: 6, Minimo_M3: 16, Maximo_M3: 30, Costo_Por_M3: 416 },
            { Id_Tipo_Tarifa: 6, Minimo_M3: 31, Maximo_M3: 60, Costo_Por_M3: 486 },
            { Id_Tipo_Tarifa: 6, Minimo_M3: 61, Maximo_M3: 999999, Costo_Por_M3: 540 },

            // ==================== RESIDENCIAL POBREZA EXTREMA (Tarifa 7) - 4 bloques ====================
            { Id_Tipo_Tarifa: 7, Minimo_M3: 0, Maximo_M3: 15, Costo_Por_M3: 180 },
            { Id_Tipo_Tarifa: 7, Minimo_M3: 16, Maximo_M3: 30, Costo_Por_M3: 416 },
            { Id_Tipo_Tarifa: 7, Minimo_M3: 31, Maximo_M3: 60, Costo_Por_M3: 486 },
            { Id_Tipo_Tarifa: 7, Minimo_M3: 61, Maximo_M3: 999999, Costo_Por_M3: 540 },

            // ==================== GC BIEN SOCIAL (Tarifa 8) - 3 bloques ====================
            { Id_Tipo_Tarifa: 8, Minimo_M3: 0, Maximo_M3: 2500, Costo_Por_M3: 360 },
            { Id_Tipo_Tarifa: 8, Minimo_M3: 2501, Maximo_M3: 6000, Costo_Por_M3: 663 },
            { Id_Tipo_Tarifa: 8, Minimo_M3: 6001, Maximo_M3: 999999, Costo_Por_M3: 787 },
        ];

        for (const rango of rangos) {
            const existe = await this.rangoConsumoRepository.findOne({
                where: {
                    Tipo_Tarifa: { Id_Tipo_Tarifa_Lectura: rango.Id_Tipo_Tarifa },
                    Minimo_M3: rango.Minimo_M3,
                }
            });

            if (!existe) {
                const nuevo = this.rangoConsumoRepository.create({
                    Tipo_Tarifa: { Id_Tipo_Tarifa_Lectura: rango.Id_Tipo_Tarifa },
                    Minimo_M3: rango.Minimo_M3,
                    Maximo_M3: rango.Maximo_M3,
                    Costo_Por_M3: rango.Costo_Por_M3,
                });
                await this.rangoConsumoRepository.save(nuevo);
            }
        }
    }

    private async createPermisos() {
        const modulos = [
            'usuarios',
            'actas',
            'contacto',
            'faq',
            'imagenes',
            'proyectos',
            'abonados',
            'inventario',
            'proveedores',
            'solicitudes',
            'manuales',
            'calidadAgua'
        ];

        for (const modulo of modulos) {
            // Permiso de solo lectura
            await this.createPermisoIfNotExists({
                Modulo: modulo,
                Ver: true,
                Editar: false,
            });

            // Sin permisos
            await this.createPermisoIfNotExists({
                Modulo: modulo,
                Ver: false,
                Editar: false,
            });

            // Permiso completo (ver y editar)
            await this.createPermisoIfNotExists({
                Modulo: modulo,
                Ver: true,
                Editar: true,
            });

            // Permiso de lectura para auditoria
            await this.createPermisoIfNotExists({
                Modulo: 'auditoria',
                Ver: true,
                Editar: false,
            });

            // Sin permisos para auditoria
            await this.createPermisoIfNotExists({
                Modulo: 'auditoria',
                Ver: false,
                Editar: false,
            });
        }
    }

    private async createPermisoIfNotExists(permisoData: {
        Modulo: string;
        Ver: boolean;
        Editar: boolean;
    }) {
        const permisoExistente = await this.permisoRepository.findOne({
            where: {
                Modulo: permisoData.Modulo,
                Ver: permisoData.Ver,
                Editar: permisoData.Editar
            }
        });

        if (!permisoExistente) {
            const permiso = this.permisoRepository.create(permisoData);
            await this.permisoRepository.save(permiso);
        }
    }

    private async createAdminRole() {
        const adminRoleExistente = await this.rolRepository.findOne({
            where: { Nombre_Rol: 'Administrador' }
        });

        if (!adminRoleExistente) {
            const adminRole = this.rolRepository.create({
                Nombre_Rol: 'Administrador',
            });
            await this.rolRepository.save(adminRole);
        }
    }

    // Asignar todos los permisos al rol Administrador
    private async assignPermisosToAdminRole() {

        // Buscar el rol Administrador con sus permisos actuales
        const adminRole = await this.rolRepository.findOne({
            where: { Nombre_Rol: 'Administrador' },
            relations: ['Permisos']
        });

        if (!adminRole) {
            return;
        }

        // Obtener todos los permisos disponibles
        const todosLosPermisos = await this.permisoRepository.find({
            where: [
                { Ver: true, Editar: true },
                { Modulo: 'auditoria', Ver: true, Editar: false }
            ]
        });

        // Verificar si ya tiene permisos asignados
        if (adminRole.Permisos && adminRole.Permisos.length > 0) {
            // Verificar si tiene TODOS los permisos
            if (adminRole.Permisos.length === todosLosPermisos.length) {
                return;
            }
        }

        // Asignar los permisos al rol Administrador
        adminRole.Permisos = todosLosPermisos;
        await this.rolRepository.save(adminRole);
    }

    private async createAdminUser() {
        const adminExistente = await this.userRepository.findOne({
            where: { Nombre_Usuario: 'admin' }
        });

        if (!adminExistente) {
            // Buscar rol de Administrador
            const adminRole = await this.rolRepository.findOne({
                where: { Nombre_Rol: 'Administrador' }
            });

            if (adminRole) {
                const hashedPassword = await bcrypt.hash('Admin123', 10);

                const adminUser = this.userRepository.create({
                    Nombre_Usuario: 'admin',
                    Correo_Electronico: 'admin@saga.com',
                    Contraseña: hashedPassword,
                    Id_Rol: adminRole.Id_Rol
                });

                await this.userRepository.save(adminUser);
            }
        }
    }
}