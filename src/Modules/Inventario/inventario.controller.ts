import { Body, Controller, Get, Post } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateMaterialDto } from './InventarioDTO\'s/CreateMaterial.dto';
import { CreateCategoriaMaterialDto } from './InventarioDTO\'s/CreateCategoriaMaterial.dto';

@Controller('Inventario')
export class InventarioController {
    constructor(private readonly inventarioService: InventarioService) {}

    @Get('/all/materiales')
    async getAllMaterials() {
        return this.inventarioService.getAllMaterials();
    }

    @Get('/all/categorias')
    async getAllCategories() {
        return this.inventarioService.getAllCategories();
    }

    @Post('/create/material')
    async createMaterial(@Body() dto: CreateMaterialDto) {
        return this.inventarioService.createMaterial(dto);
    }

    @Post('/create/categoria')
    async createCategoria(@Body() dto: CreateCategoriaMaterialDto) {
        return this.inventarioService.createCategoria(dto);
    }
}
