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
  @UseInterceptors(FileInterceptor("Imagen_Proyecto"))
  @ApiOperation({ summary: "Crear un nuevo proyecto" })
  CreateProyecto(
      @Body() createProyectoDto: CreateProyectoDto,
      @UploadedFile() Imagen_Proyecto: Express.Multer.File,
  ) {
      return this.proyectoService.CreateProyecto(createProyectoDto, Imagen_Proyecto);
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
}