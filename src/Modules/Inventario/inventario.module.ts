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
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { MovimientoInventario } from './InventarioEntities/Movimiento.Entity';
import { MovimientosService } from './Services/movimientos.service';
import { Proveedor, ProveedorFisico, ProveedorJuridico } from '../Proveedores/ProveedorEntities/Proveedor.Entity';
import { EstadoMedidor } from './InventarioEntities/EstadoMedidor.Entity';
import { Medidor } from './InventarioEntities/Medidor.Entity';
import { MedidorService } from './Services/medidor.service';
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from '../Afiliados/AfiliadoEntities/Afiliado.Entity';
import { TipoAfiliado } from '../Afiliados/AfiliadoEntities/TipoAfiliado.Entity';
import { EstadoAfiliado } from '../Afiliados/AfiliadoEntities/EstadoAfiliado.Entity';
import { AuditoriaModule } from '../Auditoria/auditoria.module';
import { UsuariosService } from '../Usuarios/Services/usuarios.service';
import { UsuarioRol } from '../Usuarios/UsuarioEntities/UsuarioRol.Entity';
import { ProveedorService } from '../Proveedores/proveedor.service';
import { EstadoProveedor } from '../Proveedores/ProveedorEntities/EstadoProveedor.Entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material, EstadoMaterial, Categoria, EstadoCategoria, MaterialCategoria, UnidadMedicion, EstadoUnidadMedicion, MovimientoInventario, Medidor, EstadoMedidor ,Usuario, UsuarioRol, Proveedor, ProveedorFisico, ProveedorJuridico, EstadoProveedor, Afiliado, AfiliadoFisico, AfiliadoJuridico, EstadoAfiliado, TipoAfiliado]),
    AuditoriaModule
  ],
  controllers: [InventarioController],
  providers: [MaterialService, CategoriasService, UnidadesDeMedicionService, MovimientosService, MedidorService, UsuariosService, ProveedorService],
  exports: [MaterialService, CategoriasService, UnidadesDeMedicionService, MovimientosService, MedidorService],
})
export class InventarioModule {}
