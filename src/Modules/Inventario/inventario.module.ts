import { Module } from '@nestjs/common';
import { MaterialService } from './Services/material.service';
import { CategoriasService } from './Services/categorias.service';
import { UnidadesDeMedicionService } from './Services/unidadesDeMedicion.service';
import { InventarioController } from './inventario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './InventarioEntities/Material.Entity';
import { EstadoMaterial } from './InventarioEntities/EstadoMaterial.Entity';
import { Categoria } from './InventarioEntities/Categoria.Entity';
import { MaterialCategoria } from './InventarioEntities/MaterialCategoria.Entity';
import { UnidadMedicion } from './InventarioEntities/UnidadMedicion.Entity';
import { EstadoUnidadMedicion } from './InventarioEntities/EstadoUnidadMedicion.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([Material, EstadoMaterial, Categoria, MaterialCategoria, UnidadMedicion, EstadoUnidadMedicion])],
  controllers: [InventarioController],
  providers: [MaterialService, CategoriasService, UnidadesDeMedicionService],
  exports: [MaterialService, CategoriasService, UnidadesDeMedicionService],
})
export class InventarioModule {}
