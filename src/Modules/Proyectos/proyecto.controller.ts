import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UploadedFile, UseInterceptors, UseGuards, Request } from "@nestjs/common";
import { ProyectoService } from "./proyecto.service";
import { ApiOperation } from "@nestjs/swagger";
import { UpdateProyectoDto } from "./ProyectoDTO's/UpdateProyecto.dto";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { CreateProyectoDto } from "./ProyectoDTO's/CreateProyecto.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/Guard/JwtGuard";
import { GetUser } from "../auth/Decorator/GetUser.decorator";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";

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
    @GetUser() usuario: Usuario,
    @UploadedFile() Imagen_Proyecto: Express.Multer.File,
  ) {
    return this.proyectoService.CreateProyecto(createProyectoDto, usuario.Id_Usuario, Imagen_Proyecto);
  }

  @Put('/update/:idProyecto')
  @ApiOperation({ summary: 'Actualizar un proyecto por ID' })
  updateProyecto(@Param('idProyecto', ParseIntPipe) idProyecto: number, @Body() UpdateProyectoDto: UpdateProyectoDto, @GetUser() usuario: Usuario) {
    return this.proyectoService.UpdateProyecto(idProyecto, UpdateProyectoDto, usuario.Id_Usuario);
  }

  @Patch(':idProyecto/update/estado/:idEstadoProyecto')
  @ApiOperation({ summary: 'Actualizar el estado de proyecto por ID' })
  updateEstadoProyecto(@Param('idProyecto', ParseIntPipe) idProyecto: number, @Param('idEstadoProyecto', ParseIntPipe) idEstadoProyecto: number, @GetUser() usuario: Usuario) {
    return this.proyectoService.updateEstadoProyecto(idProyecto, idEstadoProyecto, usuario.Id_Usuario);
  }

  @Patch('/update/visibilidad/:idProyecto')
  @ApiOperation({ summary: 'Actualizar la visibilidad del proyecto por ID' })
  updateVisibilidadProyecto(@Param('idProyecto', ParseIntPipe) idProyecto: number, @GetUser() usuario: Usuario) {
    return this.proyectoService.updateVisibilidadProyecto(idProyecto, usuario.Id_Usuario);
  }
}