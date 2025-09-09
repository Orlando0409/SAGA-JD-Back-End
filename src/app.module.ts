import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProyectoModule } from './Modules/Proyectos/proyecto.module';
import { AbonadosModule } from './Modules/Afiliados/Modules/abonados.module';
import { AsociadosModule } from './Modules/Afiliados/Modules/asociados.module';
import { FacturaModule } from './Modules/Facturas/factura.module';
import { InventarioModule } from './Modules/Inventario/inventario.module';
import { ProveedorModule } from './Modules/Proveedores/proveedor.module';
import { AuthModule } from './Modules/auth/Auth.module';
import { JwtAuthGuard } from './Modules/auth/Guard/JwtGuard';
import { RolesGuard } from './Modules/auth/Guard/RolesGuards';
import { PermisosGuard } from './Modules/auth/Guard/PermisosGuard';
import { SeederModule } from './config/Seeder.module';
import { EstadoSolicitud } from './Modules/Solicitudes/SolicitudEntities/EstadoSolicitud.Entity';
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
import { Abonado } from './Modules/Afiliados/AfiliadoEntities/Abonado.Entity';
import { Asociado } from './Modules/Afiliados/AfiliadoEntities/Asociado.Entity';
import { EstadoAfiliado } from './Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity';
import { Solicitud, SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica, SolicitudAsociadoFisica, SolicitudAsociadoJuridica, SolicitudCambioMedidorFisica, SolicitudCambioMedidorJuridica, SolicitudDesconexionFisica, SolicitudDesconexionJuridica, SolicitudFisica } from './Modules/Solicitudes/SolicitudEntities/Solicitud.Entity';
import { SolicitudAsociadoFisicaModule } from './Modules/Solicitudes/Fisica/Modules/solicitudAsociado.module';
import { SolicitudCambioMedidorFisicaModule } from './Modules/Solicitudes/Fisica/Modules/solicitudCambioMedidor.module';
import { SolicitudDesconexionFisicaModule } from './Modules/Solicitudes/Fisica/Modules/solicitudDesconexion.module';
import { SolicitudAfiliacionFisicaModule } from './Modules/Solicitudes/Fisica/Modules/solicitudAfiliacion.module';
import { SolicitudAfiliacionJuridicaModule } from './Modules/Solicitudes/Juridica/Modules/solicitudAfiliacion.module';
import { SolicitudDesconexionJuridicaModule } from './Modules/Solicitudes/Juridica/Modules/solicitudDesconexion.module';
import { SolicitudCambioMedidorJuridicaModule } from './Modules/Solicitudes/Juridica/Modules/solicitudCambioMedidor.module';
import { SolicitudAsociadoJuridicaModule } from './Modules/Solicitudes/Juridica/Modules/solicitudAsociado.module';

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
        entities: [UserEntity, UserRol, Permiso, Solicitud,
        SolicitudFisica, SolicitudAfiliacionFisica, SolicitudCambioMedidorFisica,
        SolicitudDesconexionFisica, SolicitudAsociadoFisica, SolicitudAfiliacionJuridica,
        SolicitudDesconexionJuridica, SolicitudCambioMedidorJuridica, SolicitudAsociadoJuridica,
        EstadoSolicitud, Proyecto, ProyectoEstado, CalidadAgua, Abonado, Asociado, EstadoAfiliado],
        synchronize: false,
      }),
    }),
    ProyectoModule,
    AbonadosModule,
    AsociadosModule,
    FacturaModule,
    InventarioModule,
    ProveedorModule,
    UsuariosModule,
    SolicitudAfiliacionFisicaModule,
    SolicitudAfiliacionJuridicaModule,
    SolicitudDesconexionFisicaModule,
    SolicitudDesconexionJuridicaModule,
    SolicitudCambioMedidorFisicaModule,
    SolicitudCambioMedidorJuridicaModule,
    SolicitudAsociadoFisicaModule,
    SolicitudAsociadoJuridicaModule,
    RolesModule,
    AuthModule,
    SeederModule,
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