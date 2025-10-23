import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Patch, Request, UseGuards } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorFisicoDto, CreateProveedorJuridicoDto } from './ProveedoresDTOs/CreateProveedor.dto';
import { UpdateProveedorFisicoDto, UpdateProveedorJuridicoDto } from './ProveedoresDTOs/UpdateProveedor.dto';
import { UpdateEstadoProveedorDto } from './ProveedoresDTOs/UpdateEstadoProveedor.dto';
import { Proveedor, ProveedorFisico, ProveedorJuridico } from './ProveedorEntities/Proveedor.Entity';
import { JwtAuthGuard } from '../auth/Guard/JwtGuard';
import { GetUser } from '../auth/Decorator/GetUser.decorator';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';

@Controller('Proveedores')
export class ProveedorController {
  constructor(
    private readonly proveedorService: ProveedorService
  ) { }

  @Get('All')
  findAll(): Promise<Proveedor[]> {
    return this.proveedorService.findAll();
  }

  @Post('fisico/create')
  createFisico(
    @Body() dto: CreateProveedorFisicoDto,
    @GetUser() usuario: Usuario
  ): Promise<ProveedorFisico> {
    return this.proveedorService.createFisico(dto, usuario.Id_Usuario);
  }

  @Get('fisico')
  findAllFisico(): Promise<ProveedorFisico[]> {
    return this.proveedorService.findAllFisico();
  }

  @Get('fisico/:id')
  findOneFisico(
    @Param('id', ParseIntPipe) id: number
  ): Promise<ProveedorFisico> {
    return this.proveedorService.findOneFisico(id);
  }

  @Put('fisico/:id')
  @Put('fisico/:id')
  updateFisico(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProveedorFisicoDto,
    @GetUser() usuario: Usuario
  ): Promise<ProveedorFisico> {
    return this.proveedorService.updateFisico(id, dto, usuario.Id_Usuario);
  }

  @Delete('fisico/:id')
  removeFisico(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: Usuario
  ): Promise<void> {
    return this.proveedorService.removeFisico(id, usuario.Id_Usuario);
  }

  @Post('juridico/create')
  createJuridico(
    @Body() dto: CreateProveedorJuridicoDto,
    @GetUser() usuario: Usuario
  ): Promise<ProveedorJuridico> {
    return this.proveedorService.createJuridico(dto, usuario.Id_Usuario);
  }

  @Get('juridico')
  findAllJuridico(): Promise<ProveedorJuridico[]> {
    return this.proveedorService.findAllJuridico();
  }

  @Get('juridico/:id')
  findOneJuridico(
    @Param('id', ParseIntPipe) id: number
  ): Promise<ProveedorJuridico> {
    return this.proveedorService.findOneJuridico(id);
  }

  @Put('juridico/:id')
  @Put('juridico/:id')
  updateJuridico(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProveedorJuridicoDto,
    @GetUser() usuario: Usuario
  ): Promise<ProveedorJuridico> {
    return this.proveedorService.updateJuridico(id, dto, usuario.Id_Usuario);
  }

  @Delete('juridico/:id')
  removeJuridico(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: Usuario
  ) {
    return this.proveedorService.removeJuridico(id, usuario.Id_Usuario);
  }

  @Patch('Fisico/:id/estado')
  updateEstadoFisico(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoProveedorDto,
    @GetUser() usuario: Usuario
  ) {
    return this.proveedorService.updateEstadoFisico(id, dto, usuario.Id_Usuario);
  }

  @Patch('Juridico/:id/estado')
  updateEstadoJuridico(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoProveedorDto,
    @GetUser() usuario: Usuario
  ) {
    return this.proveedorService.updateEstadoJuridico(id, dto, usuario.Id_Usuario);
  }
}