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
import { EstadoCategoria } from './InventarioEntities/EstadoCategoria.Entity';
import { UserEntity } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { IngresoEgresoMaterial } from './InventarioEntities/IngresoEgreso.Entity';
import { IngresoEgresoService } from './Services/ingresoEgreso.service';

@Module({
  imports: [TypeOrmModule.forFeature([Material, EstadoMaterial, Categoria, EstadoCategoria, MaterialCategoria, UnidadMedicion, EstadoUnidadMedicion, IngresoEgresoMaterial, UserEntity])],
  controllers: [InventarioController],
  providers: [MaterialService, CategoriasService, UnidadesDeMedicionService, IngresoEgresoService],
  exports: [MaterialService, CategoriasService, UnidadesDeMedicionService, IngresoEgresoService],
})
export class InventarioModule {}
