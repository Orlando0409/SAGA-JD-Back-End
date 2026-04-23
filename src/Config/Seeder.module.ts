import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from 'src/Modules/Usuarios/UsuarioEntities/Permiso.Entity';
import { Usuario } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';
import { UsuarioRol } from 'src/Modules/Usuarios/UsuarioEntities/UsuarioRol.Entity';
import { EstadoProveedor } from 'src/Modules/Proveedores/ProveedorEntities/EstadoProveedor.Entity';
import { EstadoProyecto } from 'src/Modules/Proyectos/ProyectoEntities/EstadoProyecto.Entity';
import { EstadoSolicitud } from 'src/Modules/Solicitudes/SolicitudEntities/EstadoSolicitud.Entity';
import { EstadoAfiliado } from 'src/Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity';
import { TipoAfiliado } from 'src/Modules/Afiliados/AfiliadoEntities/TipoAfiliado.Entity';
import { EstadoMaterial } from 'src/Modules/Inventario/InventarioEntities/EstadoMaterial.Entity';
import { Categoria } from 'src/Modules/Inventario/InventarioEntities/Categoria.Entity';
import { EstadoUnidadMedicion } from 'src/Modules/Inventario/InventarioEntities/EstadoUnidadMedicion.Entity';
import { UnidadMedicion } from 'src/Modules/Inventario/InventarioEntities/UnidadMedicion.Entity';
import { EstadoCategoria } from 'src/Modules/Inventario/InventarioEntities/EstadoCategoria.Entity';
import { SeederService } from './Seeder.service';
import { EstadoMedidor } from 'src/Modules/Inventario/InventarioEntities/EstadoMedidor.Entity';
import { RangoAfiliados } from 'src/Modules/Lecturas/LecturaEntities/RangoAfiliados.Entity';
import { RangoConsumo } from 'src/Modules/Lecturas/LecturaEntities/RangoConsumo.Entity';
import { EstadoReporte } from 'src/Modules/Reportes/ReporteEntities/EstadoReporte.Entity';
import { EstadoSugerencia } from 'src/Modules/Sugerencias/SugerenciaEntities/EstadoSugerencia.Entity';
import { EstadoQueja } from 'src/Modules/Quejas/QuejaEntities/EstadoQueja.Entity';
import { EstadoFactura } from 'src/Modules/Facturas/FacturaEntities/EstadoFactura.Entity';
import { TipoTarifaServiciosFijosConSello } from 'src/Modules/Tarifas/Con Sello Calidad/TarifaConSelloEntities/TarifaServiciosFijos.Entity';
import { AplicarSelloCalidad } from 'src/Modules/Lecturas/LecturaEntities/AplicarSelloCalidad.Entity';
import { TarifaLecturaConSello } from 'src/Modules/Tarifas/Con Sello Calidad/TarifaConSelloEntities/TarifaLecturaConSello.Entity';
import { TipoTarifaCargoFijoConSello } from 'src/Modules/Tarifas/Con Sello Calidad/TarifaConSelloEntities/TipoTarifaCargoFijoConSello.Entity';
import { CargoFijoTarifasConSello } from 'src/Modules/Tarifas/Con Sello Calidad/TarifaConSelloEntities/CargoFijoTarifasConSello.Entity';
import { TipoTarifaVentaAguaConSello } from 'src/Modules/Tarifas/Con Sello Calidad/TarifaConSelloEntities/TarifaVentaAgua.Entity';
import { TarifaLecturaSinSello } from 'src/Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/TarifaLecturaSinSello.Entity';
import { RangoAfiliadosSinSello } from 'src/Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/RangoAfiliadosSinSello.Entity';
import { RangoConsumoSinSello } from 'src/Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/RangoConsumoSinSello.Entity';
import { CargoFijoTarifasSinSello } from 'src/Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/CargoFijoTarifasSinSello.Entity';
import { PrecioBloqueConsumoSinSello } from 'src/Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/PrecioBloqueConsumoSinSello.Entity';
import { RecursoHidricoSinSello } from 'src/Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/RecursoHidricoSinSello.Entity';
import { BloqueRecursoHidricoSinSello } from 'src/Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/BloqueRecursoHidricoSinSello.Entity';
import { PrecioRecursoHidricoSinSello } from 'src/Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/PrecioRecursoHidricoSinSello.Entity';
import { TarifaHidranteSinSello } from 'src/Modules/Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/TarifaHidranteSinSello.Entity';

@Module({
    imports: [TypeOrmModule.forFeature([
        Usuario, 
        UsuarioRol, 
        Permiso, 
        EstadoProveedor, 
        EstadoProyecto, 
        EstadoSolicitud, 
        EstadoAfiliado, 
        TipoAfiliado, 
        EstadoMaterial, 
        Categoria, 
        EstadoCategoria, 
        EstadoUnidadMedicion, 
        UnidadMedicion, 
        EstadoReporte, 
        EstadoSugerencia, 
        EstadoQueja, 
        EstadoFactura,
        EstadoMedidor, 
        TarifaLecturaConSello, 
        TipoTarifaCargoFijoConSello, 
        CargoFijoTarifasConSello, 
        TipoTarifaServiciosFijosConSello, 
        TipoTarifaVentaAguaConSello, 
        RangoAfiliados, 
        RangoConsumo, 
        AplicarSelloCalidad,
        // Entidades Sin Sello
        TarifaLecturaSinSello,
        RangoAfiliadosSinSello,
        RangoConsumoSinSello,
        CargoFijoTarifasSinSello,
        PrecioBloqueConsumoSinSello,
        RecursoHidricoSinSello,
        BloqueRecursoHidricoSinSello,
        PrecioRecursoHidricoSinSello,
        TarifaHidranteSinSello
    ])],
    providers: [SeederService],
    exports: [SeederService]
})
export class SeederModule { }