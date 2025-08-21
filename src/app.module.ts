import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from './Modules/Usuarios/Entity/User.Entity';
import { UserRol } from './Modules/Usuarios/Entity/UserRol';
import { ProyectoModule } from './Modules/Proyectos/proyecto.module';
import { AbonadosModule } from './Modules/Abonados/abonados.module';
import { FacturaModule } from './Modules/Facturas/factura.module';
import { InventarioModule } from './Modules/Inventario/inventario.module';
import { ProveedorModule } from './Modules/Proveedores/proveedor.module';
import { UsuariosModule } from './Modules/Usuarios/Module/usuarios.module';
import { RolesModule } from './Modules/Usuarios/Module/roles.module';
import { SolicitudEstado } from './Modules/Solicitudes/SolicitudEntities/EstadoSolicitud.Entity';
import { ProjectStatus } from './Modules/Proyectos/ProyectoEntities/ProjectStatus.Entity';
import { ProjectEntity } from './Modules/Proyectos/ProyectoEntities/Project.Entity';
import { Permiso } from './Modules/Usuarios/Entity/Permiso.Entity';
import { SolicitudAfiliacionModule } from './Modules/Solicitudes/Modules/solicitudAfiliacion.module';
import { SolicitudEntity } from './Modules/Solicitudes/SolicitudEntities/Solicitud.Entity';
import { AuthModule } from './auth/module/Auth.module';
import { JwtAuthGuard } from './auth/Guard/JwtGuard';
import { RolesGuard } from './auth/Guard/RolesGuards';
import { PermisosGuard } from './auth/Guard/PermisosGuard';
import { SeenderModule } from './config/Seender.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject:[ConfigService],

      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: [ProjectEntity, ProjectStatus, UserEntity,UserRol,Permiso, SolicitudEntity, SolicitudEstado],
        synchronize: false, 
      }),
    }),
    ProyectoModule,
    AbonadosModule,
    FacturaModule,
    InventarioModule,
    ProveedorModule,
    UsuariosModule,
    SolicitudAfiliacionModule,
    RolesModule,
    AuthModule,
    SeenderModule,

  ],
  controllers: [],
  providers: [
        {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, //  Autenticación JWT global
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, //  Verificación de roles global
    },
    {
      provide: APP_GUARD,
      useClass: PermisosGuard, //  Verificación de permisos global
    },
  ],
})
export class AppModule {}