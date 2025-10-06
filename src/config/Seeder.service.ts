import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Permiso } from 'src/Modules/Usuarios/UsuarioEntities/Permiso.Entity';
import { Usuario } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';
import { UsuarioRol } from 'src/Modules/Usuarios/UsuarioEntities/UsuarioRol.Entity';
import { EstadoProveedor } from 'src/Modules/Proveedores/ProveedorEntities/EstadoProveedor.Entity';
import { TipoProveedor } from 'src/Modules/Proveedores/ProveedorEntities/TipoProveedor.Entity';
import { ProyectoEstado } from 'src/Modules/Proyectos/ProyectoEntities/EstadoProyecto.Entity';
import { EstadoSolicitud } from 'src/Modules/Solicitudes/SolicitudEntities/EstadoSolicitud.Entity';
import { EstadoAfiliado } from 'src/Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity';
import { TipoAfiliado } from 'src/Modules/Afiliados/AfiliadoEntities/TipoAfiliado.Entity';
import { EstadoMaterial } from 'src/Modules/Inventario/InventarioEntities/EstadoMaterial.Entity';
import { Categoria } from 'src/Modules/Inventario/InventarioEntities/Categoria.Entity';
import { EstadoUnidadMedicion } from 'src/Modules/Inventario/InventarioEntities/EstadoUnidadMedicion.Entity';
import { UnidadMedicion } from 'src/Modules/Inventario/InventarioEntities/UnidadMedicion.Entity';
import { EstadoCalidadAgua } from 'src/Modules/CalidadAgua/CalidadAguaEntities/EstadoCalidadAgua.Entity';
import { EstadoCategoria } from 'src/Modules/Inventario/InventarioEntities/EstadoCategoria.Entity';

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
        @InjectRepository(TipoProveedor)
        private readonly tipoProveedorRepository: Repository<TipoProveedor>,
        @InjectRepository(ProyectoEstado)
        private readonly proyectoEstadoRepository: Repository<ProyectoEstado>,
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
        @InjectRepository(EstadoCalidadAgua)
        private readonly estadoCalidadAguaRepository: Repository<EstadoCalidadAgua>,
    ) {}

    async onModuleInit() {
        await this.createInitialData();
        await this.createDefaultEstadosProveedor();
        await this.createDefaultTiposProveedor();
        await this.createDefaultEstadosProyecto();
        await this.createDefaultEstadosSolicitud();
        await this.createDefaultEstadosAfiliado();
        await this.createDefaultTiposAfiliado();
        await this.createDefaultEstadosMaterial();
        await this.createDefaultEstadosCategoria();
        await this.createDefaultCategoriasMaterial();
        await this.createDefaultEstadosUnidadMedicion();
        await this.createDefaultUnidadesMedicion();
        await this.createDefaultEstadosCalidadAgua();
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

    private async createDefaultEstadosSolicitud(){
        const estados = [
            { Id_Estado_Solicitud: 1, Nombre_Estado: 'Pendiente' },
            { Id_Estado_Solicitud: 2, Nombre_Estado: 'En Revisión' },
            { Id_Estado_Solicitud: 3, Nombre_Estado: 'Aprobada' },
            { Id_Estado_Solicitud: 4, Nombre_Estado: 'En espera' },
            { Id_Estado_Solicitud: 5, Nombre_Estado: 'Completada' },
            { Id_Estado_Solicitud: 6, Nombre_Estado: 'Rechazada' },
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

    private async createDefaultTiposProveedor() {
        const tipos = [
            { Id_Tipo_Proveedor: 1, Tipo_Proveedor: 'Físico' },
            { Id_Tipo_Proveedor: 2, Tipo_Proveedor: 'Jurídico' }
        ];

        for (const tipo of tipos) {
            const existe = await this.tipoProveedorRepository.findOne({
                where: { Id_Tipo_Proveedor: tipo.Id_Tipo_Proveedor }
            });

            if (!existe) {
                const nuevoTipo = this.tipoProveedorRepository.create(tipo);
                await this.tipoProveedorRepository.save(nuevoTipo);
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
                    nuevaCategoria.Usuario_Creador = adminUser;
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
                    nuevaUnidad.Usuario_Creador = adminUser;
                }

                await this.unidadMedicionRepository.save(nuevaUnidad);
            }
        }
    }

    private async createDefaultEstadosCalidadAgua() {
        const estados = [
            { Id_Estado_Calidad_Agua: 1, Nombre_Estado_Calidad_Agua: 'Visible' },
            { Id_Estado_Calidad_Agua: 2, Nombre_Estado_Calidad_Agua: 'Invisible' },
        ];

        for (const estado of estados) {
            const existe = await this.estadoCalidadAguaRepository.findOne({
                where: { Id_Estado_Calidad_Agua: estado.Id_Estado_Calidad_Agua }
            });

            if (!existe) {
                const nuevoEstado = this.estadoCalidadAguaRepository.create(estado);
                await this.estadoCalidadAguaRepository.save(nuevoEstado);
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

            // Permiso de lectura para bitacora
            await this.createPermisoIfNotExists({
                Modulo: 'bitacora',
                Ver: true,        
                Editar: false,
            });
            // Sin permisos para bitacora
            await this.createPermisoIfNotExists({
                Modulo: 'bitacora',
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
                { Modulo: 'bitacora', Ver: true, Editar: false }
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