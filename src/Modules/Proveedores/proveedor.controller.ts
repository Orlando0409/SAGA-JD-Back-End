import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Patch, Request, UseGuards } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorFisicoDto, CreateProveedorJuridicoDto } from './ProveedoresDTOs/CreateProveedor.dto';
import { UpdateProveedorFisicoDto, UpdateProveedorJuridicoDto } from './ProveedoresDTOs/UpdateProveedor.dto';
import { UpdateEstadoProveedorDto } from './ProveedoresDTOs/UpdateEstadoProveedor.dto';
import { JwtAuthGuard } from '../auth/Guard/JwtGuard';

@Controller('Proveedores')
@UseGuards(JwtAuthGuard)
export class ProveedorController {
    constructor(
        private readonly proveedorService: ProveedorService
    ) { }

    @Get('All')
    findAll() {
        return this.proveedorService.findAll();
    }

    @Post('fisico/create')
    createFisico(
        @Body() dto: CreateProveedorFisicoDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.proveedorService.createFisico(dto, idUsuario);
    }

    @Get('fisico')
    findAllFisico() {
        return this.proveedorService.findAllFisico();
    }

    @Get('fisico/:id')
    findOneFisico(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.proveedorService.findOneFisico(id);
    }

    @Put('fisico/:id')
    updateFisico(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProveedorFisicoDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.proveedorService.updateFisico(id, dto, idUsuario);
    }

    @Delete('fisico/:id')
    removeFisico(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.proveedorService.removeFisico(id, idUsuario);
    }

    @Post('juridico/create')
    createJuridico(
        @Body() dto: CreateProveedorJuridicoDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.proveedorService.createJuridico(dto, idUsuario);
    }

    @Get('juridico')
    findAllJuridico() {
        return this.proveedorService.findAllJuridico();
    }

    @Get('juridico/:id')
    findOneJuridico(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.proveedorService.findOneJuridico(id);
    }

    @Put('juridico/:id')
    updateJuridico(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProveedorJuridicoDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.proveedorService.updateJuridico(id, dto, idUsuario);
    }

    @Delete('juridico/:id')
    removeJuridico(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.proveedorService.removeJuridico(id, idUsuario);
    }

    @Patch('Fisico/:id/estado')
    updateEstadoFisico(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEstadoProveedorDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.proveedorService.updateEstadoFisico(id, dto, idUsuario);
    }

    @Patch('Juridico/:id/estado')
    updateEstadoJuridico(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEstadoProveedorDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.proveedorService.updateEstadoJuridico(id, dto, idUsuario);
    }
}