import { Body, Controller, Get, Post } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateMaterialDto } from './InventarioDTO\'s/CreateMaterial.dto';
import { CreateCategoriaMaterialDto } from './InventarioDTO\'s/CreateCategoriaMaterial.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('Inventario')
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

    @Post('/create/material')
    @ApiOperation({ summary: 'Crea un nuevo material en el inventario.' })
    async createMaterial(@Body() dto: CreateMaterialDto) {
        return this.inventarioService.createMaterial(dto);
    }

    @Post('/create/categoria')
    @ApiOperation({ summary: 'Crea una nueva categoría de material.' })
    async createCategoria(@Body() dto: CreateCategoriaMaterialDto) {
        return this.inventarioService.createCategoria(dto);
    }
}
