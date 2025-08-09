import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { ProyectoService } from "./proyecto.service";
import { CrearProyectoDto } from "./ProyectoDTO's/CrearProyecto.dto";

@Controller('proyectos')
export class ProyectoController
{
  constructor(private readonly proyectoService: ProyectoService) {}

  @Get('/all')
    AllProyectos() 
    {
      return this.proyectoService.AllProyectos();
    }

  @Get(':id')
    findProyecto(@Param('id', ParseIntPipe) id: number)
    {
      return this.proyectoService.findProyecto(id);
    }

  @Post('/create')
    CrearProyecto(@Body() CrearProyectoDto: CrearProyectoDto)
    {
      return this.proyectoService.CreateProyecto(CrearProyectoDto);
    }

  @Delete('/delete/:id')
    DeleteProyecto(@Param('id', ParseIntPipe) id_Proyecto: number)
    {
      return this.proyectoService.DeleteProyecto(id_Proyecto);
    }
}