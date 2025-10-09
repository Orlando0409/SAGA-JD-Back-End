import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ProyectoService } from "./proyecto.service";
import { ApiOperation } from "@nestjs/swagger";
import { UpdateProyectoDto } from "./ProyectoDTO's/UpdateProyecto.dto";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { CreateProyectoDto } from "./ProyectoDTO's/CreateProyecto.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('proyectos')
export class ProyectoController
{
  constructor(private readonly proyectoService: ProyectoService) {}

  @Public()
  @Get('/visibles')
  @ApiOperation({ summary: 'Obtener proyectos visibles (estado activo)' })
  getProyectosVisibles() {
    return this.proyectoService.getProyectosVisibles();
  }

  @Get('/all')
  @ApiOperation({ summary: 'Obtener todos los proyectos' })
  getProyectos() {
    return this.proyectoService.getAllProyectos();
  }

  @Post('/create/:idUsuarioCreador')
  @UseInterceptors(FileInterceptor("Imagen_Proyecto"))
  @ApiOperation({ summary: "Crear un nuevo proyecto" })
  CreateProyecto(
      @Body() createProyectoDto: CreateProyectoDto,
      @Param('idUsuarioCreador', ParseIntPipe) idUsuarioCreador: number,
      @UploadedFile() Imagen_Proyecto: Express.Multer.File,
  ) {
      return this.proyectoService.CreateProyecto(createProyectoDto, idUsuarioCreador, Imagen_Proyecto);
  }

  @Put('/update/:id')
  @ApiOperation({ summary: 'Actualizar un proyecto por ID' })
  updateProyecto(@Param('id', ParseIntPipe) id_Proyecto: number, @Body() UpdateProyectoDto: UpdateProyectoDto) {
    return this.proyectoService.UpdateProyecto(id_Proyecto, UpdateProyectoDto);
  }

  @Patch(':id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de proyecto por ID' })
  updateEstadoProyecto(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.proyectoService.updateEstadoProyecto(id, nuevoEstadoId);
  }

  @Patch('/update/visibilidad/:id')
  @ApiOperation({ summary: 'Actualizar la visibilidad del proyecto por ID' })
  updateVisibilidadProyecto(@Param('id', ParseIntPipe) id: number) {
    return this.proyectoService.updateVisibilidadProyecto(id);
  }
}