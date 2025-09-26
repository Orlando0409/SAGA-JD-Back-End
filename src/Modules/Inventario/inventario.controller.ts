import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateMaterialDto } from './InventarioDTO\'s/CreateMaterial.dto';
import { ApiOperation } from '@nestjs/swagger';
import { CreateCategoriaDto } from './InventarioDTO\'s/CreateCategoria.dto';

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

    @Post('/add/material/:materialId/:categoriaId')
    @ApiOperation({ summary: 'Agrega una categoría a un material existente.' })
    async addCategoriaToMaterial(
        @Param('materialId', ParseIntPipe) materialId: number,
        @Param('categoriaId', ParseIntPipe) categoriaId: number
    ) {
        return this.inventarioService.addCategoriaToMaterial(materialId, categoriaId);
    }

    @Delete('/remove/material/:materialId/:categoriaId')
    @ApiOperation({ summary: 'Remueve una categoría de un material.' })
    async removeCategoriaFromMaterial(
        @Param('materialId', ParseIntPipe) materialId: number,
        @Param('categoriaId', ParseIntPipe) categoriaId: number
    ) {
        return this.inventarioService.removeCategoriaFromMaterial(materialId, categoriaId);
    }
}
