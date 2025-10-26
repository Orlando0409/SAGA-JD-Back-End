import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseInterceptors, ClassSerializerInterceptor, Put, Patch, UseGuards } from '@nestjs/common';
import { MaterialService } from './Services/material.service';
import { CategoriasService } from './Services/categorias.service';
import { UnidadesDeMedicionService } from './Services/unidadesDeMedicion.service';
import { CreateMaterialDto } from "./InventarioDTO's/CreateMaterial.dto";
import { ApiOperation } from '@nestjs/swagger';
import { CreateCategoriaDto } from "./InventarioDTO's/CreateCategoria.dto";
import { UpdateMaterialDto } from "./InventarioDTO's/UpdateMaterial.dto";
import { CreateUnidadMedicionDto } from "./InventarioDTO's/CreateUnidadMedicion.dto";
import { MovimientoMaterialDto } from "./InventarioDTO's/MovimientoMaterial.dto";
import { UpdateUnidadMedicionDto } from "./InventarioDTO's/UpdateUnidadMedicion.dto";
import { UpdateCategoriaDto } from './InventarioDTO\'s/UpdateCategoria.dto';
import { MovimientosService } from './Services/movimientos.service';
import { MedidorService } from './Services/medidor.service';
import { CreateMedidorDTO } from './InventarioDTO\'s/CreateMedidor.dto';
import { AsignarMedidorDTO } from './InventarioDTO\'s/AsignarMedidor.dto';
import { JwtAuthGuard } from '../auth/Guard/JwtGuard';
import { GetUser } from '../auth/Decorator/GetUser.decorator';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';

@Controller('Inventario')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor) // Agregar el interceptor para serialización
export class InventarioController {
    constructor(
        private readonly materialService: MaterialService,
        private readonly categoriasService: CategoriasService,
        private readonly unidadesDeMedicionService: UnidadesDeMedicionService,
        private readonly movimientosService: MovimientosService,
        private readonly medidorService: MedidorService,
    ) {}

    // ENDPOINTS PARA MATERIALES
    @Get('/all/materiales')
    @ApiOperation({ summary: 'Obtiene todos los materiales del inventario con su estado.' })
    async getAllMaterials() {
        return this.materialService.getAllMateriales();
    }

    @Get('/materiales/disponibles')
    @ApiOperation({ summary: 'Obtiene materiales que están disponibles.' })
    async getMaterialesDisponibles() {
        return this.materialService.getMaterialesDisponibles();
    }

    @Get('/materiales/agotados')
    @ApiOperation({ summary: 'Obtiene materiales que están agotados.' })
    async getMaterialesAgotados() {
        return this.materialService.getMaterialesAgotados();
    }

    @Get('/materiales/de-baja')
    @ApiOperation({ summary: 'Obtiene materiales que están de baja.' })
    async getMaterialesDeBaja() {
        return this.materialService.getMaterialesDeBaja();
    }

    @Get('/materiales/agotados-de-baja')
    @ApiOperation({ summary: 'Obtiene materiales que están agotados y de baja.' })
    async getMaterialesAgotadosDeBaja() {
        return this.materialService.getMaterialesAgotadosYDeBaja();
    }

    @Get('/materiales/with/categorias')
    @ApiOperation({ summary: 'Obtiene materiales que tienen categorías asignadas' })
    async getMaterialesConCategorias() {
        return this.materialService.getMaterialesConCategorias();
    }

    @Get('/materiales/without/categorias')
    @ApiOperation({ summary: 'Obtiene materiales que no tienen categorías' })
    async getMaterialesSinCategorias() {
        return this.materialService.getMaterialesSinCategorias();
    }

    @Get('/materiales/above/stock/:threshold')
    @ApiOperation({ summary: 'Obtiene materiales con cantidad por encima de un umbral dado, ordenados de mayor a menor.' })
    async getMaterialesPorEncimaDeStock(@Param('threshold', ParseIntPipe) threshold: number) {
        return this.materialService.getMaterialesPorEncimaDeStock(threshold);
    }

