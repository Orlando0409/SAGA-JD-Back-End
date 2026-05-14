import { Min } from 'class-validator';
import { TarifaLecturaSinSello } from '../Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/TarifaLecturaSinSello.Entity';
import { RangoAfiliadosSinSello } from '../Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/RangoAfiliadosSinSello.Entity';
import { RangoConsumoSinSello } from '../Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/RangoConsumoSinSello.Entity';
import { CargoFijoTarifasSinSello } from '../Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/CargoFijoTarifasSinSello.Entity';
import { PrecioBloqueConsumoSinSello } from '../Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/PrecioBloqueConsumoSinSello.Entity';
import { RecursoHidricoSinSello } from '../Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/RecursoHidricoSinSello.Entity';
import { BloqueRecursoHidricoSinSello } from '../Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/BloqueRecursoHidricoSinSello.Entity';
import { PrecioRecursoHidricoSinSello } from '../Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/PrecioRecursoHidricoSinSello.Entity';
import { TarifaHidranteSinSello } from '../Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/TarifaHidranteSinSello.Entity';
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
import { EstadoReporte } from 'src/Modules/Reportes/ReporteEntities/EstadoReporte.Entity';
import { EstadoSugerencia } from 'src/Modules/Sugerencias/SugerenciaEntities/EstadoSugerencia.Entity';
import { EstadoQueja } from 'src/Modules/Quejas/QuejaEntities/EstadoQueja.Entity';
import { EstadoFactura } from 'src/Modules/Facturas/FacturaEntities/EstadoFactura.Entity';

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

        @InjectRepository(EstadoFactura)
        private readonly estadoFacturaRepository: Repository<EstadoFactura>,

        @InjectRepository(EstadoMedidor)
        private readonly estadoMedidorRepository: Repository<EstadoMedidor>,

        // Repositorios para entidades Sin Sello
        @InjectRepository(TarifaLecturaSinSello)
        private readonly tarifaLecturaSinSelloRepository: Repository<TarifaLecturaSinSello>,

        @InjectRepository(RangoAfiliadosSinSello)
        private readonly rangoAfiliadosSinSelloRepository: Repository<RangoAfiliadosSinSello>,

        @InjectRepository(RangoConsumoSinSello)
        private readonly rangoConsumoSinSelloRepository: Repository<RangoConsumoSinSello>,

        @InjectRepository(CargoFijoTarifasSinSello)
        private readonly cargoFijoTarifasSinSelloRepository: Repository<CargoFijoTarifasSinSello>,

        @InjectRepository(PrecioBloqueConsumoSinSello)
        private readonly precioBloqueConsumoSinSelloRepository: Repository<PrecioBloqueConsumoSinSello>,

        @InjectRepository(RecursoHidricoSinSello)
        private readonly recursoHidricoSinSelloRepository: Repository<RecursoHidricoSinSello>,

        @InjectRepository(BloqueRecursoHidricoSinSello)
        private readonly bloqueRecursoHidricoSinSelloRepository: Repository<BloqueRecursoHidricoSinSello>,

        @InjectRepository(PrecioRecursoHidricoSinSello)
        private readonly precioRecursoHidricoSinSelloRepository: Repository<PrecioRecursoHidricoSinSello>,

        @InjectRepository(TarifaHidranteSinSello)
        private readonly tarifaHidranteSinSelloRepository: Repository<TarifaHidranteSinSello>,
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
            await this.createDefaultEstadosFactura();
            await this.createDefaultEstadosAfiliado();
            await this.createDefaultTiposAfiliado();
            await this.createDefaultEstadosMaterial();
            await this.createDefaultEstadosCategoria();
            await this.createDefaultCategoriasMaterial();
            await this.createDefaultEstadosUnidadMedicion();
            await this.createDefaultUnidadesMedicion();
            await this.createDefaultEstadosMedidor();

            // Seeders para entidades Sin Sello
            await this.createTarifasLecturaSinSello();
            await this.createRangosAfiliadosSinSello();
            await this.createRangosConsumoSinSello();
            await this.createCargosFijosSinSello();
            await this.createPreciosBloqueConsumoSinSello();
            await this.createRecursosHidricosSinSello();
            await this.createBloquesRecursoHidricoSinSello();
            await this.createPreciosRecursoHidricoSinSello();
            await this.createTarifasHidranteSinSello();
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
            { Id_Estado_Medidor: 4, Nombre_Estado_Medidor: 'Desactivado' },
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

    private async createDefaultEstadosFactura() {
        // Flujo de estados:
        //   1. Disponible — factura emitida, dentro del periodo de pago (entre Fecha_Emision y Fecha_Vencimiento).
        //   2. Pagada     — pago confirmado.
        //   3. Pendiente  — pasó la Fecha_Vencimiento sin pago.
        //   4. Anulada    — factura anulada por corrección o cancelación.
        const estados = [
            { Id_Estado_Factura: 1, Nombre_Estado: 'Disponible', Descripcion: 'Factura emitida y disponible para pago dentro del periodo de cobro' },
            { Id_Estado_Factura: 2, Nombre_Estado: 'Pagada', Descripcion: 'Factura pagada en su totalidad' },
            { Id_Estado_Factura: 3, Nombre_Estado: 'Pendiente', Descripcion: 'Factura vencida sin pago — pendiente de cobro' },
            { Id_Estado_Factura: 4, Nombre_Estado: 'Anulada', Descripcion: 'Factura anulada por corrección o cancelación' },
        ];

        for (const estado of estados) {
            const existe = await this.estadoFacturaRepository.findOne({
                where: { Id_Estado_Factura: estado.Id_Estado_Factura },
            });
            if (!existe) {
                const nuevo = this.estadoFacturaRepository.create(estado);
                await this.estadoFacturaRepository.save(nuevo);
                console.log(`✅ Estado de factura creado: ${estado.Nombre_Estado}`);
            } else if (existe.Nombre_Estado !== estado.Nombre_Estado || existe.Descripcion !== estado.Descripcion) {
                // Forzar update si el nombre/descripción cambió (migración semántica)
                existe.Nombre_Estado = estado.Nombre_Estado;
                existe.Descripcion = estado.Descripcion;
                await this.estadoFacturaRepository.save(existe);
                console.log(`🔄 Estado de factura actualizado: ${estado.Nombre_Estado}`);
            }
        }
    }

    private async createDefaultEstadosSugerencia() {
        const estados = [
            { Id_Estado_Sugerencia: 1, Estado_Sugerencia: 'Pendiente' },
            { Id_Estado_Sugerencia: 2, Estado_Sugerencia: 'Contestado' },
            { Id_Estado_Sugerencia: 3, Estado_Sugerencia: 'Archivado' }
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


    // ============================================
    // ENTIDADES SIN SELLO
    // ============================================

    // Los 8 tipos de tarifa sin sello (Residencial, Comercio, Industrial, Preferencial, GC, Pobreza Básica/Extrema, GC Bien Social)
    private async createTarifasLecturaSinSello() {
        const tarifas = [
            { Nombre_Tipo_Tarifa: 'Residencial', Descripcion: 'Tarifa Residencial sin sello de calidad', Activa: true },
            { Nombre_Tipo_Tarifa: 'Comercio y Servicios', Descripcion: 'Tarifa Comercio y Servicios sin sello de calidad', Activa: true },
            { Nombre_Tipo_Tarifa: 'Industrial', Descripcion: 'Tarifa Industrial sin sello de calidad', Activa: true },
            { Nombre_Tipo_Tarifa: 'Preferencial', Descripcion: 'Tarifa Preferencial sin sello de calidad', Activa: true },
            { Nombre_Tipo_Tarifa: 'Grandes Consumidores', Descripcion: 'Tarifa Grandes Consumidores sin sello de calidad', Activa: true },
            { Nombre_Tipo_Tarifa: 'Residencial Pobreza Basica', Descripcion: 'Tarifa Residencial Pobreza Básica sin sello de calidad', Activa: true },
            { Nombre_Tipo_Tarifa: 'Residencial Pobreza Extrema', Descripcion: 'Tarifa Residencial Pobreza Extrema sin sello de calidad', Activa: true },
            { Nombre_Tipo_Tarifa: 'Grandes Consumidores Residenciales Bien Social', Descripcion: 'Tarifa GC Bien Social sin sello de calidad', Activa: true },
        ];

        for (const tarifa of tarifas) {
            const existe = await this.tarifaLecturaSinSelloRepository.findOne({
                where: { Nombre_Tipo_Tarifa: tarifa.Nombre_Tipo_Tarifa }
            });

            if (!existe) {
                const nuevaTarifa = this.tarifaLecturaSinSelloRepository.create(tarifa);
                await this.tarifaLecturaSinSelloRepository.save(nuevaTarifa);
            }
        }
    }

    // Los 4 rangos de abonados para tarifas sin sello
    private async createRangosAfiliadosSinSello() {
        const rangos = [
            { Nombre_Rango: '1-100', Minimo_Afiliados: 1, Maximo_Afiliados: 100 },
            { Nombre_Rango: '101-300', Minimo_Afiliados: 101, Maximo_Afiliados: 300 },
            { Nombre_Rango: '301-1000', Minimo_Afiliados: 301, Maximo_Afiliados: 1000 },
            { Nombre_Rango: '1001+', Minimo_Afiliados: 1001, Maximo_Afiliados: 9999999 },
        ];

        for (const rango of rangos) {
            const existe = await this.rangoAfiliadosSinSelloRepository.findOne({
                where: {
                    Minimo_Afiliados: rango.Minimo_Afiliados,
                    Maximo_Afiliados: rango.Maximo_Afiliados
                }
            });

            if (!existe) {
                const nuevoRango = this.rangoAfiliadosSinSelloRepository.create(rango);
                await this.rangoAfiliadosSinSelloRepository.save(nuevoRango);
            }
        }
    }

    // Bloques de consumo M³ por cada tipo de tarifa sin sello (escalonado)
    private async createRangosConsumoSinSello() {
        const bloquesPorTipo: { tipo: string; bloques: [number, number][] }[] = [
            { tipo: 'Residencial', bloques: [[1, 15], [16, 30], [31, 60], [61, 999999]] },
            { tipo: 'Comercio y Servicios', bloques: [[1, 20], [21, 65], [66, 999999]] },
            { tipo: 'Industrial', bloques: [[1, 120], [121, 999999]] },
            { tipo: 'Preferencial', bloques: [[1, 120], [121, 999999]] },
            { tipo: 'Grandes Consumidores', bloques: [[1, 2500], [2501, 6000], [6001, 999999]] },
            { tipo: 'Residencial Pobreza Basica', bloques: [[1, 15], [16, 30], [31, 60], [61, 999999]] },
            { tipo: 'Residencial Pobreza Extrema', bloques: [[1, 15], [16, 30], [31, 60], [61, 999999]] },
            { tipo: 'Grandes Consumidores Residenciales Bien Social', bloques: [[1, 2500], [2501, 6000], [6001, 999999]] },
        ];

        for (const item of bloquesPorTipo) {
            const tarifa = await this.tarifaLecturaSinSelloRepository.findOne({
                where: { Nombre_Tipo_Tarifa: item.tipo }
            });
            if (!tarifa) {
                console.log(`⚠️ Tarifa Sin Sello no encontrada: ${item.tipo}`);
                continue;
            }

            let orden = 1;
            for (const [min, max] of item.bloques) {
                const existe = await this.rangoConsumoSinSelloRepository.findOne({
                    where: {
                        Tipo_Tarifa: { Id_Tarifa_Lectura: tarifa.Id_Tarifa_Lectura },
                        Minimo_M3: min,
                        Maximo_M3: max
                    }
                });

                if (!existe) {
                    const nuevoRango = this.rangoConsumoSinSelloRepository.create({
                        Tipo_Tarifa: tarifa,
                        Minimo_M3: min,
                        Maximo_M3: max,
                        Orden: orden
                    });
                    await this.rangoConsumoSinSelloRepository.save(nuevoRango);
                    console.log(`✅ Rango Consumo Sin Sello ${item.tipo} creado: ${min}-${max} M³`);
                }
                orden++;
            }
        }
    }

    // Cargos fijos sin sello: 3100 para rangos 1-100 y 101-300; 2800 para 301-1000 y 1001+
    private async createCargosFijosSinSello() {
        const cargoPorRango: Record<string, number> = {
            '1-100': 3100,
            '101-300': 3100,
            '301-1000': 2800,
            '1001+': 2800,
        };

        const tarifas = await this.tarifaLecturaSinSelloRepository.find();
        const rangos = await this.rangoAfiliadosSinSelloRepository.find();

        if (tarifas.length === 0 || rangos.length === 0) {
            console.log('⚠️ Tarifas o rangos de abonados Sin Sello no encontrados');
            return;
        }

        for (const tarifa of tarifas) {
            for (const rango of rangos) {
                const cargo = cargoPorRango[rango.Nombre_Rango];
                if (cargo === undefined) continue;

                const existe = await this.cargoFijoTarifasSinSelloRepository.findOne({
                    where: {
                        Tipo_Tarifa: { Id_Tarifa_Lectura: tarifa.Id_Tarifa_Lectura },
                        Rango_Afiliados: { Id_Rango_Afiliados: rango.Id_Rango_Afiliados }
                    }
                });

                if (!existe) {
                    const nuevoCargoFijo = this.cargoFijoTarifasSinSelloRepository.create({
                        Tipo_Tarifa: tarifa,
                        Rango_Afiliados: rango,
                        Cargo_Fijo_Por_Mes: cargo,
                        Activo: true
                    });
                    await this.cargoFijoTarifasSinSelloRepository.save(nuevoCargoFijo);
                    console.log(`✅ Cargo fijo Sin Sello: ${tarifa.Nombre_Tipo_Tarifa} / ${rango.Nombre_Rango} = ₡${cargo}`);
                }
            }
        }
    }

    // Matriz precios por bloque consumo * rango abonados para los 8 tipos sin sello (cálculo escalonado)
    private async createPreciosBloqueConsumoSinSello() {
        type FilaMatriz = { tipo: string; bloque: [number, number]; precios: Record<string, number> };

        const matriz: FilaMatriz[] = [
            // Residencial
            { tipo: 'Residencial', bloque: [1, 15], precios: { '1-100': 360, '101-300': 298, '301-1000': 245, '1001+': 180 } },
            { tipo: 'Residencial', bloque: [16, 30], precios: { '1-100': 416, '101-300': 344, '301-1000': 283, '1001+': 208 } },
            { tipo: 'Residencial', bloque: [31, 60], precios: { '1-100': 486, '101-300': 402, '301-1000': 331, '1001+': 243 } },
            { tipo: 'Residencial', bloque: [61, 999999], precios: { '1-100': 540, '101-300': 447, '301-1000': 368, '1001+': 270 } },

            // Comercio y Servicios
            { tipo: 'Comercio y Servicios', bloque: [1, 20], precios: { '1-100': 508, '101-300': 330, '301-1000': 269, '1001+': 199 } },
            { tipo: 'Comercio y Servicios', bloque: [21, 65], precios: { '1-100': 582, '101-300': 388, '301-1000': 315, '1001+': 236 } },
            { tipo: 'Comercio y Servicios', bloque: [66, 999999], precios: { '1-100': 762, '101-300': 506, '301-1000': 410, '1001+': 302 } },

            // Industrial
            { tipo: 'Industrial', bloque: [1, 120], precios: { '1-100': 536, '101-300': 359, '301-1000': 289, '1001+': 211 } },
            { tipo: 'Industrial', bloque: [121, 999999], precios: { '1-100': 832, '101-300': 548, '301-1000': 447, '1001+': 328 } },

            // Preferencial
            { tipo: 'Preferencial', bloque: [1, 120], precios: { '1-100': 480, '101-300': 313, '301-1000': 258, '1001+': 189 } },
            { tipo: 'Preferencial', bloque: [121, 999999], precios: { '1-100': 709, '101-300': 461, '301-1000': 380, '1001+': 279 } },

            // Grandes Consumidores
            { tipo: 'Grandes Consumidores', bloque: [1, 2500], precios: { '1-100': 513, '101-300': 333, '301-1000': 271, '1001+': 201 } },
            { tipo: 'Grandes Consumidores', bloque: [2501, 6000], precios: { '1-100': 663, '101-300': 437, '301-1000': 355, '1001+': 263 } },
            { tipo: 'Grandes Consumidores', bloque: [6001, 999999], precios: { '1-100': 787, '101-300': 522, '301-1000': 423, '1001+': 313 } },

            // Residencial Pobreza Básica
            { tipo: 'Residencial Pobreza Basica', bloque: [1, 15], precios: { '1-100': 270, '101-300': 223, '301-1000': 184, '1001+': 135 } },
            { tipo: 'Residencial Pobreza Basica', bloque: [16, 30], precios: { '1-100': 416, '101-300': 344, '301-1000': 283, '1001+': 208 } },
            { tipo: 'Residencial Pobreza Basica', bloque: [31, 60], precios: { '1-100': 486, '101-300': 402, '301-1000': 331, '1001+': 243 } },
            { tipo: 'Residencial Pobreza Basica', bloque: [61, 999999], precios: { '1-100': 540, '101-300': 447, '301-1000': 368, '1001+': 270 } },

            // Residencial Pobreza Extrema
            { tipo: 'Residencial Pobreza Extrema', bloque: [1, 15], precios: { '1-100': 180, '101-300': 149, '301-1000': 123, '1001+': 90 } },
            { tipo: 'Residencial Pobreza Extrema', bloque: [16, 30], precios: { '1-100': 416, '101-300': 344, '301-1000': 283, '1001+': 208 } },
            { tipo: 'Residencial Pobreza Extrema', bloque: [31, 60], precios: { '1-100': 486, '101-300': 402, '301-1000': 331, '1001+': 243 } },
            { tipo: 'Residencial Pobreza Extrema', bloque: [61, 999999], precios: { '1-100': 540, '101-300': 447, '301-1000': 368, '1001+': 270 } },

            // GC Bien Social
            { tipo: 'Grandes Consumidores Residenciales Bien Social', bloque: [1, 2500], precios: { '1-100': 360, '101-300': 234, '301-1000': 193, '1001+': 142 } },
            { tipo: 'Grandes Consumidores Residenciales Bien Social', bloque: [2501, 6000], precios: { '1-100': 663, '101-300': 437, '301-1000': 355, '1001+': 263 } },
            { tipo: 'Grandes Consumidores Residenciales Bien Social', bloque: [6001, 999999], precios: { '1-100': 787, '101-300': 522, '301-1000': 423, '1001+': 313 } },
        ];

        const rangosAbonados = await this.rangoAfiliadosSinSelloRepository.find();
        const rangosAbonadosMap = new Map(rangosAbonados.map(r => [r.Nombre_Rango, r]));

        for (const fila of matriz) {
            const tarifa = await this.tarifaLecturaSinSelloRepository.findOne({
                where: { Nombre_Tipo_Tarifa: fila.tipo }
            });
            if (!tarifa) {
                console.log(`⚠️ Tarifa Sin Sello no encontrada: ${fila.tipo}`);
                continue;
            }

            const rangoConsumo = await this.rangoConsumoSinSelloRepository.findOne({
                where: {
                    Tipo_Tarifa: { Id_Tarifa_Lectura: tarifa.Id_Tarifa_Lectura },
                    Minimo_M3: fila.bloque[0],
                    Maximo_M3: fila.bloque[1]
                }
            });
            if (!rangoConsumo) {
                console.log(`⚠️ Rango consumo no encontrado: ${fila.tipo} ${fila.bloque[0]}-${fila.bloque[1]} M³`);
                continue;
            }

            for (const [nombreRango, precio] of Object.entries(fila.precios)) {
                const rangoAbonados = rangosAbonadosMap.get(nombreRango);
                if (!rangoAbonados) {
                    console.log(`⚠️ Rango abonados no encontrado: ${nombreRango}`);
                    continue;
                }

                const existe = await this.precioBloqueConsumoSinSelloRepository.findOne({
                    where: {
                        Tipo_Tarifa: { Id_Tarifa_Lectura: tarifa.Id_Tarifa_Lectura },
                        Rango_Consumo: { Id_Rango_Consumo: rangoConsumo.Id_Rango_Consumo },
                        Rango_Afiliados: { Id_Rango_Afiliados: rangoAbonados.Id_Rango_Afiliados }
                    }
                });

                if (!existe) {
                    const nuevoPrecio = this.precioBloqueConsumoSinSelloRepository.create({
                        Tipo_Tarifa: tarifa,
                        Rango_Consumo: rangoConsumo,
                        Rango_Afiliados: rangoAbonados,
                        Precio_Por_M3: precio,
                        Activo: true
                    });
                    await this.precioBloqueConsumoSinSelloRepository.save(nuevoPrecio);
                    console.log(`✅ Precio Sin Sello: ${fila.tipo} / ${fila.bloque[0]}-${fila.bloque[1]} M³ / ${nombreRango} abonados = ₡${precio}/M³`);
                }
            }
        }
    }



    // ======================================================================
    // ENTIDADES RELACIONADAS CON RECURSOS HÍDRICOS SIN SELLO
    // ======================================================================
    // ============================================================
    // RECURSO HIDRICO (TPRH) — Tarifa de Protección del Recurso Hídrico
    // ============================================================
    // Modelo unificado: 1 RecursoHidricoSinSello por cada tipo de tarifa,
    // con sus propios bloques. Los precios son únicos por bloque y NO
    // varían por rango de abonados (estructura unificada según pliego
    // ARESEP — Resolución RE-0008-IA-2025, Oficio OF-0252-IA-2026).
    //
    // Las categorías "Default" (Pobreza Básica/Extrema y Venta de Agua en
    // Bloque) utilizan un único bloque con precio ₡42 hasta tener cifras
    // oficiales.
    private static readonly MATRIZ_RECURSO_HIDRICO: Array<{
        tipoTarifa: string;
        bloques: Array<{ min: number; max: number; precio: number }>;
    }> = [
        {
            tipoTarifa: 'Residencial',
            bloques: [
                { min: 1, max: 15, precio: 42 },
                { min: 16, max: 30, precio: 45 },
                { min: 31, max: 60, precio: 50 },
                { min: 61, max: 999999, precio: 57 },
            ],
        },
        {
            tipoTarifa: 'Comercio y Servicios',
            bloques: [
                { min: 1, max: 20, precio: 42 },
                { min: 21, max: 65, precio: 49 },
                { min: 66, max: 999999, precio: 58 },
            ],
        },
        {
            tipoTarifa: 'Industrial',
            bloques: [
                { min: 1, max: 120, precio: 42 },
                { min: 121, max: 999999, precio: 60 },
            ],
        },
        {
            tipoTarifa: 'Preferencial',
            bloques: [
                { min: 1, max: 120, precio: 42 },
                { min: 121, max: 999999, precio: 57 },
            ],
        },
        {
            tipoTarifa: 'Grandes Consumidores',
            bloques: [
                { min: 1, max: 2500, precio: 42 },
                { min: 2501, max: 6000, precio: 50 },
                { min: 6001, max: 999999, precio: 59 },
            ],
        },
        {
            tipoTarifa: 'Grandes Consumidores Residenciales Bien Social',
            bloques: [
                { min: 1, max: 2500, precio: 42 },
                { min: 2501, max: 6000, precio: 50 },
                { min: 6001, max: 999999, precio: 59 },
            ],
        },
        // Default — un único bloque temporal hasta tener valores oficiales
        {
            tipoTarifa: 'Residencial Pobreza Basica',
            bloques: [
                { min: 1, max: 999999, precio: 42 },
            ],
        },
        {
            tipoTarifa: 'Residencial Pobreza Extrema',
            bloques: [
                { min: 1, max: 999999, precio: 42 },
            ],
        },
    ];

    private async createRecursosHidricosSinSello() {
        // Cleanup completo: eliminar precios → bloques → recursos previos,
        // luego re-crear según la matriz por tipo de tarifa.
        const existentes = await this.recursoHidricoSinSelloRepository.find();
        for (const recurso of existentes) {
            const bloques = await this.bloqueRecursoHidricoSinSelloRepository.find({
                where: { Recurso_Hidrico: { Id_Recurso_Hidrico: recurso.Id_Recurso_Hidrico } }
            });
            for (const bloque of bloques) {
                await this.precioRecursoHidricoSinSelloRepository.delete({
                    Bloque_Recurso_Hidrico: { Id_Bloque_Recurso_Hidrico: bloque.Id_Bloque_Recurso_Hidrico }
                });
                await this.bloqueRecursoHidricoSinSelloRepository.delete({ Id_Bloque_Recurso_Hidrico: bloque.Id_Bloque_Recurso_Hidrico });
            }
            await this.recursoHidricoSinSelloRepository.delete({ Id_Recurso_Hidrico: recurso.Id_Recurso_Hidrico });
        }

        // Crear recursos por tipo de tarifa (1:1 con tarifa por nombre)
        for (const entrada of SeederService.MATRIZ_RECURSO_HIDRICO) {
            const nuevo = this.recursoHidricoSinSelloRepository.create({
                Nombre: entrada.tipoTarifa,
                Activo: true,
            });
            await this.recursoHidricoSinSelloRepository.save(nuevo);
        }
    }

    private async createBloquesRecursoHidricoSinSello() {
        for (const entrada of SeederService.MATRIZ_RECURSO_HIDRICO) {
            const recurso = await this.recursoHidricoSinSelloRepository.findOne({
                where: { Nombre: entrada.tipoTarifa }
            });
            if (!recurso) {
                console.log(`⚠️ Recurso hídrico no encontrado para tipo: ${entrada.tipoTarifa}`);
                continue;
            }

            let orden = 1;
            for (const bloqueItem of entrada.bloques) {
                const existe = await this.bloqueRecursoHidricoSinSelloRepository.findOne({
                    where: {
                        Recurso_Hidrico: { Id_Recurso_Hidrico: recurso.Id_Recurso_Hidrico },
                        Minimo_M3: bloqueItem.min,
                        Maximo_M3: bloqueItem.max
                    }
                });
                if (!existe) {
                    const nuevoBloque = this.bloqueRecursoHidricoSinSelloRepository.create({
                        Recurso_Hidrico: recurso,
                        Minimo_M3: bloqueItem.min,
                        Maximo_M3: bloqueItem.max,
                        Orden: orden,
                    });
                    await this.bloqueRecursoHidricoSinSelloRepository.save(nuevoBloque);
                }
                orden++;
            }
        }
    }

    private async createPreciosRecursoHidricoSinSello() {
        for (const entrada of SeederService.MATRIZ_RECURSO_HIDRICO) {
            const recurso = await this.recursoHidricoSinSelloRepository.findOne({
                where: { Nombre: entrada.tipoTarifa }
            });
            if (!recurso) continue;

            for (const bloqueItem of entrada.bloques) {
                const bloque = await this.bloqueRecursoHidricoSinSelloRepository.findOne({
                    where: {
                        Recurso_Hidrico: { Id_Recurso_Hidrico: recurso.Id_Recurso_Hidrico },
                        Minimo_M3: bloqueItem.min,
                        Maximo_M3: bloqueItem.max
                    }
                });
                if (!bloque) continue;

                const existe = await this.precioRecursoHidricoSinSelloRepository.findOne({
                    where: { Bloque_Recurso_Hidrico: { Id_Bloque_Recurso_Hidrico: bloque.Id_Bloque_Recurso_Hidrico } }
                });
                if (!existe) {
                    const nuevo = this.precioRecursoHidricoSinSelloRepository.create({
                        Bloque_Recurso_Hidrico: bloque,
                        Precio_Por_M3: bloqueItem.precio,
                        Activo: true,
                    });
                    await this.precioRecursoHidricoSinSelloRepository.save(nuevo);
                    console.log(`✅ TPRH ${entrada.tipoTarifa}: ${bloqueItem.min}-${bloqueItem.max} M³ = ₡${bloqueItem.precio}/M³`);
                }
            }
        }
    }



    // ============================================
    // ENTIDAD TARIFA DE HIDRANTES SIN SELLO
    // ============================================
    private async createTarifasHidranteSinSello() {
        const tarifa = [
            { Precio_Hidrante_Por_M3: 26, Activa: true }
        ];

        for (const t of tarifa) {
            const existe = await this.tarifaHidranteSinSelloRepository.findOne({
                where: { Precio_Hidrante_Por_M3: t.Precio_Hidrante_Por_M3 }
            });

            if (!existe) {
                const nuevaTarifa = this.tarifaHidranteSinSelloRepository.create(t);
                await this.tarifaHidranteSinSelloRepository.save(nuevaTarifa);
                console.log(`✅ Tarifa Hidrante Sin Sello creada: ₡${t.Precio_Hidrante_Por_M3}`);
            }
        }
    }

    private async createPermisos() {
        const modulos = [
            'usuarios',
            'actas',
            'quejasugerenciasreportes',
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