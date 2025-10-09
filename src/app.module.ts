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
import { Usuario } from './Modules/Usuarios/UsuarioEntities/Usuario.Entity';
import { UsuarioRol } from './Modules/Usuarios/UsuarioEntities/UsuarioRol.Entity';
import { Proyecto } from './Modules/Proyectos/ProyectoEntities/Proyecto.Entity';
import { ProyectoEstado } from './Modules/Proyectos/ProyectoEntities/EstadoProyecto.Entity';
import { CalidadAguaModule } from './Modules/CalidadAgua/calidadAgua.module';
import { CalidadAgua } from './Modules/CalidadAgua/CalidadAguaEntities/CalidadAgua.Entity';
import { ReportesModule } from './Modules/Reportes/reportes.module';
import { ReportesEntity } from './Modules/Reportes/ReportesEntity/ReportesEntity';
import { EstadoReporte } from './Modules/Reportes/ReportesEntity/EstadoReporte';
import { SugerenciaModule } from './Modules/Sugerencias/sugerencia.module';
import { SugerenciaEntity } from './Modules/Sugerencias/Entity/SugerenciaEntity';
import { Estado_Sugerencia } from './Modules/Sugerencias/Entity/EstadoSugerencia';
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
import { SeederModule } from './config/Seeder.module';
import { Categoria } from './Modules/Inventario/InventarioEntities/Categoria.Entity';
import { MaterialCategoria } from './Modules/Inventario/InventarioEntities/MaterialCategoria.Entity';
import { UnidadMedicion } from './Modules/Inventario/InventarioEntities/UnidadMedicion.Entity';
import { EstadoUnidadMedicion } from './Modules/Inventario/InventarioEntities/EstadoUnidadMedicion.Entity';
import { EstadoCategoria } from './Modules/Inventario/InventarioEntities/EstadoCategoria.Entity';
import { Proveedor, ProveedorFisico, ProveedorJuridico } from './Modules/Proveedores/ProveedorEntities/Proveedor.Entity';
import { MovimientoInventario } from './Modules/Inventario/InventarioEntities/Movimiento.Entity';
import { TipoProveedor } from './Modules/Proveedores/ProveedorEntities/TipoProveedor.Entity';
import { QuejasModule } from './Modules/Quejas/quejas.module';
import { QuejasEntity } from './Modules/Quejas/Entity/QuejasEntity';
import { EstadoQueja } from './Modules/Quejas/Entity/EstadoQueja';


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
        entities: [
        Usuario, UsuarioRol, Permiso,
        Solicitud, SolicitudFisica, SolicitudJuridica, EstadoSolicitud,
        SolicitudAfiliacionFisica, SolicitudCambioMedidorFisica, SolicitudDesconexionFisica, SolicitudAsociadoFisica,
        SolicitudAfiliacionJuridica, SolicitudDesconexionJuridica, SolicitudCambioMedidorJuridica, SolicitudAsociadoJuridica,
        Afiliado, AfiliadoFisico, AfiliadoJuridico, EstadoAfiliado, TipoAfiliado,
        Proveedor, EstadoProveedor, TipoProveedor, ProveedorFisico, ProveedorJuridico,
        Proyecto, ProyectoEstado,
        CalidadAgua,
        Acta, ArchivoActa,
        Material, EstadoMaterial, Categoria, EstadoCategoria, MaterialCategoria, UnidadMedicion, EstadoUnidadMedicion, MovimientoInventario
        ],
        synchronize: true,
        dropSchema: false,
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
    ReportesModule,
    SugerenciaModule,
    QuejasModule,
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