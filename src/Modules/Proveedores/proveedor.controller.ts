import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Patch, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorFisicoDto, CreateProveedorJuridicoDto } from './ProveedoresDTOs/CreateProveedor.dto';
import { UpdateProveedorFisicoDto, UpdateProveedorJuridicoDto } from './ProveedoresDTOs/UpdateProveedor.dto';
import { UpdateEstadoProveedorDto } from './ProveedoresDTOs/UpdateEstadoProveedor.dto';
import { ExportProveedoresPdfDto } from './ProveedoresDTOs/ExportProveedoresPdf.dto';
import { JwtAuthGuard } from '../auth/Guard/JwtGuard';
import { RequierePermisos } from '../auth/Decorator/Permiso.decorator';

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

    @Post('pdf')
    async exportarPdf(
        @Body() dto: ExportProveedoresPdfDto,
        @Res() res: Response,
    ) {
        await this.proveedorService.generarProveedoresPdf(dto, res);
    }

    @Post('fisico/create')
    @RequierePermisos('proveedores', 'editar')
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
    @RequierePermisos('proveedores', 'editar')
    updateFisico(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProveedorFisicoDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.proveedorService.updateFisico(id, dto, idUsuario);
    }

    @Delete('fisico/:id')
    @RequierePermisos('proveedores', 'editar')
    removeFisico(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.proveedorService.removeFisico(id, idUsuario);
    }

    @Post('juridico/create')
    @RequierePermisos('proveedores', 'editar')
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
    @RequierePermisos('proveedores', 'editar')
    updateJuridico(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProveedorJuridicoDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.proveedorService.updateJuridico(id, dto, idUsuario);
    }

    @Delete('juridico/:id')
    @RequierePermisos('proveedores', 'editar')
    removeJuridico(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.proveedorService.removeJuridico(id, idUsuario);
    }

    @Patch('Fisico/:id/estado')
    @RequierePermisos('proveedores', 'editar')
    updateEstadoFisico(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEstadoProveedorDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.proveedorService.updateEstadoFisico(id, dto, idUsuario);
    }

    @Patch('Juridico/:id/estado')
    @RequierePermisos('proveedores', 'editar')
    updateEstadoJuridico(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEstadoProveedorDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.proveedorService.updateEstadoJuridico(id, dto, idUsuario);
    }
}