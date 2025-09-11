import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AsociadosService } from '../Services/asociados.service';
import { CreateAsociadoDto } from '../AfiliadoDTO\'s/CreateAsociado.dto';
import { UpdateAsociadoDto } from '../AfiliadoDTO\'s/UpdateAsociado.dto';
import { Solicitud, SolicitudAsociadoFisica, SolicitudAsociadoJuridica } from 'src/Modules/Solicitudes/SolicitudEntities/Solicitud.Entity';

@Controller('asociados')
export class AsociadosController {
  constructor(private readonly asociadosService: AsociadosService) {}

  @Get('/all')
  @ApiOperation({ summary: 'Obtener todos los asociados' })
  getAllAsociados() {
    return this.asociadosService.getAllAsociados();
  }

  @Get('/fisico/all')
  @ApiOperation({ summary: 'Obtener todos los asociados físicos' })
  getAllAsociadosFisicos() {
    return this.asociadosService.getAsociadosFisicos();
  }

  @Get('/juridico/all')
  @ApiOperation({ summary: 'Obtener todos los asociados jurídicos' })
  getAllAsociadosJuridicos() {
    return this.asociadosService.getAsociadosJuridicos();
  }

  @Get('/fisico/:id')
  @ApiOperation({ summary: 'Obtener asociado físico por ID' })
  getAsociadoFisicoById(@Param('id', ParseIntPipe) id: number) {
    return this.asociadosService.getAsociadoFisicoById(id);
  }

  @Get('/juridico/:id')
  @ApiOperation({ summary: 'Obtener asociado jurídico por ID' })
  getAsociadoJuridicoById(@Param('id', ParseIntPipe) id: number) {
    return this.asociadosService.getAsociadoJuridicoById(id);
  }

  @Get('/fisico/cedula/:cedula')
  @ApiOperation({ summary: 'Obtener asociado físico por cédula' })
  getAsociadoFisicoByCedula(@Param('cedula') cedula: string) {
    return this.asociadosService.getAsociadoFisicoByCedula(cedula);
  }

  @Get('/juridica/cedula/:cedula')
  @ApiOperation({ summary: 'Obtener asociado jurídico por cédula' })
  getAsociadoJuridicoByCedula(@Param('cedula') cedula: string) {
    return this.asociadosService.getAsociadoJuridicoByCedula(cedula);
  }

  @Post('/fisico/create')
  @ApiOperation({ summary: 'Crear un nuevo asociado físico (requiere solicitud de asociado aprobada)' })
  createAsociadoFisico(@Body() Solicitud: SolicitudAsociadoFisica) {
    return this.asociadosService.createAsociadoFisico(Solicitud);
  }

  @Post('/juridico/create')
  @ApiOperation({ summary: 'Crear un nuevo asociado jurídico (requiere solicitud de asociado aprobada)' })
  createAsociadoJuridico(@Body() solicitud: SolicitudAsociadoJuridica) {
    return this.asociadosService.createAsociadoJuridico(solicitud);
  }

  @Put('/fisico/update/:id')
  @ApiOperation({ summary: 'Actualizar un asociado físico por ID' })
  updateAsociadoFisico(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAsociadoDto) {
    return this.asociadosService.updateAsociadoFisico(id, dto);
  }

  @Put('/juridico/update/:id')
  @ApiOperation({ summary: 'Actualizar un asociado jurídico por ID' })
  updateAsociadoJuridico(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAsociadoDto) {
    return this.asociadosService.updateAsociadoJuridico(id, dto);
  }

  @Put('/fisico/:id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de un asociado físico por ID' })
  updateEstadoAsociadoFisico(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.asociadosService.updateEstadoAsociadoFisico(id, nuevoEstadoId);
  }

  @Put('/juridico/:id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de un asociado jurídico por ID' })
  updateEstadoAsociadoJuridico(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.asociadosService.updateEstadoAsociadoJuridico(id, nuevoEstadoId);
  }

  @Delete('/fisico/delete/:id')
  @ApiOperation({ summary: 'Eliminar un asociado físico por ID' })
  deleteAsociadoFisico(@Param('id', ParseIntPipe) id: number) {
    return this.asociadosService.deleteAsociadoFisico(id);
  }

  @Delete('/juridico/delete/:id')
  @ApiOperation({ summary: 'Eliminar un asociado jurídico por ID' })
  deleteAsociadoJuridico(@Param('id', ParseIntPipe) id: number) {
    return this.asociadosService.deleteAsociadoJuridico(id);
  }
}
