import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseInterceptors, ClassSerializerInterceptor, Put, Patch } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateMaterialDto } from './InventarioDTO\'s/CreateMaterial.dto';
import { ApiOperation } from '@nestjs/swagger';
import { CreateCategoriaDto } from './InventarioDTO\'s/CreateCategoria.dto';
import { UpdateMaterialDto } from './InventarioDTO\'s/UpdateMaterial.dto';
import { CreateUnidadMedicionDto } from './InventarioDTO\'s/CreateUnidadMedicion.dto';
import { IngresoEgresoMaterialDto } from './InventarioDTO\'s/IngresoEgresoMaterial.dto';
import { UpdateUnidadMedicionDto } from './InventarioDTO\'s/UpdateUnidadMedicion.dto';

@Controller('Inventario')
@UseInterceptors(ClassSerializerInterceptor) // Agregar el interceptor para serialización
export class InventarioController {
    constructor(private readonly inventarioService: InventarioService) {}

    @Get('/all/materiales')
    @ApiOperation({ summary: 'Obtiene todos los materiales del inventario con su estado.' })
    async getAllMaterials() {
        return this.inventarioService.getAllMaterials();
    }

    @Get('/all/categorias')
    @ApiOperation({ summary: 'Obtiene todas las categorías de materiales.' })
    async getAllCategories() {
        return this.inventarioService.getAllCategories();
    }

    @Get('/all/unidades-medicion')
    @ApiOperation({ summary: 'Obtiene todas las unidades de medición activas.' })
    async getAllUnidadesMedicion() {
        return this.inventarioService.getAllUnidadesMedicion();
    }

    @Get('/all/unidades-medicion/simple')
    @ApiOperation({ summary: 'Obtiene todas las unidades de medición (solo Id y Nombre).' })
    async getAllUnidadesMedicionSimple() {
        return this.inventarioService.getUnidadMedicionSimple();
    }

    @Get('/materiales/with/categorias')
    @ApiOperation({ summary: 'Obtiene materiales que tienen categorías asignadas' })
    async getMaterialesConCategorias() {
        return this.inventarioService.getMaterialesConCategorias();
    }

    @Get('/materiales/without/categorias')
    @ApiOperation({ summary: 'Obtiene materiales que no tienen categorías' })
    async getMaterialesSinCategorias() {
        return this.inventarioService.getMaterialesSinCategorias();
    }

    @Get('/materiales/above/stock/:threshold')
    @ApiOperation({ summary: 'Obtiene materiales con cantidad por encima de un umbral dado, ordenados de mayor a menor.' })
    async getMaterialesPorEncimaDeStock(@Param('threshold', ParseIntPipe) threshold: number) {
        return this.inventarioService.getMaterialesPorEncimaDeStock(threshold);
    }

    @Get('/materiales/below/stock/:threshold')
    @ApiOperation({ summary: 'Obtiene materiales con cantidad por debajo de un umbral dado, ordenados de menor a mayor.' })
    async getMaterialesPorDebajoDeStock(@Param('threshold', ParseIntPipe) threshold: number) {
        return this.inventarioService.getMaterialesPorDebajoDeStock(threshold);
    }

    @Post('/create/material')
    @ApiOperation({ summary: 'Crea un nuevo material en el inventario.' })
    async createMaterial(@Body() dto: CreateMaterialDto) {
        return this.inventarioService.createMaterial(dto);
    }

    @Post('/create/categoria')
    @ApiOperation({ summary: 'Crea una nueva categoría de material.' })
    async createCategoria(@Body() dto: CreateCategoriaDto) {
        return this.inventarioService.createCategoria(dto);
    }

    @Post('/create/unidad-medicion')
    @ApiOperation({ summary: 'Crea una nueva unidad de medición.' })
    async createUnidadMedicion(@Body() dto: CreateUnidadMedicionDto) {
        return this.inventarioService.createUnidadMedicion(dto);
    }

    @Put('/update/unidad-medicion/:unidadId')
    @ApiOperation({ summary: 'Actualiza una unidad de medición existente.' })
    async updateUnidadMedicion(
        @Param('unidadId', ParseIntPipe) unidadId: number,
        @Body() dto: UpdateUnidadMedicionDto
    ) {
        return this.inventarioService.updateUnidadMedicion(unidadId, dto);
    }

    @Patch('/update/estado/unidad-medicion/:unidadId/:estadoUnidadId')
    @ApiOperation({ summary: 'Cambia el estado de una unidad de medición al estado especificado.' })
    async cambiarEstadoUnidadMedicion(
        @Param('unidadId', ParseIntPipe) unidadId: number, 
        @Param('estadoUnidadId', ParseIntPipe) estadoUnidadId: number
    ) {
        return this.inventarioService.updateEstadoUnidadMedicion(unidadId, estadoUnidadId);
    }

    @Patch('/ingreso/material/:materialId')
    @ApiOperation({ summary: 'Registra el ingreso de una cantidad específica de un material al inventario.' })
    async ingresoMaterial(
        @Param('materialId', ParseIntPipe) materialId: number,
        @Body() dto: IngresoEgresoMaterialDto
    ) {
        return this.inventarioService.IngresoMaterial(materialId, dto);
    }

    @Patch('/egreso/material/:materialId')
    @ApiOperation({ summary: 'Registra el egreso de una cantidad específica de un material del inventario.' })
    async egresoMaterial(
        @Param('materialId', ParseIntPipe) materialId: number,
        @Body() dto: IngresoEgresoMaterialDto
    ) {
        return this.inventarioService.EgresoMaterial(materialId, dto);
    }

    @Delete('/delete/unidad-medicion/:unidadId')
    @ApiOperation({ summary: 'Elimina una unidad de medición (solo si no está en uso).' })
    async deleteUnidadMedicion(@Param('unidadId', ParseIntPipe) unidadId: number) {
        return this.inventarioService.deleteUnidadMedicion(unidadId);
    }
}
