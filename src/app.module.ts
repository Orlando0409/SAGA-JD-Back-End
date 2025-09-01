import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProyectoModule } from './Modules/Proyectos/proyecto.module';
import { AbonadosModule } from './Modules/Abonados/abonados.module';
import { FacturaModule } from './Modules/Facturas/factura.module';
import { InventarioModule } from './Modules/Inventario/inventario.module';
import { ProveedorModule } from './Modules/Proveedores/proveedor.module';
import { SolicitudAfiliacionModule } from './Modules/Solicitudes/Modules/solicitudAfiliacion.module';
import { SolicitudCambioMediadorModule } from './Modules/Solicitudes/Modules/solicitudCambioMedidor.module';
import { SolicitudDesconexionModule } from './Modules/Solicitudes/Modules/solicitudDesconexion.module';
import { AuthModule } from './Modules/auth/Auth.module';
import { JwtAuthGuard } from './Modules/auth/Guard/JwtGuard';
import { RolesGuard } from './Modules/auth/Guard/RolesGuards';
import { PermisosGuard } from './Modules/auth/Guard/PermisosGuard';
import { SeenderModule } from './config/Seender.module';
import { SolicitudEstado } from './Modules/Solicitudes/SolicitudEntities/EstadoSolicitud.Entity';
import { SolicitudAfiliacion, SolicitudCambioMedidor, SolicitudDesconexion, SolicitudEntity } from './Modules/Solicitudes/SolicitudEntities/Solicitud.Entity';
import { RolesModule } from './Modules/Usuarios/Modules/roles.module';
import { UsuariosModule } from './Modules/Usuarios/Modules/usuarios.module';
import { Permiso } from './Modules/Usuarios/UsuarioEntities/Permiso.Entity';
import { UserEntity } from './Modules/Usuarios/UsuarioEntities/Usuario.Entity';
import { UserRol } from './Modules/Usuarios/UsuarioEntities/UsuarioRol.Entity';
import { Proyecto } from './Modules/Proyectos/ProyectoEntities/Proyecto.Entity';
import { ProyectoEstado } from './Modules/Proyectos/ProyectoEntities/EstadoProyecto.Entity';
import { CalidadAguaModule } from './Modules/CalidadAgua/calidadAgua.module';
import { CalidadAgua } from './Modules/CalidadAgua/CalidadAguaEntities/CalidadAgua.Entity';
import { DropboxModule } from './Dropbox/Files/DropboxFiles.module';

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
        entities: [UserEntity, UserRol, Permiso,
        SolicitudEntity, SolicitudAfiliacion, SolicitudCambioMedidor,
        SolicitudDesconexion, SolicitudEstado, Proyecto, ProyectoEstado,
        CalidadAgua],
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
    SolicitudDesconexionModule,
    SolicitudCambioMediadorModule,
    RolesModule,
    AuthModule,
    SeenderModule,
    DropboxModule,
    CalidadAguaModule
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