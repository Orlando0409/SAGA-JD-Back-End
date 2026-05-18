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
            await this.createDefaultEstadosReporte();
            await this.createDefaultEstadosSugerencia();
            await this.createDefaultEstadosQueja();
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

    private async createPermisos() {
        const modulos = [
            'usuarios',
            'qsr'
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