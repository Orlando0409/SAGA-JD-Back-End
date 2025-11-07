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
import { EstadoProyecto } from './Modules/Proyectos/ProyectoEntities/EstadoProyecto.Entity';
import { CalidadAguaModule } from './Modules/CalidadAgua/calidadAgua.module';
import { CalidadAgua } from './Modules/CalidadAgua/CalidadAguaEntities/CalidadAgua.Entity';
import { EstadoReporte } from './Modules/Reportes/ReporteEntities/EstadoReporte';
import { SugerenciaModule } from './Modules/Sugerencias/sugerencia.module';
import { EstadoAfiliado } from './Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity';
import { Solicitud, SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica, SolicitudAsociadoFisica, SolicitudAsociadoJuridica, SolicitudCambioMedidorFisica, SolicitudCambioMedidorJuridica, SolicitudDesconexionFisica, SolicitudDesconexionJuridica, SolicitudFisica, SolicitudJuridica } from './Modules/Solicitudes/SolicitudEntities/Solicitud.Entity';
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
import { EstadoCategoria } from './Modules/Inventario/InventarioEntities/EstadoCategoria.Entity';
import { Proveedor, ProveedorFisico, ProveedorJuridico } from './Modules/Proveedores/ProveedorEntities/Proveedor.Entity';
import { MovimientoInventario } from './Modules/Inventario/InventarioEntities/Movimiento.Entity';
import { QuejasModule } from './Modules/Quejas/quejas.module';
import { FAQModule } from './Modules/FAQ/faq.module';
import { FAQEntity } from './Modules/FAQ/FAQEntities/FAQ.Entity';
import { EstadoQueja } from './Modules/Quejas/QuejaEntities/EstadoQueja';
import { SeederModule } from './Config/Seeder.module';
import { EstadoMedidor } from './Modules/Inventario/InventarioEntities/EstadoMedidor.Entity';
import { Medidor } from './Modules/Inventario/InventarioEntities/Medidor.Entity';
import { Auditoria } from './Modules/Auditoria/AuditoriaEntities/Auditoria.Entities';
import { AuditoriaModule } from './Modules/Auditoria/auditoria.module';
import { ReportesModule } from './Modules/Reportes/reportes.module';
import { Reporte } from './Modules/Reportes/ReporteEntities/Reportes.Entity';
import { EstadoSugerencia } from './Modules/Sugerencias/SugerenciaEntities/EstadoSugerencia';
import { Sugerencia } from './Modules/Sugerencias/SugerenciaEntities/Sugerencia.Entity';
import { Queja } from './Modules/Quejas/QuejaEntities/QuejasEntity'; import { Lectura } from './Modules/Lecturas/LecturaEntities/Lectura.Entity';
import { LecturaModule } from './Modules/Lecturas/lectura.module';
import { TipoTarifaLectura } from './Modules/Lecturas/LecturaEntities/TipoTarifaLectura.Entity';
import { TipoTarifaServiciosFijos } from './Modules/Lecturas/LecturaEntities/TipoTarifaServiciosFijos.Entity';
import { TipoTarifaVentaAgua } from './Modules/Lecturas/LecturaEntities/TipoTarifaVentaAgua.Entity';
import { ImagenEntity } from './Modules/Imagenes/ImagenesEntity/Imagen.Entity';
import { ImagenesModule } from './Modules/Imagenes/Imagenes.module';
import { ManualModule } from './Modules/ManualdeUsuario/manual.module';
import { ManualEntity } from './Modules/ManualdeUsuario/ManualEntities/Manual.Entity';
import { RangoAfiliados } from './Modules/Lecturas/LecturaEntities/RangoAfiliados.Entity';
import { RangoConsumo } from './Modules/Lecturas/LecturaEntities/RangoConsumo.Entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development'
        ? '.env.development'
        : '.env.production',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: [
        Usuario, UsuarioRol, Permiso,
        Solicitud, SolicitudFisica, SolicitudJuridica, EstadoSolicitud,
        SolicitudAfiliacionFisica, SolicitudCambioMedidorFisica, SolicitudDesconexionFisica, SolicitudAsociadoFisica,
        SolicitudAfiliacionJuridica, SolicitudDesconexionJuridica, SolicitudCambioMedidorJuridica, SolicitudAsociadoJuridica,
        Afiliado, AfiliadoFisico, AfiliadoJuridico, EstadoAfiliado, TipoAfiliado,
        Proveedor, EstadoProveedor, ProveedorFisico, ProveedorJuridico,
        Proyecto, EstadoProyecto,
        CalidadAgua,
        Acta, ArchivoActa,
        Reporte, EstadoReporte,
        Sugerencia, EstadoSugerencia,
        Queja, EstadoQueja,
        FAQEntity,
        Material, EstadoMaterial, Categoria, EstadoCategoria, MaterialCategoria, UnidadMedicion, EstadoUnidadMedicion, MovimientoInventario, Medidor, EstadoMedidor,
        Auditoria,
        Lectura, TipoTarifaLectura, TipoTarifaServiciosFijos, TipoTarifaVentaAgua, RangoAfiliados, RangoConsumo,
        ImagenEntity,
        ManualEntity
        ],
        synchronize: false,
        dropSchema: false,
      })
    }),
    SeederModule,
    AuthModule,
    RolesModule,
    UsuariosModule,
    AuditoriaModule,
    ProveedorModule,
    InventarioModule,
    LecturaModule,
    FacturaModule,
    AfiliadosModule,
    SolicitudesModule,
    CalidadAguaModule,
    ActasModule,
    ReportesModule,
    ProyectoModule,
    SugerenciaModule,
    FAQModule,
    QuejasModule,
    ImagenesModule,
    ManualModule
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
export class AppModule { }