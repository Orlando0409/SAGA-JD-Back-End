import { Module, forwardRef } from '@nestjs/common';
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
import { UsuarioRol } from '../Usuarios/UsuarioEntities/UsuarioRol.Entity';
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
import { ProveedorService } from '../Proveedores/proveedor.service';
import { EstadoProveedor } from '../Proveedores/ProveedorEntities/EstadoProveedor.Entity';
import { UsuariosModule } from '../Usuarios/Modules/usuarios.module';
import { RolesModule } from '../Usuarios/Modules/roles.module';
import { AfiliadosModule } from '../Afiliados/afiliados.module';
import { Solicitud } from '../Solicitudes/SolicitudEntities/Solicitud.Entity';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material, EstadoMaterial, Categoria, EstadoCategoria, MaterialCategoria, UnidadMedicion, EstadoUnidadMedicion, MovimientoInventario, Medidor, EstadoMedidor, Usuario, Proveedor, EstadoProveedor, ProveedorFisico, ProveedorJuridico, Afiliado, EstadoAfiliado, AfiliadoFisico, AfiliadoJuridico, TipoAfiliado, Solicitud]),
    forwardRef(() => AfiliadosModule),
    forwardRef(() => UsuariosModule),
    forwardRef(() => RolesModule),
    forwardRef(() => AuditoriaModule),
    DropboxModule,
  ],
  controllers: [InventarioController],
  providers: [MaterialService, CategoriasService, UnidadesDeMedicionService, MovimientosService, MedidorService, ProveedorService],
  exports: [MaterialService, CategoriasService, UnidadesDeMedicionService, MovimientosService, MedidorService],
})
export class InventarioModule { }
