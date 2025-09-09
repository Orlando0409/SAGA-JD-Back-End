import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AsociadosService } from '../Services/asociados.service';
import { CreateAsociadoDto } from '../AfiliadoDTO\'s/CreateAsociado.dto';
import { UpdateAsociadoDto } from '../AfiliadoDTO\'s/UpdateAsociado.dto';

@Controller('asociados')
export class AsociadosController {
  constructor(private readonly asociadosService: AsociadosService) {}

  @Get('/all')
  @ApiOperation({ summary: 'Obtener todos los asociados' })
  getAllAsociados() {
    return this.asociadosService.getAllAsociados();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener asociado por ID' })
  getAsociadoById(@Param('id', ParseIntPipe) id: number) {
    return this.asociadosService.getAsociadoById(id);
  }

  @Get('/cedula/:cedula')
  @ApiOperation({ summary: 'Obtener asociado por cédula' })
  getAsociadoByCedula(@Param('cedula') cedula: string) {
    return this.asociadosService.getAsociadoByCedula(cedula);
  }

  @Post('/create')
  @ApiOperation({ summary: 'Crear un nuevo asociado (requiere solicitud de asociado aprobada)' })
  createAsociado(@Body() dto: CreateAsociadoDto) {
    return this.asociadosService.createAsociado(dto);
  }

  @Put('/update/:id')
  @ApiOperation({ summary: 'Actualizar un asociado por ID' })
  updateAsociado(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAsociadoDto) {
    return this.asociadosService.updateAsociado(id, dto);
  }

  @Put(':id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de un asociado por ID' })
  updateEstadoAsociado(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.asociadosService.updateEstadoAsociado(id, nuevoEstadoId);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Eliminar un asociado por ID' })
  deleteAsociado(@Param('id', ParseIntPipe) id: number) {
    return this.asociadosService.deleteAsociado(id);
  }
}
