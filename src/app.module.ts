import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProjectEntity } from './Modules/Proyectos/ProyectoEntities/Proyecto.Entity';
import { ProjectStatus } from './Modules/Proyectos/ProyectoEntities/EstadoProyecto.Entity';
import { UserEntity } from './Modules/Usuarios/Entity/User.Entity';
import { UserRol } from './Modules/Usuarios/Entity/UserRol';

import { ProyectoModule } from './Modules/Proyectos/proyecto.module';
import { AbonadosModule } from './Modules/Abonados/abonados.module';
import { FacturaModule } from './Modules/Facturas/factura.module';
import { InventarioModule } from './Modules/Inventario/inventario.module';
import { ProveedorModule } from './Modules/Proveedores/proveedor.module';
import { UsuariosModule } from './Modules/Usuarios/Module/usuarios.module';
import { RolesModule } from './Modules/Usuarios/Module/roles.module';
import { SolicitudAfiliacionModule } from './Modules/Solicitudes/Modules/solicitudAfiliacion.module';
import { SolicitudEstado } from './Modules/Solicitudes/SolicitudEntities/EstadoSolicitud.Entity';


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
        entities: [ProjectEntity, ProjectStatus, UserEntity,UserRol, SolicitudAfiliacionModule, SolicitudEstado],
        synchronize: true, 
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


  ],
  controllers: [],
  providers: [],
})
export class AppModule {}