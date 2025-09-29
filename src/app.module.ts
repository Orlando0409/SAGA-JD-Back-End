import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProyectoModule } from './Modules/Proyectos/proyecto.module';
import { FacturaModule } from './Modules/Facturas/factura.module';
import { InventarioModule } from './Modules/Inventario/inventario.module';
import { ProveedorModule } from './Modules/Proveedores/proveedor.module';
import { EstadoProveedor } from './Modules/Proveedores/ProveedorEntities/EstadoProveedor.Entity';
import { AuthModule } from './Modules/auth/Auth.module';
import { JwtAuthGuard } from './Modules/auth/Guard/JwtGuard';
import { RolesGuard } from './Modules/auth/Guard/RolesGuards';
import { PermisosGuard } from './Modules/auth/Guard/PermisosGuard';
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
import { EstadoAfiliado } from './Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity';
import { Solicitud, SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica, SolicitudAsociadoFisica, SolicitudAsociadoJuridica, SolicitudCambioMedidorFisica, SolicitudCambioMedidorJuridica, SolicitudDesconexionFisica, SolicitudDesconexionJuridica, SolicitudFisica, SolicitudJuridica } from './Modules/Solicitudes/SolicitudEntities/Solicitud.Entity';
import { SolicitudAsociadoFisicaModule } from './Modules/Solicitudes/Fisica/Modules/solicitudAsociado.module';
import { SolicitudCambioMedidorFisicaModule } from './Modules/Solicitudes/Fisica/Modules/solicitudCambioMedidor.module';
import { SolicitudDesconexionFisicaModule } from './Modules/Solicitudes/Fisica/Modules/solicitudDesconexion.module';
import { SolicitudAfiliacionFisicaModule } from './Modules/Solicitudes/Fisica/Modules/solicitudAfiliacion.module';
import { SolicitudAfiliacionJuridicaModule } from './Modules/Solicitudes/Juridica/Modules/solicitudAfiliacion.module';
import { SolicitudDesconexionJuridicaModule } from './Modules/Solicitudes/Juridica/Modules/solicitudDesconexion.module';
import { SolicitudCambioMedidorJuridicaModule } from './Modules/Solicitudes/Juridica/Modules/solicitudCambioMedidor.module';
import { SolicitudAsociadoJuridicaModule } from './Modules/Solicitudes/Juridica/Modules/solicitudAsociado.module';
import { TipoAfiliado } from './Modules/Afiliados/AfiliadoEntities/TipoAfiliado.Entity';
import { AfiliadosModule } from './Modules/Afiliados/afiliados.module';
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from './Modules/Afiliados/AfiliadoEntities/Afiliado.Entity';
import { SolicitudesModule } from './Modules/Solicitudes/solicitudes.module';
import { Acta } from './Modules/Actas/ActaEntities/Actas.Entity';
import { ArchivoActa } from './Modules/Actas/ActaEntities/ArchivoActa.Entity';
import { ActasModule } from './Modules/Actas/actas.module';
import { Material } from './Modules/Inventario/InventarioEntities/Material.Entity';
import { EstadoMaterial } from './Modules/Inventario/InventarioEntities/EstadoMaterial.Entity';
import { Categoria } from './Modules/Inventario/InventarioEntities/Categoria.Entity';
import { MaterialCategoria } from './Modules/Inventario/InventarioEntities/MaterialCategoria.Entity';
import { UnidadMedicion } from './Modules/Inventario/InventarioEntities/UnidadMedicion.Entity';
import { EstadoUnidadMedicion } from './Modules/Inventario/InventarioEntities/EstadoUnidadMedicion.Entity';
import { EstadoCalidadAgua } from './Modules/CalidadAgua/CalidadAguaEntities/EstadoCalidadAgua.Entity';
import { SeederModule } from './config/Seeder.module';
import { ProveedorEntity, ProveedorFisico, ProveedorJuridico } from './Modules/Proveedores/ProveedorEntities/Proveedor.Entity';

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
        entities: [Solicitud,
        SolicitudFisica, SolicitudJuridica, SolicitudAfiliacionFisica, SolicitudCambioMedidorFisica,
        SolicitudDesconexionFisica, SolicitudAsociadoFisica, SolicitudAfiliacionJuridica,
        SolicitudDesconexionJuridica, SolicitudCambioMedidorJuridica, SolicitudAsociadoJuridica,
        EstadoSolicitud, EstadoAfiliado, TipoAfiliado, Afiliado, AfiliadoFisico, AfiliadoJuridico,
        UserEntity, UserRol, Permiso, ProveedorEntity, EstadoProveedor, ProveedorFisico, ProveedorJuridico,
        ProyectoEstado, Proyecto, CalidadAgua, EstadoCalidadAgua, Acta, ArchivoActa, Material, EstadoMaterial,
        Categoria, MaterialCategoria, EstadoUnidadMedicion, UnidadMedicion],
        synchronize: false,
      }),
    }),
    SeederModule,
    AuthModule,
    RolesModule,
    UsuariosModule,
    ProveedorModule,
    InventarioModule,
    FacturaModule,
    AfiliadosModule,
    SolicitudesModule,
    CalidadAguaModule,
    ProyectoModule,
    ActasModule,
    SolicitudAfiliacionFisicaModule,
    SolicitudAfiliacionJuridicaModule,
    SolicitudDesconexionFisicaModule,
    SolicitudDesconexionJuridicaModule,
    SolicitudCambioMedidorFisicaModule,
    SolicitudCambioMedidorJuridicaModule,
    SolicitudAsociadoFisicaModule,
    SolicitudAsociadoJuridicaModule,
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