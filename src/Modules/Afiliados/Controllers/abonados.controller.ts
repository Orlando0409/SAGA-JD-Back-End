import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AbonadosService } from '../Services/abonados.service';
import { UpdateAbonadoFisicoDto, UpdateAbonadoJuridicoDto } from '../AfiliadoDTO\'s/UpdateAbonado.dto';
import { SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica } from 'src/Modules/Solicitudes/SolicitudEntities/Solicitud.Entity';

@Controller('abonados')
export class AbonadosController {
  constructor(private readonly abonadosService: AbonadosService) {}

  @Get('/all')
  @ApiOperation({ summary: 'Obtener todos los abonados' })
  getAllAbonados() {
    return this.abonadosService.getAllAbonados();
  }

  @Get('/fisico/all')
  @ApiOperation({ summary: 'Obtener todos los abonados físicos' })
  getAllAbonadosFisicos() {
    return this.abonadosService.getAbonadosFisicos();
  }

  @Get('/juridico/all')
  @ApiOperation({ summary: 'Obtener todos los abonados jurídicos' })
  getAllAbonadosJuridicos() {
    return this.abonadosService.getAbonadosJuridicos();
  }

  @Get('/fisico/:id')
  @ApiOperation({ summary: 'Obtener abonado físico por ID' })
  getAbonadoFisicoById(@Param('id', ParseIntPipe) id: number) {
    return this.abonadosService.getAbonadoFisicoById(id);
  }

  @Get('/juridico/:id')
  @ApiOperation({ summary: 'Obtener abonado jurídico por ID' })
  getAbonadoJuridicoById(@Param('id', ParseIntPipe) id: number) {
    return this.abonadosService.getAbonadoJuridicoById(id);
  }

  @Get('/fisico/cedula/:cedula')
  @ApiOperation({ summary: 'Obtener abonado físico por cédula' })
  getAbonadoFisicoByCedula(@Param('cedula') cedula: string) {
    return this.abonadosService.getAbonadoFisicoByCedula(cedula);
  }

  @Get('/juridico/cedula/:cedula')
  @ApiOperation({ summary: 'Obtener abonado jurídico por cédula jurídica' })
  getAbonadoJuridicoByCedula(@Param('cedula') cedula: string) {
    return this.abonadosService.getAbonadoJuridicoByCedula(cedula);
  }

  @Post('/fisico/create')
  @ApiOperation({ summary: 'Crear un nuevo abonado físico (requiere solicitud de afiliación aprobada)' })
  createAbonadoFisico(@Body() solicitud: SolicitudAfiliacionFisica) {
    return this.abonadosService.createAbonadoFisico(solicitud);
  }

  @Post('/juridico/create')
  @ApiOperation({ summary: 'Crear un nuevo abonado jurídico (requiere solicitud de afiliación aprobada)' })
  createAbonadoJuridico(@Body() dto: SolicitudAfiliacionJuridica) {
    return this.abonadosService.createAbonadoJuridico(dto);
  }

  @Put('/fisico/update/:id')
  @ApiOperation({ summary: 'Actualizar un abonado fisico por ID' })
  updateAbonadoFisico(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAbonadoFisicoDto) {
    return this.abonadosService.updateAbonadoFisico(id, dto);
  }

  @Put('/juridico/update/:id')
  @ApiOperation({ summary: 'Actualizar un abonado jurídico por ID' })
  updateAbonadoJuridico(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAbonadoJuridicoDto) {
    return this.abonadosService.updateAbonadoJuridico(id, dto);
  }

  @Put('/fisico/:id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de un abonado físico por ID' })
  updateEstadoAbonadoFisico(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.abonadosService.updateEstadoAbonadoFisico(id, nuevoEstadoId);
  }

  @Put('/juridico/:id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de un abonado jurídico por ID' })
  updateEstadoAbonadoJuridico(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.abonadosService.updateEstadoAbonadoJuridico(id, nuevoEstadoId);
  }

  @Delete('/fisico/delete/:id')
  @ApiOperation({ summary: 'Eliminar un abonado físico por ID' })
  deleteAbonadoFisico(@Param('id', ParseIntPipe) id: number) {
    return this.abonadosService.deleteAbonadoFisico(id);
  }

  @Delete('/juridico/delete/:id')
  @ApiOperation({ summary: 'Eliminar un abonado jurídico por ID' })
  deleteAbonadoJuridico(@Param('id', ParseIntPipe) id: number) {
    return this.abonadosService.deleteAbonadoJuridico(id);
  }
}
