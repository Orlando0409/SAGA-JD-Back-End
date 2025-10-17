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

  @Get('/invisibles')
  @ApiOperation({ summary: 'Obtener proyectos invisibles (estado inactivo)' })
  getProyectosInvisibles() {
    return this.proyectoService.getProyectosInvisibles();
  }

  @Get('/all')
  @ApiOperation({ summary: 'Obtener todos los proyectos' })
  getProyectos() {
    return this.proyectoService.getAllProyectos();
  }

  @Post('/create/:idUsuario')
  @UseInterceptors(FileInterceptor("Imagen_Proyecto"))
  @ApiOperation({ summary: "Crear un nuevo proyecto" })
  CreateProyecto(
      @Body() createProyectoDto: CreateProyectoDto,
      @Param('idUsuario', ParseIntPipe) idUsuario: number,
      @UploadedFile() Imagen_Proyecto: Express.Multer.File,
  ) {
      return this.proyectoService.CreateProyecto(createProyectoDto, idUsuario, Imagen_Proyecto);
  }

  @Put('/update/:id/:idUsuario')
  @ApiOperation({ summary: 'Actualizar un proyecto por ID' })
  updateProyecto(@Param('id', ParseIntPipe) id_Proyecto: number, @Body() UpdateProyectoDto: UpdateProyectoDto, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.proyectoService.UpdateProyecto(id_Proyecto, UpdateProyectoDto, idUsuario);
  }

  @Patch(':id/update/estado/:nuevoEstadoId/:idUsuario')
  @ApiOperation({ summary: 'Actualizar el estado de proyecto por ID' })
  updateEstadoProyecto(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.proyectoService.updateEstadoProyecto(id, nuevoEstadoId, idUsuario);
  }

  @Patch('/update/visibilidad/:id/:idUsuario')
  @ApiOperation({ summary: 'Actualizar la visibilidad del proyecto por ID' })
  updateVisibilidadProyecto(@Param('id', ParseIntPipe) id: number, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.proyectoService.updateVisibilidadProyecto(id, idUsuario);
  }
}