import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseInterceptors, ClassSerializerInterceptor, Put, Patch } from '@nestjs/common';
import { MaterialService } from './Services/material.service';
import { CategoriasService } from './Services/categorias.service';
import { UnidadesDeMedicionService } from './Services/unidadesDeMedicion.service';
import { CreateMaterialDto } from "./InventarioDTO's/CreateMaterial.dto";
import { ApiOperation } from '@nestjs/swagger';
import { CreateCategoriaDto } from "./InventarioDTO's/CreateCategoria.dto";
import { UpdateMaterialDto } from "./InventarioDTO's/UpdateMaterial.dto";
import { CreateUnidadMedicionDto } from "./InventarioDTO's/CreateUnidadMedicion.dto";
import { IngresoEgresoMaterialDto } from "./InventarioDTO's/IngresoEgresoMaterial.dto";
import { UpdateUnidadMedicionDto } from "./InventarioDTO's/UpdateUnidadMedicion.dto";
import { UpdateCategoriaDto } from './InventarioDTO\'s/UpdateCategoria.dto';

@Controller('Inventario')
@UseInterceptors(ClassSerializerInterceptor) // Agregar el interceptor para serialización
export class InventarioController {
    constructor(
        private readonly materialService: MaterialService,
        private readonly categoriasService: CategoriasService,
        private readonly unidadesDeMedicionService: UnidadesDeMedicionService
    ) {}

    @Get('/all/materiales')
    @ApiOperation({ summary: 'Obtiene todos los materiales del inventario con su estado.' })
    async getAllMaterials() {
        return this.materialService.getAllMaterials();
    }

    @Get('/all/categorias')
    @ApiOperation({ summary: 'Obtiene todas las categorías de materiales.' })
    async getAllCategorias() {
        return this.categoriasService.getAllCategorias();
    }

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

    @Post('/create/material')
    @ApiOperation({ summary: 'Crea un nuevo material en el inventario.' })
    async createMaterial(@Body() dto: CreateMaterialDto) {
        return this.materialService.createMaterial(dto);
    }

    @Post('/create/categoria/:idUsuario')
    @ApiOperation({ summary: 'Crea una nueva categoría de material.' })
    async createCategoria(
        @Body() dto: CreateCategoriaDto,
        @Param('idUsuario', ParseIntPipe) idUsuario: number
    ) {
        return this.categoriasService.createCategoria(dto, idUsuario);
    }

    @Post('/create/unidad-medicion')
    @ApiOperation({ summary: 'Crea una nueva unidad de medición.' })
    async createUnidadMedicion(@Body() dto: CreateUnidadMedicionDto) {
        return this.unidadesDeMedicionService.createUnidadMedicion(dto);
    }

    @Put('/update/material/:materialId')
    @ApiOperation({ summary: 'Actualiza un material existente en el inventario.' })
    async updateMaterial(
        @Param('materialId', ParseIntPipe) materialId: number,
        @Body() dto: UpdateMaterialDto
    ) {
        return this.materialService.updateMaterial(materialId, dto);
    }

    @Put('/update/categoria/:categoriaId')
    @ApiOperation({ summary: 'Actualiza una categoría existente.' })
    async updateCategoria(
        @Param('categoriaId', ParseIntPipe) categoriaId: number,
        @Body() dto: UpdateCategoriaDto
    ) {
        return this.categoriasService.updateCategoria(categoriaId, dto);
    }

    @Put('/update/unidad-medicion/:unidadId')
    @ApiOperation({ summary: 'Actualiza una unidad de medición existente.' })
    async updateUnidadMedicion(
        @Param('unidadId', ParseIntPipe) unidadId: number,
        @Body() dto: UpdateUnidadMedicionDto
    ) {
        return this.unidadesDeMedicionService.updateUnidadMedicion(unidadId, dto);
    }

    @Patch('/update/estado/categoria/:categoriaId/:estadoCategoriaId')
    @ApiOperation({ summary: 'Cambia el estado de una categoría al estado especificado.' })
    async cambiarEstadoCategoria(
        @Param('categoriaId', ParseIntPipe) categoriaId: number,
        @Param('estadoCategoriaId', ParseIntPipe) estadoCategoriaId: number
    ) {
        return this.categoriasService.updateEstadoCategoria(categoriaId, estadoCategoriaId);
    }

    @Patch('/update/estado/unidad-medicion/:unidadId/:estadoUnidadId')
    @ApiOperation({ summary: 'Cambia el estado de una unidad de medición al estado especificado.' })
    async cambiarEstadoUnidadMedicion(
        @Param('unidadId', ParseIntPipe) unidadId: number, 
        @Param('estadoUnidadId', ParseIntPipe) estadoUnidadId: number
    ) {
        return this.unidadesDeMedicionService.updateEstadoUnidadMedicion(unidadId, estadoUnidadId);
    }

    @Patch('/ingreso/material/:materialId')
    @ApiOperation({ summary: 'Registra el ingreso de una cantidad específica de un material al inventario.' })
    async ingresoMaterial(
        @Param('materialId', ParseIntPipe) materialId: number,
        @Body() dto: IngresoEgresoMaterialDto
    ) {
        return this.materialService.IngresoMaterial(materialId, dto);
    }

    @Patch('/egreso/material/:materialId')
    @ApiOperation({ summary: 'Registra el egreso de una cantidad específica de un material del inventario.' })
    async egresoMaterial(
        @Param('materialId', ParseIntPipe) materialId: number,
        @Body() dto: IngresoEgresoMaterialDto
    ) {
        return this.materialService.EgresoMaterial(materialId, dto);
    }
}