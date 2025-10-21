import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UploadedFile, UseInterceptors, UseGuards, Request } from "@nestjs/common";
import { ProyectoService } from "./proyecto.service";
import { ApiOperation } from "@nestjs/swagger";
import { UpdateProyectoDto } from "./ProyectoDTO's/UpdateProyecto.dto";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { CreateProyectoDto } from "./ProyectoDTO's/CreateProyecto.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/Guard/JwtGuard";

@Controller('proyectos')
@UseGuards(JwtAuthGuard)
export class ProyectoController {
  constructor(private readonly proyectoService: ProyectoService) { }

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

  @Put('/update/:idProyecto/:idUsuario')
  @ApiOperation({ summary: 'Actualizar un proyecto por ID' })
  updateProyecto(@Param('idProyecto', ParseIntPipe) idProyecto: number, @Body() UpdateProyectoDto: UpdateProyectoDto, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.proyectoService.UpdateProyecto(idProyecto, UpdateProyectoDto, idUsuario);
  }

  @Patch(':idProyecto/update/estado/:idEstadoProyecto/:idUsuario')
  @ApiOperation({ summary: 'Actualizar el estado de proyecto por ID' })
  updateEstadoProyecto(@Param('idProyecto', ParseIntPipe) idProyecto: number, @Param('idEstadoProyecto', ParseIntPipe) idEstadoProyecto: number, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.proyectoService.updateEstadoProyecto(idProyecto, idEstadoProyecto, idUsuario);
  }

  @Patch('/update/visibilidad/:idProyecto/:idUsuario')
  @ApiOperation({ summary: 'Actualizar la visibilidad del proyecto por ID' })
  updateVisibilidadProyecto(@Param('idProyecto', ParseIntPipe) idProyecto: number, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.proyectoService.updateVisibilidadProyecto(idProyecto, idUsuario);
  }
}