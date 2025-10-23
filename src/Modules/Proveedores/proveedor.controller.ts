import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Patch, Request } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorFisicoDto, CreateProveedorJuridicoDto } from './ProveedoresDTOs/CreateProveedor.dto';
import { UpdateProveedorFisicoDto, UpdateProveedorJuridicoDto } from './ProveedoresDTOs/UpdateProveedor.dto';
import { UpdateEstadoProveedorDto } from './ProveedoresDTOs/UpdateEstadoProveedor.dto';
import { Proveedor, ProveedorFisico, ProveedorJuridico } from './ProveedorEntities/Proveedor.Entity';
import { JwtAuthGuard } from '../auth/Guard/JwtGuard';
import { UseGuards } from '@nestjs/common';

@Controller('Proveedores')
@UseGuards(JwtAuthGuard)
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @Get('All')
  findAll(): Promise<Proveedor[]> {
    return this.proveedorService.findAll();
  }

  @Post('fisico/create/:idUsuario')
  createFisico(@Body() dto: CreateProveedorFisicoDto, @Param('idUsuario', ParseIntPipe) idUsuario: number): Promise<ProveedorFisico> {
    return this.proveedorService.createFisico(dto, idUsuario);
  }

  @Get('fisico')
  findAllFisico(): Promise<ProveedorFisico[]> {
    return this.proveedorService.findAllFisico();
  }

  @Get('fisico/:id')
  findOneFisico(@Param('id', ParseIntPipe) id: number): Promise<ProveedorFisico> {
    return this.proveedorService.findOneFisico(id);
  }

  @Put('fisico/:id/:idUsuario')
  updateFisico(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProveedorFisicoDto,
    @Param('idUsuario', ParseIntPipe) idUsuario: number
  ): Promise<ProveedorFisico> {
    return this.proveedorService.updateFisico(id, dto, idUsuario);
  }

  @Delete('fisico/:id/:idUsuario')
  removeFisico(@Param('id', ParseIntPipe) id: number, @Param('idUsuario', ParseIntPipe) idUsuario: number): Promise<void> {
    return this.proveedorService.removeFisico(id, idUsuario);
  }

  @Post('juridico/:idUsuario')
  createJuridico(@Body() dto: CreateProveedorJuridicoDto, @Param('idUsuario', ParseIntPipe) idUsuario: number): Promise<ProveedorJuridico> {
    return this.proveedorService.createJuridico(dto, idUsuario);
  }

  @Get('juridico')
  findAllJuridico(): Promise<ProveedorJuridico[]> {
    return this.proveedorService.findAllJuridico();
  }

  @Get('juridico/:id')
  findOneJuridico(@Param('id', ParseIntPipe) id: number): Promise<ProveedorJuridico> {
    return this.proveedorService.findOneJuridico(id);
  }

  @Put('juridico/:id/:idUsuario')
  updateJuridico(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProveedorJuridicoDto,
    @Param('idUsuario', ParseIntPipe) idUsuario: number
  ): Promise<ProveedorJuridico> {
    return this.proveedorService.updateJuridico(id, dto, idUsuario);
  }

  @Delete('juridico/:id/:idUsuario')
  removeJuridico(@Param('id', ParseIntPipe) id: number, @Param('idUsuario', ParseIntPipe) idUsuario: number): Promise<void> {
    return this.proveedorService.removeJuridico(id, idUsuario);
  }

  @Patch('Fisico/:id/estado/:idUsuario')
  updateEstadoFisico(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEstadoProveedorDto, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.proveedorService.updateEstadoFisico(id, dto, idUsuario);
  }

  @Patch('Juridico/:id/estado/:idUsuario')
  updateEstadoJuridico(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEstadoProveedorDto, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.proveedorService.updateEstadoJuridico(id, dto, idUsuario);
  }
}