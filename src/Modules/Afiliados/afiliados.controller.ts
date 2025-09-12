import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { AfiliadosService } from "./afiliados.service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateAfiliadoFisicoDto, CreateAfiliadoJuridicoDto } from "./AfiliadoDTO's/CreateAfiliado.dto";
import { UpdateAfiliadoFisicoDto, UpdateAfiliadoJuridicoDto } from "./AfiliadoDTO's/UpdateAfiliado.dto";

@Controller('afiliados')
export class AfiliadosController {
    constructor(private readonly afiliadosService: AfiliadosService) {}

    @Get('fisico/all')
    @ApiOperation({ summary: 'Obtener todos los afiliados físicos' })
    findAllFisicos() {
        return this.afiliadosService.getAfiliadosFisicos();
    }

    @Get('juridico/all')
    @ApiOperation({ summary: 'Obtener todos los afiliados jurídicos' })
    findAllJuridicos() {
        return this.afiliadosService.getAfiliadosJuridicos();
    }

    @Post('/fisico/create')
    @ApiOperation({ summary: 'Crear un nuevo afiliado físico' })
    createAfiliadoFisico(@Body() dto: CreateAfiliadoFisicoDto) {
        return this.afiliadosService.createAfiliadoFisico(dto);
    }

    @Post('/juridico/create')
    @ApiOperation({ summary: 'Crear un nuevo afiliado jurídico' })
    createAfiliadoJuridico(@Body() dto: CreateAfiliadoJuridicoDto) {
        return this.afiliadosService.createAfiliadoJuridico(dto);
    }

    @Put('/update/fisico/:id')
    @ApiOperation({ summary: 'Actualizar un afiliado físico' })
    updateAfiliadoFisico(@Param('id') id: string, @Body() dto: UpdateAfiliadoFisicoDto) {
        return this.afiliadosService.updateAfiliadoFisico(id, dto);
    }

    @Put('/update/juridico/:id')
    @ApiOperation({ summary: 'Actualizar un afiliado jurídico' })
    updateAfiliadoJuridico(@Param('id') id: string, @Body() dto: UpdateAfiliadoJuridicoDto) {
        return this.afiliadosService.updateAfiliadoJuridico(id, dto);
    }

    @Put('/update/estado/fisico/:id/estado/:nuevoEstadoId')
    @ApiOperation({ summary: 'Actualizar estado de un afiliado físico' })
    updateEstadoAfiliado(@Param('id') id: string, @Param('nuevoEstadoId') nuevoEstadoId: number) {
        return this.afiliadosService.updateEstadoAfiliadoFisico(id, nuevoEstadoId);
    }

    @Put('update/estado/juridico/:id/estado/:nuevoEstadoId')
    @ApiOperation({ summary: 'Actualizar estado de un afiliado jurídico' })
    updateEstadoAfiliadoJuridico(@Param('id') id: string, @Param('nuevoEstadoId') nuevoEstadoId: number) {
        return this.afiliadosService.updateEstadoAfiliadoJuridico(id, nuevoEstadoId);
    }

    @Put('/update/tipo/fisico/:id/tipo/:nuevoTipoId')
    @ApiOperation({ summary: 'Actualizar tipo de un afiliado físico' })
    updateTipoAfiliadoFisico(@Param('id') id: number, @Param('nuevoTipoId') nuevoTipoId: number) {
        return this.afiliadosService.updateTipoAfiliadoFisico(id, nuevoTipoId);
    }

    @Put('/update/tipo/juridico/:id/tipo/:nuevoTipoId')
    @ApiOperation({ summary: 'Actualizar tipo de un afiliado jurídico' })
    updateTipoAfiliadoJuridico(@Param('id') id: number, @Param('nuevoTipoId') nuevoTipoId: number) {
        return this.afiliadosService.updateTipoAfiliadoJuridico(id, nuevoTipoId);
    }
}