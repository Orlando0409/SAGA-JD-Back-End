import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ProjectEntity } from './modules/Proyectos/ProyectoEntities/Project.Entity';
import { ProjectStatus } from './modules/Proyectos/ProyectoEntities/ProjectStatus.Entity';

import { ProyectoModule } from './modules/Proyectos/proyecto.module';
import { AbonadosModule } from './modules/Abonados/abonados.module';
import { FacturaModule } from './modules/Facturas/factura.module';
import { InventarioModule } from './modules/Inventario/inventario.module';
import { ProveedorModule } from './modules/Proveedores/proveedor.module';
import { UsuariosModule } from './modules/Usuarios/usuarios.module';

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
    FacturaModule,
    InventarioModule,
    ProveedorModule,
    UsuariosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}