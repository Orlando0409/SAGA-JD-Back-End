import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProveedorService } from './proveedor.service';
import { ProveedorController } from './proveedor.controller';
import { ProveedorFisico, ProveedorJuridico, ProveedorEntity } from './ProveedorEntities/ProveedorEntity';
import { EstadoProveedor } from './ProveedorEntities/EstadoProveedor';

@Module({
  imports: [TypeOrmModule.forFeature([ProveedorEntity, ProveedorFisico, ProveedorJuridico, EstadoProveedor])],
  providers: [ProveedorService],
  controllers: [ProveedorController],
})
export class ProveedorModule {}
