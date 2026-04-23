import { Min } from 'class-validator';
import { TipoTarifaServiciosFijosConSello } from '../Modules/Tarifas/Con Sello Calidad/TarifaConSelloEntities/TarifaServiciosFijos.Entity';
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
import { RangoAfiliados } from 'src/Modules/Lecturas/LecturaEntities/RangoAfiliados.Entity';
import { RangoConsumo } from 'src/Modules/Lecturas/LecturaEntities/RangoConsumo.Entity';
import { EstadoReporte } from 'src/Modules/Reportes/ReporteEntities/EstadoReporte.Entity';
import { EstadoSugerencia } from 'src/Modules/Sugerencias/SugerenciaEntities/EstadoSugerencia.Entity';
import { EstadoQueja } from 'src/Modules/Quejas/QuejaEntities/EstadoQueja.Entity';
import { EstadoFactura } from 'src/Modules/Facturas/FacturaEntities/EstadoFactura.Entity';
import { AplicarSelloCalidad } from 'src/Modules/Lecturas/LecturaEntities/AplicarSelloCalidad.Entity';
import { TarifaLecturaConSello } from 'src/Modules/Tarifas/Con Sello Calidad/TarifaConSelloEntities/TarifaLecturaConSello.Entity';
import { CargoFijoTarifasConSello } from 'src/Modules/Tarifas/Con Sello Calidad/TarifaConSelloEntities/CargoFijoTarifasConSello.Entity';
import { TipoTarifaCargoFijoConSello } from 'src/Modules/Tarifas/Con Sello Calidad/TarifaConSelloEntities/TipoTarifaCargoFijoConSello.Entity';
import { TipoTarifaVentaAguaConSello } from 'src/Modules/Tarifas/Con Sello Calidad/TarifaConSelloEntities/TarifaVentaAgua.Entity';

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

        @InjectRepository(TarifaLecturaConSello)
        private readonly tipoTarifaLecturaRepository: Repository<TarifaLecturaConSello>,

        @InjectRepository(TipoTarifaServiciosFijosConSello)
        private readonly tipoTarifaServiciosFijosRepository: Repository<TipoTarifaServiciosFijosConSello>,

        @InjectRepository(CargoFijoTarifasConSello)
        private readonly cargoFijoTarifasRepository: Repository<CargoFijoTarifasConSello>,

        @InjectRepository(TipoTarifaCargoFijoConSello)
        private readonly tipoTarifaCargoFijoRepository: Repository<TipoTarifaCargoFijoConSello>,

        @InjectRepository(TipoTarifaVentaAguaConSello)
        private readonly tipoTarifaVentaAguaRepository: Repository<TipoTarifaVentaAguaConSello>,

        @InjectRepository(RangoAfiliados)
        private readonly rangoAfiliadosRepository: Repository<RangoAfiliados>,

        @InjectRepository(RangoConsumo)
        private readonly rangoConsumoRepository: Repository<RangoConsumo>,

        @InjectRepository(AplicarSelloCalidad)
        private readonly aplicarSelloCalidadRepository: Repository<AplicarSelloCalidad>,

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
            await this.createDefaultTiposTarifaLectura();
            await this.createDefaultCargosFijosTarifas();
            await this.createRangosAfiliados();
            await this.createDefaultTipoTarifaCargoFijo();
            await this.createDefaultTiposTarifaServiciosFijos();
            await this.createDefaultTiposTarifaVentaAgua();
            await this.createRangosConsumo();
            await this.createDefaultAplicarSelloCalidad();

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
        const estados = [
            { Id_Estado_Factura: 1, Nombre_Estado: 'Pendiente', Descripcion: 'Factura emitida pendiente de pago' },
            { Id_Estado_Factura: 2, Nombre_Estado: 'Pagada', Descripcion: 'Factura pagada en su totalidad' },
            { Id_Estado_Factura: 3, Nombre_Estado: 'Vencida', Descripcion: 'Factura no pagada después de la fecha de vencimiento' },
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

    private async createDefaultAplicarSelloCalidad() {
        const sello = [
            { Id_Aplicar_Sello_Calidad: 1, Aplicar_Sello_Calidad: false },
        ];

        for (const item of sello) {
            const existe = await this.aplicarSelloCalidadRepository.findOne({
                where: { Id_Aplicar_Sello_Calidad: item.Id_Aplicar_Sello_Calidad }
            });
            if (!existe) {
                const nuevo = this.aplicarSelloCalidadRepository.create(item);
                await this.aplicarSelloCalidadRepository.save(nuevo);
            }
        }
    }

    private async createDefaultCargosFijosTarifas() {
        const cargos = [
            { Id_Cargo_Fijo_Tarifa: 1, Cargo_Fijo_Por_Mes: 3100 },
            { Id_Cargo_Fijo_Tarifa: 2, Cargo_Fijo_Por_Mes: 3100 },
            { Id_Cargo_Fijo_Tarifa: 3, Cargo_Fijo_Por_Mes: 2800 },
            { Id_Cargo_Fijo_Tarifa: 4, Cargo_Fijo_Por_Mes: 2800 },
        ];

        for (const cargo of cargos) {
            const existe = await this.cargoFijoTarifasRepository.findOne({
                where: { Id_Cargo_Fijo_Tarifa: cargo.Id_Cargo_Fijo_Tarifa }
            });
            if (!existe) {
                const nuevo = this.cargoFijoTarifasRepository.create(cargo);
                await this.cargoFijoTarifasRepository.save(nuevo);
            }
        }
    }

    private async createDefaultTipoTarifaCargoFijo() {
        const tipos = [
            { Id_Tipo_Tarifa_Lectura: 1, Id_Cargo_Fijo_Tarifa: 1, Id_Rango_Afiliados: 1 },
            { Id_Tipo_Tarifa_Lectura: 1, Id_Cargo_Fijo_Tarifa: 2, Id_Rango_Afiliados: 2 },
            { Id_Tipo_Tarifa_Lectura: 1, Id_Cargo_Fijo_Tarifa: 3, Id_Rango_Afiliados: 3 },
            { Id_Tipo_Tarifa_Lectura: 1, Id_Cargo_Fijo_Tarifa: 4, Id_Rango_Afiliados: 4 },

            { Id_Tipo_Tarifa_Lectura: 2, Id_Cargo_Fijo_Tarifa: 1, Id_Rango_Afiliados: 5 },
            { Id_Tipo_Tarifa_Lectura: 2, Id_Cargo_Fijo_Tarifa: 2, Id_Rango_Afiliados: 6 },
            { Id_Tipo_Tarifa_Lectura: 2, Id_Cargo_Fijo_Tarifa: 3, Id_Rango_Afiliados: 7 },
            { Id_Tipo_Tarifa_Lectura: 2, Id_Cargo_Fijo_Tarifa: 4, Id_Rango_Afiliados: 8 },

            { Id_Tipo_Tarifa_Lectura: 3, Id_Cargo_Fijo_Tarifa: 1, Id_Rango_Afiliados: 9 },
            { Id_Tipo_Tarifa_Lectura: 3, Id_Cargo_Fijo_Tarifa: 2, Id_Rango_Afiliados: 10 },
            { Id_Tipo_Tarifa_Lectura: 3, Id_Cargo_Fijo_Tarifa: 3, Id_Rango_Afiliados: 11 },
            { Id_Tipo_Tarifa_Lectura: 3, Id_Cargo_Fijo_Tarifa: 4, Id_Rango_Afiliados: 12 },

            { Id_Tipo_Tarifa_Lectura: 4, Id_Cargo_Fijo_Tarifa: 1, Id_Rango_Afiliados: 13 },
            { Id_Tipo_Tarifa_Lectura: 4, Id_Cargo_Fijo_Tarifa: 2, Id_Rango_Afiliados: 14 },
            { Id_Tipo_Tarifa_Lectura: 4, Id_Cargo_Fijo_Tarifa: 3, Id_Rango_Afiliados: 15 },
            { Id_Tipo_Tarifa_Lectura: 4, Id_Cargo_Fijo_Tarifa: 4, Id_Rango_Afiliados: 16 },

            { Id_Tipo_Tarifa_Lectura: 5, Id_Cargo_Fijo_Tarifa: 1, Id_Rango_Afiliados: 17 },
            { Id_Tipo_Tarifa_Lectura: 5, Id_Cargo_Fijo_Tarifa: 2, Id_Rango_Afiliados: 18 },
            { Id_Tipo_Tarifa_Lectura: 5, Id_Cargo_Fijo_Tarifa: 3, Id_Rango_Afiliados: 19 },
            { Id_Tipo_Tarifa_Lectura: 5, Id_Cargo_Fijo_Tarifa: 4, Id_Rango_Afiliados: 20 },

            { Id_Tipo_Tarifa_Lectura: 6, Id_Cargo_Fijo_Tarifa: 1, Id_Rango_Afiliados: 21 },
            { Id_Tipo_Tarifa_Lectura: 6, Id_Cargo_Fijo_Tarifa: 2, Id_Rango_Afiliados: 22 },
            { Id_Tipo_Tarifa_Lectura: 6, Id_Cargo_Fijo_Tarifa: 3, Id_Rango_Afiliados: 23 },
            { Id_Tipo_Tarifa_Lectura: 6, Id_Cargo_Fijo_Tarifa: 4, Id_Rango_Afiliados: 24 },

            { Id_Tipo_Tarifa_Lectura: 7, Id_Cargo_Fijo_Tarifa: 1, Id_Rango_Afiliados: 25 },
            { Id_Tipo_Tarifa_Lectura: 7, Id_Cargo_Fijo_Tarifa: 2, Id_Rango_Afiliados: 26 },
            { Id_Tipo_Tarifa_Lectura: 7, Id_Cargo_Fijo_Tarifa: 3, Id_Rango_Afiliados: 27 },
            { Id_Tipo_Tarifa_Lectura: 7, Id_Cargo_Fijo_Tarifa: 4, Id_Rango_Afiliados: 28 },

            { Id_Tipo_Tarifa_Lectura: 8, Id_Cargo_Fijo_Tarifa: 1, Id_Rango_Afiliados: 29 },
            { Id_Tipo_Tarifa_Lectura: 8, Id_Cargo_Fijo_Tarifa: 2, Id_Rango_Afiliados: 30 },
            { Id_Tipo_Tarifa_Lectura: 8, Id_Cargo_Fijo_Tarifa: 3, Id_Rango_Afiliados: 31 },
            { Id_Tipo_Tarifa_Lectura: 8, Id_Cargo_Fijo_Tarifa: 4, Id_Rango_Afiliados: 32 },
        ];

        for (const tipo of tipos) {
            const existe = await this.tipoTarifaCargoFijoRepository.findOne({
                where: {
                    Tipo_Tarifa: { Id_Tarifa_Lectura: tipo.Id_Tipo_Tarifa_Lectura },
                    Cargo_Fijo: { Id_Cargo_Fijo_Tarifa: tipo.Id_Cargo_Fijo_Tarifa },
                    Rango_Afiliados: { Id_Rango_Afiliados: tipo.Id_Rango_Afiliados },
                }
            });
            if (!existe) {
                const nuevo = this.tipoTarifaCargoFijoRepository.create({
                    Tipo_Tarifa: { Id_Tarifa_Lectura: tipo.Id_Tipo_Tarifa_Lectura },
                    Cargo_Fijo: { Id_Cargo_Fijo_Tarifa: tipo.Id_Cargo_Fijo_Tarifa },
                    Rango_Afiliados: { Id_Rango_Afiliados: tipo.Id_Rango_Afiliados },
                });
                await this.tipoTarifaCargoFijoRepository.save(nuevo);
            }
        }
    }

    // VALORES FIJOS PARA TARIFAS DEL 10/26/2025
    private async createDefaultTiposTarifaLectura() {
        const tipos = [
            { Id_Tipo_Tarifa_Lectura: 1, Nombre_Tipo_Tarifa: 'Domipre' },
            { Id_Tipo_Tarifa_Lectura: 2, Nombre_Tipo_Tarifa: 'Comercio y Servicios' },
            { Id_Tipo_Tarifa_Lectura: 3, Nombre_Tipo_Tarifa: 'Industrial' },
            { Id_Tipo_Tarifa_Lectura: 4, Nombre_Tipo_Tarifa: 'Preferencial' },
            { Id_Tipo_Tarifa_Lectura: 5, Nombre_Tipo_Tarifa: 'Grandes Consumidores' },
            { Id_Tipo_Tarifa_Lectura: 6, Nombre_Tipo_Tarifa: 'Residencial Pobreza Basica' },
            { Id_Tipo_Tarifa_Lectura: 7, Nombre_Tipo_Tarifa: 'Residencial Pobreza Extrema' },
            { Id_Tipo_Tarifa_Lectura: 8, Nombre_Tipo_Tarifa: 'Grandes Consumidores Residenciales Bien Social' },
        ];

        for (const tipo of tipos) {
            const existe = await this.tipoTarifaLecturaRepository.findOne({
                where: { Id_Tarifa_Lectura: tipo.Id_Tipo_Tarifa_Lectura }
            });
            if (!existe) {
                const nuevo = this.tipoTarifaLecturaRepository.create({
                    Id_Tarifa_Lectura: tipo.Id_Tipo_Tarifa_Lectura,
                    Nombre_Tipo_Tarifa: tipo.Nombre_Tipo_Tarifa
                });
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

            // GC BIEN SOCIAL (Tarifa 8)
            { Id_Tipo_Tarifa: 8, Minimo: 1, Maximo: 100, Nombre_Rango: '1-100', Cargo_Base: 305518 },
            { Id_Tipo_Tarifa: 8, Minimo: 101, Maximo: 300, Nombre_Rango: '101-300', Cargo_Base: 199763 },
            { Id_Tipo_Tarifa: 8, Minimo: 301, Maximo: 1000, Nombre_Rango: '301-1000', Cargo_Base: 163616 },
            { Id_Tipo_Tarifa: 8, Minimo: 1001, Maximo: 999999, Nombre_Rango: '1000+', Cargo_Base: 120598 },
        ];

        for (const tipo of tipos) {
            const existe = await this.tipoTarifaServiciosFijosRepository.findOne({
                where: {
                    Tipo_Tarifa: { Id_Tarifa_Lectura: tipo.Id_Tipo_Tarifa },
                    Minimo_Afiliados: tipo.Minimo,
                }
            });
            if (!existe) {
                const nuevo = this.tipoTarifaServiciosFijosRepository.create({
                    Tipo_Tarifa: { Id_Tarifa_Lectura: tipo.Id_Tipo_Tarifa },
                    Minimo_Afiliados: tipo.Minimo,
                    Maximo_Afiliados: tipo.Maximo,
                    Nombre_Rango: tipo.Nombre_Rango,
                    Cargo_Base: tipo.Cargo_Base,
                });
                await this.tipoTarifaServiciosFijosRepository.save(nuevo);
            }
        }
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
                    Tipo_Tarifa: { Id_Tarifa_Lectura: rango.Id_Tipo_Tarifa },
                    Minimo_Afiliados: rango.Minimo,
                }
            });

            if (!existe) {
                const nuevo = this.rangoAfiliadosRepository.create({
                    Tipo_Tarifa: { Id_Tarifa_Lectura: rango.Id_Tipo_Tarifa },
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
                    Tipo_Tarifa: { Id_Tarifa_Lectura: rango.Id_Tipo_Tarifa },
                    Minimo_M3: rango.Minimo_M3,
                }
            });

            if (!existe) {
                const nuevo = this.rangoConsumoRepository.create({
                    Tipo_Tarifa: { Id_Tarifa_Lectura: rango.Id_Tipo_Tarifa },
                    Minimo_M3: rango.Minimo_M3,
                    Maximo_M3: rango.Maximo_M3,
                    Costo_Por_M3: rango.Costo_Por_M3,
                });
                await this.rangoConsumoRepository.save(nuevo);
            }
        }
    }

    // ============================================
    // ENTIDADES SIN SELLO
    // ============================================

    // Los tipos de tarifa (2)
    private async createTarifasLecturaSinSello() {
        const tarifas = [
            { Nombre_Tipo_Tarifa: 'Domipre', Descripcion: 'Tarifa para uso residencial sin sello de calidad', Activa: true },
            { Nombre_Tipo_Tarifa: 'Emprego', Descripcion: 'Tarifa para uso empresarial sin sello de calidad', Activa: true }
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

    // Los rangos especiales para tarifas sin sello (7 rangos de afiliados)
    private async createRangosAfiliadosSinSello() {
        const rangos = [
            { Nombre_Rango: '1-50', Minimo_Afiliados: 1, Maximo_Afiliados: 50 },
            { Nombre_Rango: '51-100', Minimo_Afiliados: 51, Maximo_Afiliados: 100 },
            { Nombre_Rango: '101-150', Minimo_Afiliados: 101, Maximo_Afiliados: 150 },
            { Nombre_Rango: '151-300', Minimo_Afiliados: 151, Maximo_Afiliados: 300 },
            { Nombre_Rango: '301-500', Minimo_Afiliados: 301, Maximo_Afiliados: 500 },
            { Nombre_Rango: '501-1000', Minimo_Afiliados: 501, Maximo_Afiliados: 1000 },
            { Nombre_Rango: '+1000', Minimo_Afiliados: 1001, Maximo_Afiliados: 9999999 },
        ];

        for (const rango of rangos) {
            const existe = await this.rangoAfiliadosSinSelloRepository.findOne({
                where: {
                    Nombre_Rango: rango.Nombre_Rango,
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

    // Los rangos de consumo para tarifas sin sello (4 rangos de consumo por cada tarifa)
    private async createRangosConsumoSinSello() {
        const tarifaDomipre = await this.tarifaLecturaSinSelloRepository.findOne({
            where: { Nombre_Tipo_Tarifa: 'Domipre' }
        });

        const tarifaEmprego = await this.tarifaLecturaSinSelloRepository.findOne({
            where: { Nombre_Tipo_Tarifa: 'Emprego' }
        });

        if (!tarifaDomipre || !tarifaEmprego) {
            console.log('⚠️ No se encontraron las tarifas Domipre o Emprego Sin Sello');
            return;
        }

        const rangos = [
            // Rangos para Domipre Sin Sello
            { Tipo_Tarifa: tarifaDomipre, Minimo_M3: 1, Maximo_M3: 10, Orden: 1 },
            { Tipo_Tarifa: tarifaDomipre, Minimo_M3: 11, Maximo_M3: 30, Orden: 2 },
            { Tipo_Tarifa: tarifaDomipre, Minimo_M3: 31, Maximo_M3: 60, Orden: 3 },
            { Tipo_Tarifa: tarifaDomipre, Minimo_M3: 61, Maximo_M3: 999999, Orden: 4 },

            // Rangos para Emprego Sin Sello
            { Tipo_Tarifa: tarifaEmprego, Minimo_M3: 1, Maximo_M3: 10, Orden: 1 },
            { Tipo_Tarifa: tarifaEmprego, Minimo_M3: 11, Maximo_M3: 30, Orden: 2 },
            { Tipo_Tarifa: tarifaEmprego, Minimo_M3: 31, Maximo_M3: 60, Orden: 3 },
            { Tipo_Tarifa: tarifaEmprego, Minimo_M3: 61, Maximo_M3: 999999, Orden: 4 },
        ];

        for (const rango of rangos) {
            const existe = await this.rangoConsumoSinSelloRepository.findOne({
                where: {
                    Tipo_Tarifa: { Id_Tarifa_Lectura: rango.Tipo_Tarifa.Id_Tarifa_Lectura },
                    Minimo_M3: rango.Minimo_M3,
                    Maximo_M3: rango.Maximo_M3
                }
            });

            if (!existe) {
                const nuevoRango = this.rangoConsumoSinSelloRepository.create(rango);
                await this.rangoConsumoSinSelloRepository.save(nuevoRango);
                const nombreTarifa = rango.Tipo_Tarifa.Id_Tarifa_Lectura === tarifaDomipre.Id_Tarifa_Lectura ? 'Domipre' : 'Emprego';
                console.log(`✅ Rango Consumo Sin Sello ${nombreTarifa} creado: ${rango.Minimo_M3}-${rango.Maximo_M3} M³`);
            }
        }
    }

    // Los cargos fijos para tarifas sin sello (7 rangos de afiliados por cada tarifa)
    private async createCargosFijosSinSello() {
        const tarifaDomipre = await this.tarifaLecturaSinSelloRepository.findOne({
            where: { Nombre_Tipo_Tarifa: 'Domipre' }
        });

        const tarifaEmprego = await this.tarifaLecturaSinSelloRepository.findOne({
            where: { Nombre_Tipo_Tarifa: 'Emprego' }
        });

        if (!tarifaDomipre || !tarifaEmprego) {
            console.log('⚠️ No se encontraron las tarifas Domipre o Emprego Sin Sello');
            return;
        }



        const rangoAfiliados1 = await this.rangoAfiliadosSinSelloRepository.findOne({
            where: { Minimo_Afiliados: 1, Maximo_Afiliados: 50 }
        });

        const rangoAfiliados2 = await this.rangoAfiliadosSinSelloRepository.findOne({
            where: { Minimo_Afiliados: 51, Maximo_Afiliados: 100 }
        });

        const rangoAfiliados3 = await this.rangoAfiliadosSinSelloRepository.findOne({
            where: { Minimo_Afiliados: 101, Maximo_Afiliados: 150 }
        });

        const rangoAfiliados4 = await this.rangoAfiliadosSinSelloRepository.findOne({
            where: { Minimo_Afiliados: 151, Maximo_Afiliados: 300 }
        });

        const rangoAfiliados5 = await this.rangoAfiliadosSinSelloRepository.findOne({
            where: { Minimo_Afiliados: 301, Maximo_Afiliados: 500 }
        });

        const rangoAfiliados6 = await this.rangoAfiliadosSinSelloRepository.findOne({
            where: { Minimo_Afiliados: 501, Maximo_Afiliados: 1000 }
        });

        const rangoAfiliados7 = await this.rangoAfiliadosSinSelloRepository.findOne({
            where: { Minimo_Afiliados: 1001, Maximo_Afiliados: 9999999 }
        });

        if (!rangoAfiliados1 || !rangoAfiliados2 || !rangoAfiliados3 || !rangoAfiliados4 || !rangoAfiliados5 || !rangoAfiliados6 || !rangoAfiliados7) {
            console.log('⚠️ No se encontraron todos los rangos de afiliados Sin Sello');
            return;
        }

        const configuracionCargosFijos = [
            // Cargos fijos para Domipre
            { Tipo_Tarifa: tarifaDomipre, afiliados: rangoAfiliados1, Cargo_Fijo_Por_Mes: 3409 },
            { Tipo_Tarifa: tarifaDomipre, afiliados: rangoAfiliados2, Cargo_Fijo_Por_Mes: 3398 },
            { Tipo_Tarifa: tarifaDomipre, afiliados: rangoAfiliados3, Cargo_Fijo_Por_Mes: 3384 },
            { Tipo_Tarifa: tarifaDomipre, afiliados: rangoAfiliados4, Cargo_Fijo_Por_Mes: 3360 },
            { Tipo_Tarifa: tarifaDomipre, afiliados: rangoAfiliados5, Cargo_Fijo_Por_Mes: 3312 },
            { Tipo_Tarifa: tarifaDomipre, afiliados: rangoAfiliados6, Cargo_Fijo_Por_Mes: 3233 },
            { Tipo_Tarifa: tarifaDomipre, afiliados: rangoAfiliados7, Cargo_Fijo_Por_Mes: 2883 },

            // Cargos fijos para Emprego
            { Tipo_Tarifa: tarifaEmprego, afiliados: rangoAfiliados1, Cargo_Fijo_Por_Mes: 3409 },
            { Tipo_Tarifa: tarifaEmprego, afiliados: rangoAfiliados2, Cargo_Fijo_Por_Mes: 3398 },
            { Tipo_Tarifa: tarifaEmprego, afiliados: rangoAfiliados3, Cargo_Fijo_Por_Mes: 3384 },
            { Tipo_Tarifa: tarifaEmprego, afiliados: rangoAfiliados4, Cargo_Fijo_Por_Mes: 3360 },
            { Tipo_Tarifa: tarifaEmprego, afiliados: rangoAfiliados5, Cargo_Fijo_Por_Mes: 3312 },
            { Tipo_Tarifa: tarifaEmprego, afiliados: rangoAfiliados6, Cargo_Fijo_Por_Mes: 3233 },
            { Tipo_Tarifa: tarifaEmprego, afiliados: rangoAfiliados7, Cargo_Fijo_Por_Mes: 2883 },
        ];

        for (const config of configuracionCargosFijos) {
            // Buscar el rango de afiliados correspondiente
            const rangoAfiliados = await this.rangoAfiliadosSinSelloRepository.findOne({
                where: {
                    Minimo_Afiliados: config.afiliados.Minimo_Afiliados,
                    Maximo_Afiliados: config.afiliados.Maximo_Afiliados
                }
            });

            if (!rangoAfiliados) {
                console.log(`⚠️ Rango de afiliados no encontrado para ${config.afiliados.Minimo_Afiliados}-${config.afiliados.Maximo_Afiliados} afiliados`);
                continue; // Saltar esta configuración y continuar con la siguiente
            }

            // Verificar si el cargo fijo ya existe en la BD
            const existe = await this.cargoFijoTarifasSinSelloRepository.findOne({
                where: {
                    Tipo_Tarifa: { Id_Tarifa_Lectura: config.Tipo_Tarifa.Id_Tarifa_Lectura },
                    Rango_Afiliados: { Id_Rango_Afiliados: rangoAfiliados.Id_Rango_Afiliados }
                }
            });

            // Si no existe, crearlo
            if (!existe) {
                const nuevoCargoFijo = this.cargoFijoTarifasSinSelloRepository.create({
                    Tipo_Tarifa: config.Tipo_Tarifa,
                    Rango_Afiliados: rangoAfiliados,
                    Cargo_Fijo_Por_Mes: config.Cargo_Fijo_Por_Mes,
                    Activo: true
                });
                await this.cargoFijoTarifasSinSelloRepository.save(nuevoCargoFijo);
                console.log(`✅ Cargo fijo creado para ${config.Tipo_Tarifa.Nombre_Tipo_Tarifa} con ${config.afiliados.Minimo_Afiliados}-${config.afiliados.Maximo_Afiliados} afiliados: ₡${config.Cargo_Fijo_Por_Mes}`);
            }
        }
    }

    // Los precios por bloque de consumo para tarifas sin sello (7 rangos de afiliados por cada tarifa y 4 bloques de consumo por cada tarifa) ESTAS UNICAMENTE BOMBEO MIXTO, NO POR GRAVEDAD
    private async createPreciosBloqueConsumoSinSello() {
        const tarifaDomipre = await this.tarifaLecturaSinSelloRepository.findOne({
            where: { Nombre_Tipo_Tarifa: 'Domipre' }
        });

        const tarifaEmprego = await this.tarifaLecturaSinSelloRepository.findOne({
            where: { Nombre_Tipo_Tarifa: 'Emprego' }
        });

        if (!tarifaDomipre || !tarifaEmprego) {
            console.log('⚠️ Tarifa Domipre o Emprego no encontrada');
            return;
        }



        const rangoConsumoDomipre1 = await this.rangoConsumoSinSelloRepository.findOne({
            where: { Tipo_Tarifa: { Id_Tarifa_Lectura: tarifaDomipre.Id_Tarifa_Lectura }, Minimo_M3: 1, Maximo_M3: 10 }
        });

        const rangoConsumoDomipre2 = await this.rangoConsumoSinSelloRepository.findOne({
            where: { Tipo_Tarifa: { Id_Tarifa_Lectura: tarifaDomipre.Id_Tarifa_Lectura }, Minimo_M3: 11, Maximo_M3: 30 }
        });

        const rangoConsumoDomipre3 = await this.rangoConsumoSinSelloRepository.findOne({
            where: { Tipo_Tarifa: { Id_Tarifa_Lectura: tarifaDomipre.Id_Tarifa_Lectura }, Minimo_M3: 31, Maximo_M3: 60 }
        });

        const rangoConsumoDomipre4 = await this.rangoConsumoSinSelloRepository.findOne({
            where: { Tipo_Tarifa: { Id_Tarifa_Lectura: tarifaDomipre.Id_Tarifa_Lectura }, Minimo_M3: 61, Maximo_M3: 999999 }
        });

        if (!rangoConsumoDomipre1 || !rangoConsumoDomipre2 || !rangoConsumoDomipre3 || !rangoConsumoDomipre4) {
            console.log('⚠️ Uno o más rangos de consumo para Domipre Sin Sello no encontrados');
            return;
        }



        const rangoConsumoEmprego1 = await this.rangoConsumoSinSelloRepository.findOne({
            where: { Tipo_Tarifa: { Id_Tarifa_Lectura: tarifaEmprego.Id_Tarifa_Lectura }, Minimo_M3: 1, Maximo_M3: 10 }
        });

        const rangoConsumoEmprego2 = await this.rangoConsumoSinSelloRepository.findOne({
            where: { Tipo_Tarifa: { Id_Tarifa_Lectura: tarifaEmprego.Id_Tarifa_Lectura }, Minimo_M3: 11, Maximo_M3: 30 }
        });

        const rangoConsumoEmprego3 = await this.rangoConsumoSinSelloRepository.findOne({
            where: { Tipo_Tarifa: { Id_Tarifa_Lectura: tarifaEmprego.Id_Tarifa_Lectura }, Minimo_M3: 31, Maximo_M3: 60 }
        });

        const rangoConsumoEmprego4 = await this.rangoConsumoSinSelloRepository.findOne({
            where: { Tipo_Tarifa: { Id_Tarifa_Lectura: tarifaEmprego.Id_Tarifa_Lectura }, Minimo_M3: 61, Maximo_M3: 999999 }
        });

        if (!rangoConsumoEmprego1 || !rangoConsumoEmprego2 || !rangoConsumoEmprego3 || !rangoConsumoEmprego4) {
            console.log('⚠️ Uno o más rangos de consumo para Emprego Sin Sello no encontrados');
            return;
        }



        const rangoAfiliados1 = await this.rangoAfiliadosSinSelloRepository.findOne({
            where: { Minimo_Afiliados: 1, Maximo_Afiliados: 50 }
        });

        const rangoAfiliados2 = await this.rangoAfiliadosSinSelloRepository.findOne({
            where: { Minimo_Afiliados: 51, Maximo_Afiliados: 100 }
        });

        const rangoAfiliados3 = await this.rangoAfiliadosSinSelloRepository.findOne({
            where: { Minimo_Afiliados: 101, Maximo_Afiliados: 150 }
        });

        const rangoAfiliados4 = await this.rangoAfiliadosSinSelloRepository.findOne({
            where: { Minimo_Afiliados: 151, Maximo_Afiliados: 300 }
        });

        const rangoAfiliados5 = await this.rangoAfiliadosSinSelloRepository.findOne({
            where: { Minimo_Afiliados: 301, Maximo_Afiliados: 500 }
        });

        const rangoAfiliados6 = await this.rangoAfiliadosSinSelloRepository.findOne({
            where: { Minimo_Afiliados: 501, Maximo_Afiliados: 1000 }
        });

        const rangoAfiliados7 = await this.rangoAfiliadosSinSelloRepository.findOne({
            where: { Minimo_Afiliados: 1001, Maximo_Afiliados: 9999999 }
        });

        if (!rangoAfiliados1 || !rangoAfiliados2 || !rangoAfiliados3 || !rangoAfiliados4 || !rangoAfiliados5 || !rangoAfiliados6 || !rangoAfiliados7) {
            console.log('⚠️ Uno o más rangos de afiliados no encontrados');
            return;
        }



        const configuracionPrecios = [
            // Bloques para Domipre Sin Sello por bombeo mixto
            // Rango 0-10 M³
            { consumo: rangoConsumoDomipre1, afiliados: rangoAfiliados1, precio: 398 },
            { consumo: rangoConsumoDomipre1, afiliados: rangoAfiliados2, precio: 363 },
            { consumo: rangoConsumoDomipre1, afiliados: rangoAfiliados3, precio: 287 },
            { consumo: rangoConsumoDomipre1, afiliados: rangoAfiliados4, precio: 273 },
            { consumo: rangoConsumoDomipre1, afiliados: rangoAfiliados5, precio: 210 },
            { consumo: rangoConsumoDomipre1, afiliados: rangoAfiliados6, precio: 209 },
            { consumo: rangoConsumoDomipre1, afiliados: rangoAfiliados7, precio: 136 },

            // Rango 11-30 M³
            { consumo: rangoConsumoDomipre2, afiliados: rangoAfiliados1, precio: 458 },
            { consumo: rangoConsumoDomipre2, afiliados: rangoAfiliados2, precio: 417 },
            { consumo: rangoConsumoDomipre2, afiliados: rangoAfiliados3, precio: 330 },
            { consumo: rangoConsumoDomipre2, afiliados: rangoAfiliados4, precio: 314 },
            { consumo: rangoConsumoDomipre2, afiliados: rangoAfiliados5, precio: 241 },
            { consumo: rangoConsumoDomipre2, afiliados: rangoAfiliados6, precio: 241 },
            { consumo: rangoConsumoDomipre2, afiliados: rangoAfiliados7, precio: 156 },

            // Rango 31-60 M³
            { consumo: rangoConsumoDomipre3, afiliados: rangoAfiliados1, precio: 573 },
            { consumo: rangoConsumoDomipre3, afiliados: rangoAfiliados2, precio: 521 },
            { consumo: rangoConsumoDomipre3, afiliados: rangoAfiliados3, precio: 413 },
            { consumo: rangoConsumoDomipre3, afiliados: rangoAfiliados4, precio: 392 },
            { consumo: rangoConsumoDomipre3, afiliados: rangoAfiliados5, precio: 302 },
            { consumo: rangoConsumoDomipre3, afiliados: rangoAfiliados6, precio: 301 },
            { consumo: rangoConsumoDomipre3, afiliados: rangoAfiliados7, precio: 195 },

            // Rango 61+ M³
            { consumo: rangoConsumoDomipre4, afiliados: rangoAfiliados1, precio: 850 },
            { consumo: rangoConsumoDomipre4, afiliados: rangoAfiliados2, precio: 782 },
            { consumo: rangoConsumoDomipre4, afiliados: rangoAfiliados3, precio: 619 },
            { consumo: rangoConsumoDomipre4, afiliados: rangoAfiliados4, precio: 588 },
            { consumo: rangoConsumoDomipre4, afiliados: rangoAfiliados5, precio: 453 },
            { consumo: rangoConsumoDomipre4, afiliados: rangoAfiliados6, precio: 452 },
            { consumo: rangoConsumoDomipre4, afiliados: rangoAfiliados7, precio: 293 },



            // Bloques para Emprego Sin Sello
            // Rango 0-10 M³
            { consumo: rangoConsumoEmprego1, afiliados: rangoAfiliados1, precio: 598 },
            { consumo: rangoConsumoEmprego1, afiliados: rangoAfiliados2, precio: 544 },
            { consumo: rangoConsumoEmprego1, afiliados: rangoAfiliados3, precio: 431 },
            { consumo: rangoConsumoEmprego1, afiliados: rangoAfiliados4, precio: 409 },
            { consumo: rangoConsumoEmprego1, afiliados: rangoAfiliados5, precio: 315 },
            { consumo: rangoConsumoEmprego1, afiliados: rangoAfiliados6, precio: 314 },
            { consumo: rangoConsumoEmprego1, afiliados: rangoAfiliados7, precio: 204 },

            // Rango 11-30 M³
            { consumo: rangoConsumoEmprego2, afiliados: rangoAfiliados1, precio: 687 },
            { consumo: rangoConsumoEmprego2, afiliados: rangoAfiliados2, precio: 626 },
            { consumo: rangoConsumoEmprego2, afiliados: rangoAfiliados3, precio: 495 },
            { consumo: rangoConsumoEmprego2, afiliados: rangoAfiliados4, precio: 471 },
            { consumo: rangoConsumoEmprego2, afiliados: rangoAfiliados5, precio: 362 },
            { consumo: rangoConsumoEmprego2, afiliados: rangoAfiliados6, precio: 361 },
            { consumo: rangoConsumoEmprego2, afiliados: rangoAfiliados7, precio: 234 },

            // Rango 31-60 M³
            { consumo: rangoConsumoEmprego3, afiliados: rangoAfiliados1, precio: 859 },
            { consumo: rangoConsumoEmprego3, afiliados: rangoAfiliados2, precio: 782 },
            { consumo: rangoConsumoEmprego3, afiliados: rangoAfiliados3, precio: 619 },
            { consumo: rangoConsumoEmprego3, afiliados: rangoAfiliados4, precio: 588 },
            { consumo: rangoConsumoEmprego3, afiliados: rangoAfiliados5, precio: 453 },
            { consumo: rangoConsumoEmprego3, afiliados: rangoAfiliados6, precio: 452 },
            { consumo: rangoConsumoEmprego3, afiliados: rangoAfiliados7, precio: 293 },

            // Rango 61+ M³
            { consumo: rangoConsumoEmprego4, afiliados: rangoAfiliados1, precio: 859 },
            { consumo: rangoConsumoEmprego4, afiliados: rangoAfiliados2, precio: 782 },
            { consumo: rangoConsumoEmprego4, afiliados: rangoAfiliados3, precio: 619 },
            { consumo: rangoConsumoEmprego4, afiliados: rangoAfiliados4, precio: 588 },
            { consumo: rangoConsumoEmprego4, afiliados: rangoAfiliados5, precio: 453 },
            { consumo: rangoConsumoEmprego4, afiliados: rangoAfiliados6, precio: 452 },
            { consumo: rangoConsumoEmprego4, afiliados: rangoAfiliados7, precio: 293 },
        ];

        // Iterar sobre cada configuración
        for (const config of configuracionPrecios) {
            // Buscar el rango de consumo correspondiente
            const rangoConsumo = await this.rangoConsumoSinSelloRepository.findOne({
                where: {
                    Tipo_Tarifa: { Id_Tarifa_Lectura: tarifaDomipre.Id_Tarifa_Lectura },
                    Minimo_M3: config.consumo.Minimo_M3,
                    Maximo_M3: config.consumo.Maximo_M3
                }
            });

            // Buscar el rango de afiliados correspondiente
            const rangoAfiliados = await this.rangoAfiliadosSinSelloRepository.findOne({
                where: {
                    Minimo_Afiliados: config.afiliados.Minimo_Afiliados,
                    Maximo_Afiliados: config.afiliados.Maximo_Afiliados
                }
            });

            // Validar que ambos rangos existan
            if (!rangoConsumo || !rangoAfiliados) {
                console.log(`⚠️ Rango no encontrado: ${config.consumo.Minimo_M3}-${config.consumo.Maximo_M3} M³ / ${config.afiliados.Minimo_Afiliados}-${config.afiliados.Maximo_Afiliados} afiliados`);
                continue; // Saltar esta configuración y continuar con la siguiente
            }

            // Verificar si el precio ya existe en la BD
            const existe = await this.precioBloqueConsumoSinSelloRepository.findOne({
                where: {
                    Tipo_Tarifa: { Id_Tarifa_Lectura: tarifaDomipre.Id_Tarifa_Lectura },
                    Rango_Consumo: { Id_Rango_Consumo: rangoConsumo.Id_Rango_Consumo },
                    Rango_Afiliados: { Id_Rango_Afiliados: rangoAfiliados.Id_Rango_Afiliados }
                }
            });

            // Si no existe, crearlo
            if (!existe) {
                const nuevoPrecio = this.precioBloqueConsumoSinSelloRepository.create({
                    Tipo_Tarifa: tarifaDomipre,
                    Rango_Consumo: rangoConsumo,
                    Rango_Afiliados: rangoAfiliados,
                    Precio_Por_M3: config.precio,
                    Activo: true
                });
                await this.precioBloqueConsumoSinSelloRepository.save(nuevoPrecio);
                console.log(`✅ Precio creado: ${config.consumo.Minimo_M3}-${config.consumo.Maximo_M3} M³ * ${config.afiliados.Minimo_Afiliados}-${config.afiliados.Maximo_Afiliados} afiliados = ₡${config.precio}/M³`);
            }
        }
    }



    // ======================================================================
    // ENTIDADES RELACIONADAS CON RECURSOS HÍDRICOS SIN SELLO
    // ======================================================================
    private async createRecursosHidricosSinSello() {
        const recursos = [
            { Nombre: 'Recurso Hidrico Domipre', Activo: true },
            { Nombre: 'Recurso Hidrico Emprego', Activo: true }
        ];

        for (const recurso of recursos) {
            const existe = await this.recursoHidricoSinSelloRepository.findOne({
                where: { Nombre: recurso.Nombre }
            });

            if (!existe) {
                const nuevoRecurso = this.recursoHidricoSinSelloRepository.create(recurso);
                await this.recursoHidricoSinSelloRepository.save(nuevoRecurso);
            }
        }
    }

    private async createBloquesRecursoHidricoSinSello() {
        const recursoHidricoDomipre = await this.recursoHidricoSinSelloRepository.findOne({
            where: { Nombre: 'Recurso Hidrico Domipre' }
        });

        const recursoHidricoEmprego = await this.recursoHidricoSinSelloRepository.findOne({
            where: { Nombre: 'Recurso Hidrico Emprego' }
        });

        if (!recursoHidricoDomipre || !recursoHidricoEmprego) {
            console.log('⚠️ No se encontró el Recurso Hidrico Sin Sello');
            return;
        }

        const bloques = [
            { Recurso_Hidrico: recursoHidricoDomipre, Minimo_M3: 1, Maximo_M3: 15, Orden: 1 },
            { Recurso_Hidrico: recursoHidricoDomipre, Minimo_M3: 16, Maximo_M3: 30, Orden: 2 },
            { Recurso_Hidrico: recursoHidricoDomipre, Minimo_M3: 31, Maximo_M3: 60, Orden: 3 },
            { Recurso_Hidrico: recursoHidricoDomipre, Minimo_M3: 61, Maximo_M3: 999999, Orden: 4 },

            { Recurso_Hidrico: recursoHidricoEmprego, Minimo_M3: 1, Maximo_M3: 20, Orden: 1 },
            { Recurso_Hidrico: recursoHidricoEmprego, Minimo_M3: 21, Maximo_M3: 65, Orden: 2 },
            { Recurso_Hidrico: recursoHidricoEmprego, Minimo_M3: 66, Maximo_M3: 999999, Orden: 3 },
        ];

        for (const bloque of bloques) {
            const existe = await this.bloqueRecursoHidricoSinSelloRepository.findOne({
                where: {
                    Recurso_Hidrico: { Id_Recurso_Hidrico: bloque.Recurso_Hidrico.Id_Recurso_Hidrico },
                    Minimo_M3: bloque.Minimo_M3,
                    Maximo_M3: bloque.Maximo_M3
                }
            });

            if (!existe) {
                const nuevoBloque = this.bloqueRecursoHidricoSinSelloRepository.create(bloque);
                await this.bloqueRecursoHidricoSinSelloRepository.save(nuevoBloque);
            }
        }
    }

    private async createPreciosRecursoHidricoSinSello() {
        // Primero buscar los recursos hídricos por nombre
        const recursoHidricoDomipre = await this.recursoHidricoSinSelloRepository.findOne({
            where: { Nombre: 'Recurso Hidrico Domipre' }
        });

        const recursoHidricoEmprego = await this.recursoHidricoSinSelloRepository.findOne({
            where: { Nombre: 'Recurso Hidrico Emprego' }
        });

        if (!recursoHidricoDomipre || !recursoHidricoEmprego) {
            console.log('⚠️ No se encontraron los Recursos Hídricos Sin Sello');
            return;
        }

        // Buscar bloques usando el ID del recurso hídrico y cargar las relaciones
        const bloqueRecursoHidricoDomipre1 = await this.bloqueRecursoHidricoSinSelloRepository.findOne({
            where: { 
                Recurso_Hidrico: { Id_Recurso_Hidrico: recursoHidricoDomipre.Id_Recurso_Hidrico }, 
                Minimo_M3: 1, 
                Maximo_M3: 15 
            },
            relations: ['Recurso_Hidrico']
        });

        const bloqueRecursoHidricoDomipre2 = await this.bloqueRecursoHidricoSinSelloRepository.findOne({
            where: { 
                Recurso_Hidrico: { Id_Recurso_Hidrico: recursoHidricoDomipre.Id_Recurso_Hidrico }, 
                Minimo_M3: 16, 
                Maximo_M3: 30 
            },
            relations: ['Recurso_Hidrico']
        });

        const bloqueRecursoHidricoDomipre3 = await this.bloqueRecursoHidricoSinSelloRepository.findOne({
            where: { 
                Recurso_Hidrico: { Id_Recurso_Hidrico: recursoHidricoDomipre.Id_Recurso_Hidrico }, 
                Minimo_M3: 31, 
                Maximo_M3: 60 
            },
            relations: ['Recurso_Hidrico']
        });

        const bloqueRecursoHidricoDomipre4 = await this.bloqueRecursoHidricoSinSelloRepository.findOne({
            where: { 
                Recurso_Hidrico: { Id_Recurso_Hidrico: recursoHidricoDomipre.Id_Recurso_Hidrico }, 
                Minimo_M3: 61, 
                Maximo_M3: 999999 
            },
            relations: ['Recurso_Hidrico']
        });

        if (!bloqueRecursoHidricoDomipre1 || !bloqueRecursoHidricoDomipre2 || !bloqueRecursoHidricoDomipre3 || !bloqueRecursoHidricoDomipre4) {
            console.log('⚠️ No se encontraron todos los bloques de Domipre para Precio Recurso Hídrico Sin Sello');
            return;
        }



        const bloqueRecursoHidricoEmprego1 = await this.bloqueRecursoHidricoSinSelloRepository.findOne({
            where: { 
                Recurso_Hidrico: { Id_Recurso_Hidrico: recursoHidricoEmprego.Id_Recurso_Hidrico }, 
                Minimo_M3: 1,
                Maximo_M3: 20 
            },
            relations: ['Recurso_Hidrico']
        });

        const bloqueRecursoHidricoEmprego2 = await this.bloqueRecursoHidricoSinSelloRepository.findOne({
            where: { 
                Recurso_Hidrico: { Id_Recurso_Hidrico: recursoHidricoEmprego.Id_Recurso_Hidrico }, 
                Minimo_M3: 21, 
                Maximo_M3: 65 
            },
            relations: ['Recurso_Hidrico']
        });

        const bloqueRecursoHidricoEmprego3 = await this.bloqueRecursoHidricoSinSelloRepository.findOne({
            where: { 
                Recurso_Hidrico: { Id_Recurso_Hidrico: recursoHidricoEmprego.Id_Recurso_Hidrico }, 
                Minimo_M3: 66, 
                Maximo_M3: 999999 
            },
            relations: ['Recurso_Hidrico']
        });

        if (!bloqueRecursoHidricoEmprego1 || !bloqueRecursoHidricoEmprego2 || !bloqueRecursoHidricoEmprego3) {
            console.log('⚠️ No se encontraron todos los bloques de Emprego para Precio Recurso Hídrico Sin Sello');
            return;
        }

        const precios = [
            // Precios por M3 de recurso hídrico para Domipre Sin Sello por bombeo mixto
            { Bloque_Recurso_Hidrico: bloqueRecursoHidricoDomipre1, Precio_Por_M3: 42, Activo: true },
            { Bloque_Recurso_Hidrico: bloqueRecursoHidricoDomipre2, Precio_Por_M3: 45, Activo: true },
            { Bloque_Recurso_Hidrico: bloqueRecursoHidricoDomipre3, Precio_Por_M3: 50, Activo: true },
            { Bloque_Recurso_Hidrico: bloqueRecursoHidricoDomipre4, Precio_Por_M3: 57, Activo: true },

            // Precios por M3 de recurso hídrico para Emprego Sin Sello por bombeo mixto
            { Bloque_Recurso_Hidrico: bloqueRecursoHidricoEmprego1, Precio_Por_M3: 42, Activo: true },
            { Bloque_Recurso_Hidrico: bloqueRecursoHidricoEmprego2, Precio_Por_M3: 49, Activo: true },
            { Bloque_Recurso_Hidrico: bloqueRecursoHidricoEmprego3, Precio_Por_M3: 58, Activo: true },
        ]

        for (const precio of precios) {
            const existe = await this.precioRecursoHidricoSinSelloRepository.findOne({
                where: {
                    Bloque_Recurso_Hidrico: { Id_Bloque_Recurso_Hidrico: precio.Bloque_Recurso_Hidrico.Id_Bloque_Recurso_Hidrico },
                    Precio_Por_M3: precio.Precio_Por_M3
                }
            });

            if (!existe) {
                const nuevoPrecio = this.precioRecursoHidricoSinSelloRepository.create(precio);
                await this.precioRecursoHidricoSinSelloRepository.save(nuevoPrecio);

                if (precio.Bloque_Recurso_Hidrico.Recurso_Hidrico.Nombre === 'Recurso Hidrico Domipre') {
                    console.log(`✅ Precio Recurso Hidrico Domipre Sin Sello creado: ₡${precio.Precio_Por_M3}/M³`);
                } else if (precio.Bloque_Recurso_Hidrico.Recurso_Hidrico.Nombre === 'Recurso Hidrico Emprego') {
                    console.log(`✅ Precio Recurso Hidrico Emprego Sin Sello creado: ₡${precio.Precio_Por_M3}/M³`);
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