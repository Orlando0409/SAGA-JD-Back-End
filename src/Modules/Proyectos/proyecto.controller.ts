import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { ProyectoService } from "./proyecto.service";
import { ApiOperation } from "@nestjs/swagger";
import { UpdateProyectoDto } from "./ProyectoDTO's/UpdateProyecto.dto";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { CreateProyectoDto } from "./ProyectoDTO's/CreateProyecto.dto";

@Controller('proyectos')
export class ProyectoController
{
  constructor(private readonly proyectoService: ProyectoService) {}

  @Public()
  @Get('/all')
  @ApiOperation({ summary: 'Obtener todos los proyectos' })
  getProyectos() {
    return this.proyectoService.getProyectos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener proyecto por ID' })
  findProyectobyId(@Param('id', ParseIntPipe) id: number) {
    return this.proyectoService.findProyectobyId(id);
  }

  @Post('/create')
  @ApiOperation({ summary: 'Crear un nuevo proyecto' })
  createProyecto(@Body() CreateProyectoDto: CreateProyectoDto) {
    return this.proyectoService.CreateProyecto(CreateProyectoDto);
  }

  @Put('/update/:id')
  @ApiOperation({ summary: 'Actualizar un proyecto por ID' })
  updateProyecto(@Param('id', ParseIntPipe) id_Proyecto: number, @Body() UpdateProyectoDto: UpdateProyectoDto) {
    return this.proyectoService.UpdateProyecto(id_Proyecto, UpdateProyectoDto);
  }

  @Put(':id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de proyecto por ID' })
  updateEstadoProyecto(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.proyectoService.updateEstadoProyecto(id, nuevoEstadoId);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Eliminar un proyecto por ID' })
  deleteProyecto(@Param('id', ParseIntPipe) id_Proyecto: number) {
    return this.proyectoService.DeleteProyecto(id_Proyecto);
  }
}