import { Bloque } from './../Modules/Lecturas/LecturaEntities/Bloque.Entity';
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
import { EstadoReporte } from 'src/Modules/Reportes/ReporteEntities/EstadoReporte';
import { EstadoSugerencia } from 'src/Modules/Sugerencias/SugerenciaEntities/EstadoSugerencia';
import { EstadoQueja } from 'src/Modules/Quejas/QuejaEntities/EstadoQueja';
import { EstadoMedidor } from 'src/Modules/Inventario/InventarioEntities/EstadoMedidor.Entity';
import { TipoTarifaLectura } from 'src/Modules/Lecturas/LecturaEntities/TipoTarifaLectura.Entity';
import { TipoTarifaServiciosFijos } from 'src/Modules/Lecturas/LecturaEntities/TipoTarifaServiciosFijos.Entity';
import { TipoTarifaVentaAgua } from 'src/Modules/Lecturas/LecturaEntities/TipoTarifaVentaAgua.Entity';

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

        @InjectRepository(Bloque)
        private readonly bloqueRepository: Repository<Bloque>,
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
            await this.createCostosPorBloque();
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
            { Id_Estado_Solicitud: 2, Nombre_Estado: 'En Revisión' },
            { Id_Estado_Solicitud: 3, Nombre_Estado: 'Aprobada' },
            //{ Id_Estado_Solicitud: 3, Nombre_Estado: 'En espera' },
            //{ Id_Estado_Solicitud: 4, Nombre_Estado: 'Completada' },
            //{ Id_Estado_Solicitud: 5, Nombre_Estado: 'Rechazada' },
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
            { Id_Tipo_Tarifa_Lectura: 1, Nombre_Tipo_Tarifa: 'Residencial', Cargo_Fijo_Por_Mes: 360 },
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

    // VALORES FIJOS PARA TARIFAS DEL 10/26/2025
    private async createDefaultTiposTarifaServiciosFijos() {
        const tipos = [
            { Id_Tipo_Tarifa_Servicios_Fijos: 1, Nombre_Tipo_Tarifa: 'Residencial', Cargo_Base: 7535 },
            { Id_Tipo_Tarifa_Servicios_Fijos: 2, Nombre_Tipo_Tarifa: 'Residencial Pobreza Basica', Cargo_Base: 6185 },
            { Id_Tipo_Tarifa_Servicios_Fijos: 3, Nombre_Tipo_Tarifa: 'Residencial Pobreza Extrema', Cargo_Base: 4834 },
            { Id_Tipo_Tarifa_Servicios_Fijos: 4, Nombre_Tipo_Tarifa: 'Comercio y Servicios', Cargo_Base: 9110 },
            { Id_Tipo_Tarifa_Servicios_Fijos: 5, Nombre_Tipo_Tarifa: 'Industrial', Cargo_Base: 51554 },
            { Id_Tipo_Tarifa_Servicios_Fijos: 6, Nombre_Tipo_Tarifa: 'Preferencial', Cargo_Base: 49405 },
            { Id_Tipo_Tarifa_Servicios_Fijos: 7, Nombre_Tipo_Tarifa: 'Grandes Consumidores', Cargo_Base: 384754 },
            { Id_Tipo_Tarifa_Servicios_Fijos: 8, Nombre_Tipo_Tarifa: 'GC Bien Social', Cargo_Base: 305518 },
        ];

        for (const tipo of tipos) {
            const existe = await this.tipoTarifaServiciosFijosRepository.findOne({
                where: { Id_Tipo_Tarifa_Servicios_Fijos: tipo.Id_Tipo_Tarifa_Servicios_Fijos }
            });
            if (!existe) {
                const nuevo = this.tipoTarifaServiciosFijosRepository.create(tipo);
                await this.tipoTarifaServiciosFijosRepository.save(nuevo);
            }
        }
    }

    // VALORES FIJOS PARA TARIFAS DEL 10/26/2025
    private async createDefaultTiposTarifaVentaAgua() {
        const tipos = [
            { Id_Tipo_Tarifa_Venta_Agua: 1, Nombre_Tipo_Tarifa: 'Conducción', Cargo_Por_M3: 159 },
            { Id_Tipo_Tarifa_Venta_Agua: 2, Nombre_Tipo_Tarifa: 'Potabilización', Cargo_Por_M3: 48 },
            { Id_Tipo_Tarifa_Venta_Agua: 3, Nombre_Tipo_Tarifa: 'Distribución', Cargo_Por_M3: 238 },
        ];

        for (const tipo of tipos) {
            const existe = await this.tipoTarifaVentaAguaRepository.findOne({
                where: { Id_Tipo_Tarifa_Venta_Agua: tipo.Id_Tipo_Tarifa_Venta_Agua }
            });
            if (!existe) {
                const nuevo = this.tipoTarifaVentaAguaRepository.create(tipo);
                await this.tipoTarifaVentaAguaRepository.save(nuevo);
            }
        }
    }

    // VALORES FIJOS PARA COSTOS POR BLOQUE DEL 10/26/2025
    private async createCostosPorBloque() {
        const costos = [
            // Residencial bloque 1
            { Id_Bloque: 1, Id_Tipo_Tarifa: 1, Minimo_M3: 0, Maximo_M3: 15, Cargo_Base: 360 },
            { Id_Bloque: 2, Id_Tipo_Tarifa: 1, Minimo_M3: 0, Maximo_M3: 15, Cargo_Base: 298 },
            { Id_Bloque: 3, Id_Tipo_Tarifa: 1, Minimo_M3: 0, Maximo_M3: 15, Cargo_Base: 245 },
            { Id_Bloque: 4, Id_Tipo_Tarifa: 1, Minimo_M3: 0, Maximo_M3: 15, Cargo_Base: 180 },

            // Residencial bloque 2
            { Id_Bloque: 5, Id_Tipo_Tarifa: 1, Minimo_M3: 16, Maximo_M3: 30, Cargo_Base: 416 },
            { Id_Bloque: 6, Id_Tipo_Tarifa: 1, Minimo_M3: 16, Maximo_M3: 30, Cargo_Base: 344 },
            { Id_Bloque: 7, Id_Tipo_Tarifa: 1, Minimo_M3: 16, Maximo_M3: 30, Cargo_Base: 283 },
            { Id_Bloque: 8, Id_Tipo_Tarifa: 1, Minimo_M3: 16, Maximo_M3: 30, Cargo_Base: 208 },

            // Residencial bloque 3
            { Id_Bloque: 9, Id_Tipo_Tarifa: 1, Minimo_M3: 31, Maximo_M3: 60, Cargo_Base: 486 },
            { Id_Bloque: 10, Id_Tipo_Tarifa: 1, Minimo_M3: 31, Maximo_M3: 60, Cargo_Base: 402 },
            { Id_Bloque: 11, Id_Tipo_Tarifa: 1, Minimo_M3: 31, Maximo_M3: 60, Cargo_Base: 331 },
            { Id_Bloque: 12, Id_Tipo_Tarifa: 1, Minimo_M3: 31, Maximo_M3: 60, Cargo_Base: 243 },

            // Residencial bloque 4
            { Id_Bloque: 13, Id_Tipo_Tarifa: 1, Minimo_M3: 61, Maximo_M3: 1000000, Cargo_Base: 540 },
            { Id_Bloque: 14, Id_Tipo_Tarifa: 1, Minimo_M3: 61, Maximo_M3: 1000000, Cargo_Base: 447 },
            { Id_Bloque: 15, Id_Tipo_Tarifa: 1, Minimo_M3: 61, Maximo_M3: 1000000, Cargo_Base: 368 },
            { Id_Bloque: 16, Id_Tipo_Tarifa: 1, Minimo_M3: 61, Maximo_M3: 1000000, Cargo_Base: 270 },



            // Comercial bloque 1
            { Id_Bloque: 17, Id_Tipo_Tarifa: 2, Minimo_M3: 0, Maximo_M3: 20, Cargo_Base: 508 },
            { Id_Bloque: 18, Id_Tipo_Tarifa: 2, Minimo_M3: 0, Maximo_M3: 20, Cargo_Base: 330 },
            { Id_Bloque: 19, Id_Tipo_Tarifa: 2, Minimo_M3: 0, Maximo_M3: 20, Cargo_Base: 269 },
            { Id_Bloque: 20, Id_Tipo_Tarifa: 2, Minimo_M3: 0, Maximo_M3: 20, Cargo_Base: 199 },

            // Comercial bloque 2
            { Id_Bloque: 21, Id_Tipo_Tarifa: 2, Minimo_M3: 21, Maximo_M3: 65, Cargo_Base: 582 },
            { Id_Bloque: 22, Id_Tipo_Tarifa: 2, Minimo_M3: 21, Maximo_M3: 65, Cargo_Base: 388 },
            { Id_Bloque: 23, Id_Tipo_Tarifa: 2, Minimo_M3: 21, Maximo_M3: 65, Cargo_Base: 315 },
            { Id_Bloque: 24, Id_Tipo_Tarifa: 2, Minimo_M3: 21, Maximo_M3: 65, Cargo_Base: 236 },

            // Comercial bloque 3
            { Id_Bloque: 25, Id_Tipo_Tarifa: 2, Minimo_M3: 66, Maximo_M3: 1000000, Cargo_Base: 762 },
            { Id_Bloque: 26, Id_Tipo_Tarifa: 2, Minimo_M3: 66, Maximo_M3: 1000000, Cargo_Base: 506 },
            { Id_Bloque: 27, Id_Tipo_Tarifa: 2, Minimo_M3: 66, Maximo_M3: 1000000, Cargo_Base: 410 },
            { Id_Bloque: 28, Id_Tipo_Tarifa: 2, Minimo_M3: 66, Maximo_M3: 1000000, Cargo_Base: 302 },



            // Industrial bloque 1
            { Id_Bloque: 29, Id_Tipo_Tarifa: 3, Minimo_M3: 0, Maximo_M3: 120, Cargo_Base: 536 },
            { Id_Bloque: 30, Id_Tipo_Tarifa: 3, Minimo_M3: 0, Maximo_M3: 120, Cargo_Base: 359 },
            { Id_Bloque: 31, Id_Tipo_Tarifa: 3, Minimo_M3: 0, Maximo_M3: 120, Cargo_Base: 289 },
            { Id_Bloque: 32, Id_Tipo_Tarifa: 3, Minimo_M3: 0, Maximo_M3: 120, Cargo_Base: 211 },

            // Industrial bloque 2
            { Id_Bloque: 33, Id_Tipo_Tarifa: 3, Minimo_M3: 121, Maximo_M3: 1000000, Cargo_Base: 832 },
            { Id_Bloque: 34, Id_Tipo_Tarifa: 3, Minimo_M3: 121, Maximo_M3: 1000000, Cargo_Base: 548 },
            { Id_Bloque: 35, Id_Tipo_Tarifa: 3, Minimo_M3: 121, Maximo_M3: 1000000, Cargo_Base: 447 },
            { Id_Bloque: 36, Id_Tipo_Tarifa: 3, Minimo_M3: 121, Maximo_M3: 1000000, Cargo_Base: 328 },



            // Preferencial bloque 1
            { Id_Bloque: 37, Id_Tipo_Tarifa: 4, Minimo_M3: 0, Maximo_M3: 120, Cargo_Base: 480 },
            { Id_Bloque: 38, Id_Tipo_Tarifa: 4, Minimo_M3: 0, Maximo_M3: 120, Cargo_Base: 313 },
            { Id_Bloque: 39, Id_Tipo_Tarifa: 4, Minimo_M3: 0, Maximo_M3: 120, Cargo_Base: 258 },
            { Id_Bloque: 40, Id_Tipo_Tarifa: 4, Minimo_M3: 0, Maximo_M3: 120, Cargo_Base: 189 },

            // Preferencial bloque 2
            { Id_Bloque: 41, Id_Tipo_Tarifa: 4, Minimo_M3: 121, Maximo_M3: 1000000, Cargo_Base: 709 },
            { Id_Bloque: 42, Id_Tipo_Tarifa: 4, Minimo_M3: 121, Maximo_M3: 1000000, Cargo_Base: 461 },
            { Id_Bloque: 43, Id_Tipo_Tarifa: 4, Minimo_M3: 121, Maximo_M3: 1000000, Cargo_Base: 380 },
            { Id_Bloque: 44, Id_Tipo_Tarifa: 4, Minimo_M3: 121, Maximo_M3: 1000000, Cargo_Base: 279 },



            // Grandes Consumidores bloque 1
            { Id_Bloque: 45, Id_Tipo_Tarifa: 5, Minimo_M3: 0, Maximo_M3: 2500, Cargo_Base: 513 },
            { Id_Bloque: 46, Id_Tipo_Tarifa: 5, Minimo_M3: 0, Maximo_M3: 2500, Cargo_Base: 333 },
            { Id_Bloque: 47, Id_Tipo_Tarifa: 5, Minimo_M3: 0, Maximo_M3: 2500, Cargo_Base: 271 },
            { Id_Bloque: 48, Id_Tipo_Tarifa: 5, Minimo_M3: 0, Maximo_M3: 2500, Cargo_Base: 201 },

            // Grandes Consumidores bloque 2
            { Id_Bloque: 49, Id_Tipo_Tarifa: 5, Minimo_M3: 2501, Maximo_M3: 6000, Cargo_Base: 663 },
            { Id_Bloque: 50, Id_Tipo_Tarifa: 5, Minimo_M3: 2501, Maximo_M3: 6000, Cargo_Base: 437 },
            { Id_Bloque: 51, Id_Tipo_Tarifa: 5, Minimo_M3: 2501, Maximo_M3: 6000, Cargo_Base: 355 },
            { Id_Bloque: 52, Id_Tipo_Tarifa: 5, Minimo_M3: 2501, Maximo_M3: 6000, Cargo_Base: 263 },

            // Grandes Consumidores bloque 3
            { Id_Bloque: 53, Id_Tipo_Tarifa: 5, Minimo_M3: 6001, Maximo_M3: 1000000, Cargo_Base: 787 },
            { Id_Bloque: 54, Id_Tipo_Tarifa: 5, Minimo_M3: 6001, Maximo_M3: 1000000, Cargo_Base: 522 },
            { Id_Bloque: 55, Id_Tipo_Tarifa: 5, Minimo_M3: 6001, Maximo_M3: 1000000, Cargo_Base: 423 },
            { Id_Bloque: 56, Id_Tipo_Tarifa: 5, Minimo_M3: 6001, Maximo_M3: 1000000, Cargo_Base: 313 },



            // Residencial Pobreza Basica bloque 1
            { Id_Bloque: 57, Id_Tipo_Tarifa: 6, Minimo_M3: 0, Maximo_M3: 15, Cargo_Base: 360 },
            { Id_Bloque: 58, Id_Tipo_Tarifa: 6, Minimo_M3: 0, Maximo_M3: 15, Cargo_Base: 298 },
            { Id_Bloque: 59, Id_Tipo_Tarifa: 6, Minimo_M3: 0, Maximo_M3: 15, Cargo_Base: 245 },
            { Id_Bloque: 60, Id_Tipo_Tarifa: 6, Minimo_M3: 0, Maximo_M3: 15, Cargo_Base: 180 },

            // Residencial Pobreza Basica bloque 2
            { Id_Bloque: 61, Id_Tipo_Tarifa: 6, Minimo_M3: 16, Maximo_M3: 30, Cargo_Base: 416 },
            { Id_Bloque: 62, Id_Tipo_Tarifa: 6, Minimo_M3: 16, Maximo_M3: 30, Cargo_Base: 344 },
            { Id_Bloque: 63, Id_Tipo_Tarifa: 6, Minimo_M3: 16, Maximo_M3: 30, Cargo_Base: 283 },
            { Id_Bloque: 64, Id_Tipo_Tarifa: 6, Minimo_M3: 16, Maximo_M3: 30, Cargo_Base: 208 },

            // Residencial Pobreza Basica bloque 3
            { Id_Bloque: 65, Id_Tipo_Tarifa: 6, Minimo_M3: 31, Maximo_M3: 60, Cargo_Base: 486 },
            { Id_Bloque: 66, Id_Tipo_Tarifa: 6, Minimo_M3: 31, Maximo_M3: 60, Cargo_Base: 402 },
            { Id_Bloque: 67, Id_Tipo_Tarifa: 6, Minimo_M3: 31, Maximo_M3: 60, Cargo_Base: 331 },
            { Id_Bloque: 68, Id_Tipo_Tarifa: 6, Minimo_M3: 31, Maximo_M3: 60, Cargo_Base: 243 },

            // Residencial Pobreza Basica bloque 4
            { Id_Bloque: 69, Id_Tipo_Tarifa: 6, Minimo_M3: 61, Maximo_M3: 1000000, Cargo_Base: 540 },
            { Id_Bloque: 70, Id_Tipo_Tarifa: 6, Minimo_M3: 61, Maximo_M3: 1000000, Cargo_Base: 447 },
            { Id_Bloque: 71, Id_Tipo_Tarifa: 6, Minimo_M3: 61, Maximo_M3: 1000000, Cargo_Base: 368 },
            { Id_Bloque: 72, Id_Tipo_Tarifa: 6, Minimo_M3: 61, Maximo_M3: 1000000, Cargo_Base: 270 },



            // Residencial Pobreza Extrema bloque 1
            { Id_Bloque: 73, Id_Tipo_Tarifa: 7, Minimo_M3: 0, Maximo_M3: 15, Cargo_Base: 180 },
            { Id_Bloque: 74, Id_Tipo_Tarifa: 7, Minimo_M3: 0, Maximo_M3: 15, Cargo_Base: 149 },
            { Id_Bloque: 75, Id_Tipo_Tarifa: 7, Minimo_M3: 0, Maximo_M3: 15, Cargo_Base: 123 },
            { Id_Bloque: 76, Id_Tipo_Tarifa: 7, Minimo_M3: 0, Maximo_M3: 15, Cargo_Base: 90 },

            // Residencial Pobreza Extrema bloque 2
            { Id_Bloque: 77, Id_Tipo_Tarifa: 7, Minimo_M3: 16, Maximo_M3: 30, Cargo_Base: 416 },
            { Id_Bloque: 78, Id_Tipo_Tarifa: 7, Minimo_M3: 16, Maximo_M3: 30, Cargo_Base: 344 },
            { Id_Bloque: 79, Id_Tipo_Tarifa: 7, Minimo_M3: 16, Maximo_M3: 30, Cargo_Base: 283 },
            { Id_Bloque: 80, Id_Tipo_Tarifa: 7, Minimo_M3: 16, Maximo_M3: 30, Cargo_Base: 208 },

            // Residencial Pobreza Extrema bloque 3
            { Id_Bloque: 81, Id_Tipo_Tarifa: 7, Minimo_M3: 31, Maximo_M3: 60, Cargo_Base: 486 },
            { Id_Bloque: 82, Id_Tipo_Tarifa: 7, Minimo_M3: 31, Maximo_M3: 60, Cargo_Base: 402 },
            { Id_Bloque: 83, Id_Tipo_Tarifa: 7, Minimo_M3: 31, Maximo_M3: 60, Cargo_Base: 331 },
            { Id_Bloque: 84, Id_Tipo_Tarifa: 7, Minimo_M3: 31, Maximo_M3: 60, Cargo_Base: 243 },

            // Residencial Pobreza Extrema bloque 4
            { Id_Bloque: 85, Id_Tipo_Tarifa: 7, Minimo_M3: 61, Maximo_M3: 1000000, Cargo_Base: 540 },
            { Id_Bloque: 86, Id_Tipo_Tarifa: 7, Minimo_M3: 61, Maximo_M3: 1000000, Cargo_Base: 447 },
            { Id_Bloque: 87, Id_Tipo_Tarifa: 7, Minimo_M3: 61, Maximo_M3: 1000000, Cargo_Base: 368 },
            { Id_Bloque: 88, Id_Tipo_Tarifa: 7, Minimo_M3: 61, Maximo_M3: 1000000, Cargo_Base: 270 },



            // GC Bien Social bloque 1
            { Id_Bloque: 89, Id_Tipo_Tarifa: 8, Minimo_M3: 0, Maximo_M3: 2500, Cargo_Base: 360 },
            { Id_Bloque: 90, Id_Tipo_Tarifa: 8, Minimo_M3: 0, Maximo_M3: 2500, Cargo_Base: 234 },
            { Id_Bloque: 91, Id_Tipo_Tarifa: 8, Minimo_M3: 0, Maximo_M3: 2500, Cargo_Base: 193 },
            { Id_Bloque: 92, Id_Tipo_Tarifa: 8, Minimo_M3: 0, Maximo_M3: 2500, Cargo_Base: 142 },

            // GC Bien Social bloque 2
            { Id_Bloque: 93, Id_Tipo_Tarifa: 8, Minimo_M3: 2501, Maximo_M3: 6000, Cargo_Base: 663 },
            { Id_Bloque: 94, Id_Tipo_Tarifa: 8, Minimo_M3: 2501, Maximo_M3: 6000, Cargo_Base: 437 },
            { Id_Bloque: 95, Id_Tipo_Tarifa: 8, Minimo_M3: 2501, Maximo_M3: 6000, Cargo_Base: 355 },
            { Id_Bloque: 96, Id_Tipo_Tarifa: 8, Minimo_M3: 2501, Maximo_M3: 6000, Cargo_Base: 263 },

            // GC Bien Social bloque 3
            { Id_Bloque: 97, Id_Tipo_Tarifa: 8, Minimo_M3: 6001, Maximo_M3: 1000000, Cargo_Base: 787 },
            { Id_Bloque: 98, Id_Tipo_Tarifa: 8, Minimo_M3: 6001, Maximo_M3: 1000000, Cargo_Base: 522 },
            { Id_Bloque: 99, Id_Tipo_Tarifa: 8, Minimo_M3: 6001, Maximo_M3: 1000000, Cargo_Base: 423 },
            { Id_Bloque: 100, Id_Tipo_Tarifa: 8, Minimo_M3: 6001, Maximo_M3: 1000000, Cargo_Base: 313 },
        ];

        for (const costo of costos) {
            const existe = await this.bloqueRepository.findOne({
                where: { Id_Bloque: costo.Id_Bloque }
            });
            if (!existe) {
                const nuevo = this.bloqueRepository.create({
                    Id_Bloque: costo.Id_Bloque,
                    Id_Tipo_Tarifa: { Id_Tipo_Tarifa_Lectura: costo.Id_Tipo_Tarifa },
                    Minimo_M3: costo.Minimo_M3,
                    Maximo_M3: costo.Maximo_M3,
                    Cargo_Base: costo.Cargo_Base
                });
                await this.bloqueRepository.save(nuevo);
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