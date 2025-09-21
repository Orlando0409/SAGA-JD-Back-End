import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Patch } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorFisicoDto, CreateProveedorJuridicoDto } from './ProveedoresDTOs/CreateProveedor';
import { UpdateProveedorFisicoDto, UpdateProveedorJuridicoDto } from './ProveedoresDTOs/UpdateProveedor';
import { UpdateEstadoProveedorDto } from './ProveedoresDTOs/UpdateEstadoProveedor';
import { ProveedorFisico, ProveedorJuridico } from './ProveedorEntities/ProveedorEntity';

@Controller('proveedores')
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @Post('fisico')
  createFisico(@Body() dto: CreateProveedorFisicoDto): Promise<ProveedorFisico> {
    return this.proveedorService.createFisico(dto);
  }

  @Get('fisico')
  findAllFisico(): Promise<ProveedorFisico[]> {
    return this.proveedorService.findAllFisico();
  }

  @Get('fisico/:id')
  findOneFisico(@Param('id', ParseIntPipe) id: number): Promise<ProveedorFisico> {
    return this.proveedorService.findOneFisico(id);
  }

  @Put('fisico/:id')
  updateFisico(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProveedorFisicoDto
  ): Promise<ProveedorFisico> {
    return this.proveedorService.updateFisico(id, dto);
  }

  @Delete('fisico/:id')
  removeFisico(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.proveedorService.removeFisico(id);
  }

  @Post('juridico')
  createJuridico(@Body() dto: CreateProveedorJuridicoDto): Promise<ProveedorJuridico> {
    return this.proveedorService.createJuridico(dto);
  }

  @Get('juridico')
  findAllJuridico(): Promise<ProveedorJuridico[]> {
    return this.proveedorService.findAllJuridico();
  }

  @Get('juridico/:id')
  findOneJuridico(@Param('id', ParseIntPipe) id: number): Promise<ProveedorJuridico> {
    return this.proveedorService.findOneJuridico(id);
  }

  @Put('juridico/:id')
  updateJuridico(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProveedorJuridicoDto
  ): Promise<ProveedorJuridico> {
    return this.proveedorService.updateJuridico(id, dto);
  }

  @Delete('juridico/:id')
  removeJuridico(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.proveedorService.removeJuridico(id);
  }

  @Patch('Fisico/:id/estado')
    updateEstadoFisico(@Param('id') id: number, @Body() dto: UpdateEstadoProveedorDto) {
    return this.proveedorService.updateEstadoFisico(id, dto);
  }

  @Patch('Juridico/:id/estado')
  updateEstadoJuridico(@Param('id') id: number, @Body() dto: UpdateEstadoProveedorDto) {
    return this.proveedorService.updateEstadoJuridico(id, dto);
  }
}