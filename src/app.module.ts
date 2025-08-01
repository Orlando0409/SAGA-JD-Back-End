import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProyectoModule } from './Proyectos/proyecto.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioController } from './inventario/inventario.controller';
import { ActasModule } from './modulos/actas/actas.module';
import { ActasController } from './modulos/actas/actas.controller';
import { ActasService } from './modulos/actas/actas.service';
import { RQSModule } from './modulos/r_q_s/r_q_s.module';
import { ProveedorModule } from './modulos/proveedor/proveedor.module';
import { ProveedorService } from './modulos/proveedor/proveedor.service';
import { ProveedorController } from './modulos/proveedor/proveedor.controller';
import { InventarioController } from './modulots/inventario/inventario.controller';
import { FacturaModule } from './modulos/factura/factura.module';
import { AbonadosModule } from './modulos/abonados/abonados.module';
import { AbonadosController } from './modulos/abonados/abonados.controller';
import { InventarioModule } from './inventario/inventario.module';
import { InventarioController } from './inventario/inventario.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql', 
      host: 'localhost',
      port: 3306,
      username: 'Alondra',
      password: '12345678
    
  
    ProyectoModule,
    InventarioModule,
    AbonadosModule,
    FacturaModule,
    ProveedorModule,
    RQSModule,
    ActasModule],




  controllers: [AppController, InventarioController, AbonadosController, ProveedorController, ActasController],
  providers: [AppService, ProveedorService, ActasService],
})
export class AppModule {}
