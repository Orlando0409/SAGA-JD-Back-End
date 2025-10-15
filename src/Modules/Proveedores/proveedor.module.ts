import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProveedorService } from './proveedor.service';
import { ProveedorController } from './proveedor.controller';
import { ProveedorFisico, ProveedorJuridico, Proveedor } from './ProveedorEntities/Proveedor.Entity';
import { EstadoProveedor } from './ProveedorEntities/EstadoProveedor.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor, ProveedorFisico, ProveedorJuridico, EstadoProveedor])],
  providers: [ProveedorService],
  controllers: [ProveedorController],
  exports: [ProveedorService],
})
export class ProveedorModule {}
