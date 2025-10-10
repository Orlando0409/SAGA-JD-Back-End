import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseInterceptors, ClassSerializerInterceptor, Put, Patch } from '@nestjs/common';
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

@Controller('Inventario')
@UseInterceptors(ClassSerializerInterceptor) // Agregar el interceptor para serialización
export class InventarioController {
    constructor(
        private readonly materialService: MaterialService,
        private readonly categoriasService: CategoriasService,
        private readonly unidadesDeMedicionService: UnidadesDeMedicionService,
        private readonly movimientosService: MovimientosService
    ) {}

    // ENDPOINTS PARA MATERIALES
    @Get('/all/materiales')
    @ApiOperation({ summary: 'Obtiene todos los materiales del inventario con su estado.' })
    async getAllMaterials() {
        return this.materialService.getAllMateriales();
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

    @Post('/create/material/:idUsuarioCreador')
    @ApiOperation({ summary: 'Crea un nuevo material en el inventario.' })
    async createMaterial(
        @Body() dto: CreateMaterialDto,
        @Param('idUsuarioCreador', ParseIntPipe) idUsuarioCreador: number
    ) {
        return this.materialService.createMaterial(dto, idUsuarioCreador);
    }

    @Put('/update/material/:materialId')
    @ApiOperation({ summary: 'Actualiza un material existente en el inventario.' })
    async updateMaterial(
        @Param('materialId', ParseIntPipe) materialId: number,
        @Body() dto: UpdateMaterialDto
    ) {
        return this.materialService.updateMaterial(materialId, dto);
    }

    @Patch('/update/estado/material/:materialId/:estadoMaterialId')
    @ApiOperation({ summary: 'Cambia el estado de un material. Si el estado es "De baja" (3), actualiza automáticamente la fecha de baja.' })
    async cambiarEstadoMaterial(
        @Param('materialId', ParseIntPipe) materialId: number,
        @Param('estadoMaterialId', ParseIntPipe) estadoMaterialId: number
    ) {
        return this.materialService.updateEstadoMaterial(materialId, estadoMaterialId);
    }



    //ENDPOINTS PARA CATEGORIAS
    @Get('/all/categorias')
    @ApiOperation({ summary: 'Obtiene todas las categorías de materiales.' })
    async getAllCategorias() {
        return this.categoriasService.getAllCategorias();
    }

    @Post('/create/categoria/:idUsuario')
    @ApiOperation({ summary: 'Crea una nueva categoría de material.' })
    async createCategoria(
        @Body() dto: CreateCategoriaDto,
        @Param('idUsuario', ParseIntPipe) idUsuario: number
    ) {
        return this.categoriasService.createCategoria(dto, idUsuario);
    }

    @Put('/update/categoria/:categoriaId')
    @ApiOperation({ summary: 'Actualiza una categoría existente.' })
    async updateCategoria(
        @Param('categoriaId', ParseIntPipe) categoriaId: number,
        @Body() dto: UpdateCategoriaDto
    ) {
        return this.categoriasService.updateCategoria(categoriaId, dto);
    }

    @Patch('/update/estado/categoria/:categoriaId/:estadoCategoriaId')
    @ApiOperation({ summary: 'Cambia el estado de una categoría al estado especificado.' })
    async cambiarEstadoCategoria(
        @Param('categoriaId', ParseIntPipe) categoriaId: number,
        @Param('estadoCategoriaId', ParseIntPipe) estadoCategoriaId: number
    ) {
        return this.categoriasService.updateEstadoCategoria(categoriaId, estadoCategoriaId);
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

    @Post('/create/unidad-medicion/:idUsuarioCreador')
    @ApiOperation({ summary: 'Crea una nueva unidad de medición.' })
    async createUnidadMedicion(
        @Body() dto: CreateUnidadMedicionDto,
        @Param('idUsuarioCreador', ParseIntPipe) idUsuarioCreador: number
    ) {
        return this.unidadesDeMedicionService.createUnidadMedicion(dto, idUsuarioCreador);
    }

    @Put('/update/unidad-medicion/:unidadId')
    @ApiOperation({ summary: 'Actualiza una unidad de medición existente.' })
    async updateUnidadMedicion(
        @Param('unidadId', ParseIntPipe) unidadId: number,
        @Body() dto: UpdateUnidadMedicionDto
    ) {
        return this.unidadesDeMedicionService.updateUnidadMedicion(unidadId, dto);
    }

    @Patch('/update/estado/unidad-medicion/:unidadId/:estadoUnidadId')
    @ApiOperation({ summary: 'Cambia el estado de una unidad de medición al estado especificado.' })
    async cambiarEstadoUnidadMedicion(
        @Param('unidadId', ParseIntPipe) unidadId: number, 
        @Param('estadoUnidadId', ParseIntPipe) estadoUnidadId: number
    ) {
        return this.unidadesDeMedicionService.updateEstadoUnidadMedicion(unidadId, estadoUnidadId);
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

    @Post('/ingreso/material/:idUsuario')
    @ApiOperation({ summary: 'Registra el ingreso de una cantidad específica de un material al inventario.' })
    async ingresoMaterial(
        @Param('idUsuario', ParseIntPipe) idUsuario: number,
        @Body() dto: MovimientoMaterialDto
    ) {
        return this.movimientosService.IngresoMaterial(dto, idUsuario);
    }

    @Post('/egreso/material/:idUsuario')
    @ApiOperation({ summary: 'Registra el egreso de una cantidad específica de un material del inventario.' })
    async egresoMaterial(
        @Param('idUsuario', ParseIntPipe) idUsuario: number,
        @Body() dto: MovimientoMaterialDto
    ) {
        return this.movimientosService.EgresoMaterial(idUsuario, dto);
    }
}