    @Get('/materiales/below/stock/:threshold')
    @ApiOperation({ summary: 'Obtiene materiales con cantidad por debajo de un umbral dado, ordenados de menor a mayor.' })
    async getMaterialesPorDebajoDeStock(@Param('threshold', ParseIntPipe) threshold: number) {
        return this.materialService.getMaterialesPorDebajoDeStock(threshold);
    }

    @Get('/materiales/between/priceRange/:min/:max')
    @ApiOperation({ summary: 'Obtiene materiales cuyo precio está entre un rango dado.' })
    async getMaterialesEntreRangoDePrecio(
        @Param('min', ParseIntPipe) min: number,
        @Param('max', ParseIntPipe) max: number
    ) {
        return this.materialService.getMaterialesEntreRangoPrecio(min, max);
    }

    @Post('/create/material')
    @ApiOperation({ summary: 'Crea un nuevo material en el inventario.' })
    async createMaterial(
        @Body() dto: CreateMaterialDto,
        @GetUser() usuario: Usuario
    ) {
        return this.materialService.createMaterial(dto, usuario.Id_Usuario);
    }

    @Put('/update/material/:materialId')
    @ApiOperation({ summary: 'Actualiza un material existente en el inventario.' })
    async updateMaterial(
        @Param('materialId', ParseIntPipe) materialId: number,
        @Body() dto: UpdateMaterialDto,
        @GetUser() usuario: Usuario
    ) {
        return this.materialService.updateMaterial(materialId, dto, usuario.Id_Usuario);
    }

    @Patch('/update/estado/material/:materialId/:estadoMaterialId')
    @ApiOperation({ summary: 'Cambia el estado de un material. Si el estado es "De baja" (3), actualiza automáticamente la fecha de baja.' })
    async cambiarEstadoMaterial(
        @Param('materialId', ParseIntPipe) materialId: number,
        @Param('estadoMaterialId', ParseIntPipe) estadoMaterialId: number,
        @GetUser() usuario: Usuario
    ) {
        return this.materialService.updateEstadoMaterial(materialId, estadoMaterialId, usuario.Id_Usuario);
    }



    //ENDPOINTS PARA CATEGORIAS
    @Get('/all/categorias')
    @ApiOperation({ summary: 'Obtiene todas las categorías de materiales.' })
    async getAllCategorias() {
        return this.categoriasService.getAllCategorias();
    }

    @Get('/categorias/activas')
    @ApiOperation({ summary: 'Obtiene todas las categorías activas.' })
    async getCategoriasActivas() {
        return this.categoriasService.getCategoriasActivas();
    }

    @Get('/categorias/inactivas')
    @ApiOperation({ summary: 'Obtiene todas las categorías inactivas.' })
    async getCategoriasInactivas() {
        return this.categoriasService.getCategoriasInactivas();
    }

    @Post('/create/categoria')
    @ApiOperation({ summary: 'Crea una nueva categoría de material.' })
    async createCategoria(
        @Body() dto: CreateCategoriaDto,
        @GetUser() usuario: Usuario
    ) {
        return this.categoriasService.createCategoria(dto, usuario.Id_Usuario);
    }

    @Put('/update/categoria/:categoriaId')
    @ApiOperation({ summary: 'Actualiza una categoría existente.' })
    async updateCategoria(
        @Param('categoriaId', ParseIntPipe) categoriaId: number,
        @Body() dto: UpdateCategoriaDto,
        @GetUser() usuario: Usuario
    ) {
        return this.categoriasService.updateCategoria(categoriaId, dto, usuario.Id_Usuario);
    }

