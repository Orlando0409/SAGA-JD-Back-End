import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Permiso } from 'src/Modules/Usuarios/UsuarioEntities/Permiso.Entity';
import { UserEntity } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';
import { UserRol } from 'src/Modules/Usuarios/UsuarioEntities/UsuarioRol.Entity';


@Injectable()
export class SeederService implements OnModuleInit {
    constructor(
        @InjectRepository(UserRol)
        private readonly rolRepository: Repository<UserRol>,
        @InjectRepository(Permiso)
        private readonly permisoRepository: Repository<Permiso>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async onModuleInit() {
        await this.createInitialData();
    }

    private async createInitialData() {
        try {
            // Crear en orden: rol → permisos → asignar permisos → usuario
            await this.createAdminRole();
            await this.createPermisos();
            await this.assignPermisosToAdminRole(); // ✅ NUEVO: Asignar permisos
            await this.createAdminUser();

        } 
        catch (error) {
            console.error('❌ Error en seeder:', error);
        }
    }

    private async createPermisos() {
        
        const modulos = [
            'usuarios',
            'roles',
            'proyectos',
            'abonados',
            'facturas',
            'inventario',
            'proveedores',
            'solicitudes'
        ];

        for (const modulo of modulos) {
            // Permiso de solo lectura
            await this.createPermisoIfNotExists({
                modulo,
                Ver: true,
                Editar: false,
                descripcion: `Permiso de lectura para ${modulo}`
            });

            // Sin permisos
            await this.createPermisoIfNotExists({
                modulo,
                Ver: false,
                Editar: false,
                descripcion: `Sin permisos para ${modulo}`
            });

            // Permiso completo (ver y editar)
            await this.createPermisoIfNotExists({
                modulo,
                Ver: true,
                Editar: true,
                descripcion: `Permiso completo para ${modulo}`
            });
        }
    }

    private async createPermisoIfNotExists(permisoData: {
        modulo: string;
        Ver: boolean;
        Editar: boolean;
        descripcion: string;
    }) {
        const permisoExistente = await this.permisoRepository.findOne({
            where: {
                modulo: permisoData.modulo,
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
            relations: ['permisos']
        });

        if (!adminRole) {
            return;
        }

        // Obtener todos los permisos disponibles
        const todosLosPermisos = await this.permisoRepository.find(
            {
                where: {
                    Ver: true,
                    Editar: true
                },
            }
        );

        // Verificar si ya tiene permisos asignados
        if (adminRole.permisos && adminRole.permisos.length > 0) {
            // Verificar si tiene TODOS los permisos
            if (adminRole.permisos.length === todosLosPermisos.length) {
                return;
            }
        }

        // Asignar los permisos al rol Administrador
        adminRole.permisos = todosLosPermisos;
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
                const hashedPassword = await bcrypt.hash('admin123', 10);
                
                const adminUser = this.userRepository.create({
                    Nombre_Usuario: 'admin',
                    Correo_Electronico: 'admin@saga.com',
                    Contraseña: hashedPassword,
                    id_rol: adminRole.Id_Rol
                });

                await this.userRepository.save(adminUser);
            } 
        } 
    }
}