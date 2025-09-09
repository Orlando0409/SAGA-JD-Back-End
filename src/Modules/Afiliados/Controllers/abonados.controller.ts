import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AbonadosService } from '../Services/abonados.service';
import { CreateAbonadoDto } from '../AfiliadoDTO\'s/CreateAbonado.dto';
import { UpdateAbonadoDto } from '../AfiliadoDTO\'s/UpdateAbonado.dto';

@Controller('abonados')
export class AbonadosController {
  constructor(private readonly abonadosService: AbonadosService) {}

  @Get('/all')
  @ApiOperation({ summary: 'Obtener todos los abonados' })
  getAllAbonados() {
    return this.abonadosService.getAllAbonados();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener abonado por ID' })
  getAbonadoById(@Param('id', ParseIntPipe) id: number) {
    return this.abonadosService.getAbonadoById(id);
  }

  @Get('/cedula/:cedula')
  @ApiOperation({ summary: 'Obtener abonado por cédula' })
  getAbonadoByCedula(@Param('cedula') cedula: string) {
    return this.abonadosService.getAbonadoByCedula(cedula);
  }

  @Post('/create')
  @ApiOperation({ summary: 'Crear un nuevo abonado (requiere solicitud de afiliación aprobada)' })
  createAbonado(@Body() dto: CreateAbonadoDto) {
    return this.abonadosService.createAbonado(dto);
  }

  @Put('/update/:id')
  @ApiOperation({ summary: 'Actualizar un abonado por ID' })
  updateAbonado(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAbonadoDto) {
    return this.abonadosService.updateAbonado(id, dto);
  }

  @Put(':id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de un abonado por ID' })
  updateEstadoAbonado(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.abonadosService.updateEstadoAbonado(id, nuevoEstadoId);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Eliminar un abonado por ID' })
  deleteAbonado(@Param('id', ParseIntPipe) id: number) {
    return this.abonadosService.deleteAbonado(id);
  }
}
