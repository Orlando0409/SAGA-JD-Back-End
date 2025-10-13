import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from 'src/Modules/Usuarios/UsuarioEntities/Permiso.Entity';
import { Usuario } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';
import { UsuarioRol } from 'src/Modules/Usuarios/UsuarioEntities/UsuarioRol.Entity';
import { EstadoProveedor } from 'src/Modules/Proveedores/ProveedorEntities/EstadoProveedor.Entity';
import { TipoProveedor } from 'src/Modules/Proveedores/ProveedorEntities/TipoProveedor.Entity';    
import { EstadoProyecto } from 'src/Modules/Proyectos/ProyectoEntities/EstadoProyecto.Entity';
import { EstadoSolicitud } from 'src/Modules/Solicitudes/SolicitudEntities/EstadoSolicitud.Entity';
import { EstadoAfiliado } from 'src/Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity';
import { TipoAfiliado } from 'src/Modules/Afiliados/AfiliadoEntities/TipoAfiliado.Entity';
import { EstadoMaterial } from 'src/Modules/Inventario/InventarioEntities/EstadoMaterial.Entity';
import { Categoria } from 'src/Modules/Inventario/InventarioEntities/Categoria.Entity';
import { EstadoUnidadMedicion } from 'src/Modules/Inventario/InventarioEntities/EstadoUnidadMedicion.Entity';
import { UnidadMedicion } from 'src/Modules/Inventario/InventarioEntities/UnidadMedicion.Entity';
import { EstadoCategoria } from 'src/Modules/Inventario/InventarioEntities/EstadoCategoria.Entity';
import { EstadoReporte } from 'src/Modules/Reportes/ReporteEntities/EstadoReporte.Entity';
import { EstadoSugerencia } from 'src/Modules/Sugerencias/SugerenciaEntities/EstadoSugerencia.Entity';
import { EstadoQueja } from 'src/Modules/Quejas/QuejaEntities/EstadoQueja.Entity';
import { SeederService } from './Seeder.service';
import { EstadoMedidor } from 'src/Modules/Inventario/InventarioEntities/EstadoMedidor.Entity';

@Module({
    imports: [
    TypeOrmModule.forFeature([Usuario, UsuarioRol, Permiso, EstadoProveedor, TipoProveedor, EstadoProyecto, EstadoSolicitud, EstadoAfiliado, TipoAfiliado, EstadoMaterial, Categoria, EstadoCategoria, EstadoUnidadMedicion, UnidadMedicion, EstadoReporte, EstadoSugerencia, EstadoQueja, EstadoMedidor])
    ],
    providers: [SeederService],
    exports: [SeederService]
})
export class SeederModule {}