    @Patch('/update/estado/categoria/:categoriaId/:estadoCategoriaId')
    @ApiOperation({ summary: 'Cambia el estado de una categoría al estado especificado.' })
    async cambiarEstadoCategoria(
        @Param('categoriaId', ParseIntPipe) categoriaId: number,
        @Param('estadoCategoriaId', ParseIntPipe) estadoCategoriaId: number,
        @GetUser() usuario: Usuario
    ) {
        return this.categoriasService.updateEstadoCategoria(categoriaId, estadoCategoriaId, usuario.Id_Usuario);
    }



    //ENDPOINTS PARA UNIDADES DE MEDICION
    @Get('/all/unidades-medicion')
    @ApiOperation({ summary: 'Obtiene todas las unidades de medición activas.' })
    async getAllUnidadesMedicion() {
        return this.unidadesDeMedicionService.getAllUnidadesMedicion();
    }

    @Get('/all/unidades-medicion/simple')
    @ApiOperation({ summary: 'Obtiene todas las unidades de medición (solo Id y Nombre).' })
    async getAllUnidadesMedicionSimple() {
        return this.unidadesDeMedicionService.getUnidadMedicionSimple();
    }

    @Get('/unidades-medicion/activas')
    @ApiOperation({ summary: 'Obtiene todas las unidades de medición activas.' })
    async getUnidadesMedicionActivas() {
        return this.unidadesDeMedicionService.getUnidadesMedicionActivas();
    }

    @Get('/unidades-medicion/inactivas')
    @ApiOperation({ summary: 'Obtiene todas las unidades de medición inactivas.' })
    async getUnidadesMedicionInactivas() {
        return this.unidadesDeMedicionService.getUnidadesMedicionInactivas();
    }

    @Post('/create/unidad-medicion')
    @ApiOperation({ summary: 'Crea una nueva unidad de medición.' })
    async createUnidadMedicion(
        @Body() dto: CreateUnidadMedicionDto,
        @GetUser() usuario: Usuario
    ) {
        return this.unidadesDeMedicionService.createUnidadMedicion(dto, usuario.Id_Usuario);
    }

    @Put('/update/unidad-medicion/:unidadId')
    @ApiOperation({ summary: 'Actualiza una unidad de medición existente.' })
    async updateUnidadMedicion(
        @Param('unidadId', ParseIntPipe) unidadId: number,
        @Body() dto: UpdateUnidadMedicionDto,
        @GetUser() usuario: Usuario
    ) {
        return this.unidadesDeMedicionService.updateUnidadMedicion(unidadId, dto, usuario.Id_Usuario);
    }

    @Patch('/update/estado/unidad-medicion/:unidadId/:estadoUnidadId')
    @ApiOperation({ summary: 'Cambia el estado de una unidad de medición al estado especificado.' })
    async cambiarEstadoUnidadMedicion(
        @Param('unidadId', ParseIntPipe) unidadId: number, 
        @Param('estadoUnidadId', ParseIntPipe) estadoUnidadId: number,
        @GetUser() usuario: Usuario
    ) {
        return this.unidadesDeMedicionService.updateEstadoUnidadMedicion(unidadId, estadoUnidadId, usuario.Id_Usuario);
    }



    //ENDPOINTS PARA MOVIMIENTOS
    @Get('/all/movimientos')
    @ApiOperation({ summary: 'Obtiene todos los movimientos de inventario.' })
    async getAllMovimientos() {
        return this.movimientosService.getAllMovimientos();
    }

    @Get('/movimientos/entradas')
    @ApiOperation({ summary: 'Obtiene todos los ingresos de un material específico.' })
    async getIngresosPorMaterial() {
        return this.movimientosService.getMovimientosEntradas();
    }

    @Get('/movimientos/salidas')
    @ApiOperation({ summary: 'Obtiene todos los egresos de un material específico.' })
    async getEgresosPorMaterial() {
        return this.movimientosService.getMovimientosSalidas();
    }

