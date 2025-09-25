import { Module } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './InventarioEntities/Material.Entity';
import { EstadoMaterial } from './InventarioEntities/EstadoMaterial.Entity';
import { MaterialCategoria } from './InventarioEntities/MaterialCategoria.Entity';
import { Categoria } from './InventarioEntities/Categoria.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([Material, EstadoMaterial, Categoria, MaterialCategoria])],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService],
})
export class InventarioModule {}
