import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProjectEntity } from './Modules/Proyectos/ProyectoEntities/Proyecto.Entity';
import { ProjectStatus } from './Modules/Proyectos/ProyectoEntities/EstadoProyecto.Entity';
import { ProyectoModule } from './Modules/Proyectos/proyecto.module';
import { AbonadosModule } from './Modules/Abonados/abonados.module';
import { FacturaModule } from './Modules/Facturas/factura.module';
import { InventarioModule } from './Modules/Inventario/inventario.module';
import { ProveedorModule } from './Modules/Proveedores/proveedor.module';
import { UsuariosModule } from './Modules/Usuarios/usuarios.module';
import { SolicitudEstado } from './Modules/Solicitudes/SolicitudEntities/EstadoSolicitud.Entity';
import { SolicitudAfiliacion, SolicitudCambioMedidor, SolicitudDesconexion, SolicitudEntity } from './Modules/Solicitudes/SolicitudEntities/Solicitud.Entity';
import { SolicitudAfiliacionModule } from './Modules/Solicitudes/Modules/solicitudAfiliacion.module';

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
        host: process.env.DB_HOST,
        port: Number( process.env.DB_PORT),
        username:  process.env.DB_USERNAME,
        password:  process.env.DB_PASSWORD,
        database:  process.env.DB_DATABASE,
        entities: [ProjectEntity,
                  ProjectStatus,
                  SolicitudEntity,
                  SolicitudAfiliacion,
                  SolicitudCambioMedidor,
                  SolicitudDesconexion,
                  SolicitudEstado],
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}