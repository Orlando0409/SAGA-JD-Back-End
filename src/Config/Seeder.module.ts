import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from 'src/Modules/Usuarios/UsuarioEntities/Permiso.Entity';
import { Usuario } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';
import { UsuarioRol } from 'src/Modules/Usuarios/UsuarioEntities/UsuarioRol.Entity';
import { EstadoProveedor } from 'src/Modules/Proveedores/ProveedorEntities/EstadoProveedor.Entity';
import { TipoProveedor } from 'src/Modules/Proveedores/ProveedorEntities/TipoProveedor.Entity';    
import { ProyectoEstado } from 'src/Modules/Proyectos/ProyectoEntities/EstadoProyecto.Entity';
import { EstadoSolicitud } from 'src/Modules/Solicitudes/SolicitudEntities/EstadoSolicitud.Entity';
import { EstadoAfiliado } from 'src/Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity';
import { TipoAfiliado } from 'src/Modules/Afiliados/AfiliadoEntities/TipoAfiliado.Entity';
import { EstadoMaterial } from 'src/Modules/Inventario/InventarioEntities/EstadoMaterial.Entity';
import { Categoria } from 'src/Modules/Inventario/InventarioEntities/Categoria.Entity';
import { SeederService } from './Seeder.service';
import { EstadoUnidadMedicion } from 'src/Modules/Inventario/InventarioEntities/EstadoUnidadMedicion.Entity';
import { UnidadMedicion } from 'src/Modules/Inventario/InventarioEntities/UnidadMedicion.Entity';
import { EstadoCalidadAgua } from 'src/Modules/CalidadAgua/CalidadAguaEntities/EstadoCalidadAgua.Entity';
import { EstadoCategoria } from 'src/Modules/Inventario/InventarioEntities/EstadoCategoria.Entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Usuario, UsuarioRol, Permiso, EstadoProveedor, TipoProveedor, ProyectoEstado, EstadoSolicitud, EstadoAfiliado, TipoAfiliado, EstadoMaterial, Categoria, EstadoCategoria, EstadoUnidadMedicion, UnidadMedicion, EstadoCalidadAgua])
    ],
    providers: [SeederService],
    exports: [SeederService]
})
export class SeederModule {}