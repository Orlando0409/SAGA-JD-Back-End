import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Proyecto_Base } from './Modulos/Proyectos/Entidades_proyecto/entidadBase_proyecto';
import { EstadoProyecto } from './Modulos/Proyectos/Entidades_proyecto/estado_proyecto';

import { AbonadosModule } from './Modulos/Abonados/abonados.module';
import { ActasModule } from './Modulos/Actas/actas.module';
import { FacturaModule } from './Modulos/Factura/factura.module';
import { InventarioModule } from './Modulos/Inventario/inventario.module';
import { ProveedorModule } from './Modulos/Proveedor/proveedor.module';
import { ProyectoModule } from './Modulos/Proyectos/proyecto.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: [Proyecto_Base, EstadoProyecto],
        synchronize: true,
      }),
    }),
    ProyectoModule,
    AbonadosModule,
    ActasModule,
    FacturaModule,
    InventarioModule,
    ProveedorModule,
  ],
})
export class AppModule {}
