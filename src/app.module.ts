import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule , ConfigService } from '@nestjs/config';

import { ProjectEntity } from './Modulos/Proyectos/Entidades_proyecto/projectEntity';
import { ProjectStatus } from './Modulos/Proyectos/Entidades_proyecto/projectStatus';

import { AbonadosModule } from './Modulos/Abonados/abonados.module';
import { ActasModule } from './Modulos/Actas/actas.module';
import { FacturaModule } from './Modulos/Factura/factura.module';
import { InventarioModule } from './Modulos/Inventario/inventario.module';
import { ProveedorModule } from './Modulos/Proveedor/proveedor.module';
import { ProyectoModule } from './Modulos/Proyectos/proyecto.module';
import { UsuariosModule } from './Modulos/Usuarios/usuarios.module';


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
        entities: [ProjectEntity, ProjectStatus],
        synchronize: false,
        
      }),
    }),
    ProyectoModule,
    AbonadosModule,
    ActasModule,
    FacturaModule,
    InventarioModule,
    ProveedorModule,
    UsuariosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