    @Get('/movimientos/entre/fechas/:startDate/:endDate')
    @ApiOperation({ summary: 'Obtiene todos los movimientos entre dos fechas específicas.' })
    async getMovimientosEntreFechas(
        @Param('startDate') startDate: string,
        @Param('endDate') endDate: string
    ) {
        return this.movimientosService.getMovimientosEntreFechas(startDate, endDate);
    }

    @Get('/mis-movimientos')
    @ApiOperation({ summary: 'Obtiene los movimientos del usuario autenticado.' })
    async getMisMovimientos(@GetUser() usuario: Usuario) {
        return this.movimientosService.getMovimientosPorUsuarioCreador(usuario.Id_Usuario);
    }

    @Post('/ingreso/material')
    @ApiOperation({ summary: 'Registra el ingreso de una cantidad específica de un material al inventario.' })
    async ingresoMaterial(
        @Body() dto: MovimientoMaterialDto,
        @GetUser() usuario: Usuario
    ) {
        return this.movimientosService.IngresoMaterial(dto, usuario.Id_Usuario);
    }

    @Post('/egreso/material')
    @ApiOperation({ summary: 'Registra el egreso de una cantidad específica de un material del inventario.' })
    async egresoMaterial(
        @Body() dto: MovimientoMaterialDto,
        @GetUser() usuario: Usuario
    ) {
        return this.movimientosService.EgresoMaterial(usuario.Id_Usuario, dto);
    }



    // ENDPOINTS PARA MEDIDORES
    @Get('/all/medidores')
    @ApiOperation({ summary: 'Obtiene todos los medidores con su estado.' })
    async getAllMedidores() {
        return this.medidorService.getAllMedidores();
    }

    @Get('/medidores/no-instalados')
    @ApiOperation({ summary: 'Obtiene todos los medidores que no están instalados.' })
    async getMedidoresNoInstalados() {
        return this.medidorService.getMedidoresNoInstalados();
    }

    @Get('/medidores/instalados')
    @ApiOperation({ summary: 'Obtiene todos los medidores que están instalados.' })
    async getMedidoresInstalados() {
        return this.medidorService.getMedidoresInstalados();
    }

    @Get('/medidores/averiados')
    @ApiOperation({ summary: 'Obtiene todos los medidores que están en estado "Averiado".' })
    async getMedidoresAveriados() {
        return this.medidorService.getMedidoresAveriados();
    }

    @Get('/medidores/afiliado/:idAfiliado')
    @ApiOperation({ summary: 'Obtiene todos los medidores asociados a un afiliado específico.' })
    async getMedidoresAfiliado(
        @Param('idAfiliado', ParseIntPipe) idAfiliado: number
    ) {
        return this.medidorService.getMedidoresAfiliado(idAfiliado);
    }

    @Post('/create/medidor')
    @ApiOperation({ summary: 'Crea un nuevo medidor en el sistema.' })
    async createMedidor(
        @Body() dto: CreateMedidorDTO,
        @GetUser() usuario: Usuario
    ) {
        return this.medidorService.createMedidor(dto, usuario.Id_Usuario);
    }

    @Post('/asignar/medidor')
    @ApiOperation({ summary: 'Asigna un medidor a un afiliado específico.' })
    async asignarMedidor(
        @Body() dto: AsignarMedidorDTO,
        @GetUser() usuario: Usuario
    ) {
        return this.medidorService.asignarMedidorAAfiliado(dto, usuario.Id_Usuario);
    }

    @Patch('/update/estado/medidor/:idMedidor/:nuevoEstadoId')
    @ApiOperation({ summary: 'Actualiza el estado de un medidor específico.' })
    async updateEstadoMedidor(
        @Param('idMedidor', ParseIntPipe) idMedidor: number,
        @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number,
        @GetUser() usuario: Usuario
    ) {
        return this.medidorService.updateEstadoMedidor(idMedidor, nuevoEstadoId, usuario.Id_Usuario);
    }
}