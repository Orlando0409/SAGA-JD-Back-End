import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { ProyectoService } from "./proyecto.service";
import { CreateProyectoDto } from "./ProyectoDTO's/CrearProyecto.dto";

@Controller('proyectos')
export class ProyectoController
{
  constructor(private readonly proyectoService: ProyectoService) {}

  @Get('/all')
    AllProyectos() 
    {
      return this.proyectoService.getAllProyects();
    }

  @Get(':id')
    findProyecto(@Param('id', ParseIntPipe) id: number)
    {
      return this.proyectoService.findProyectobyId(id);
    }

  @Post('/create')
    CrearProyecto(@Body() CreateProyectoDto: CreateProyectoDto)
    {
      return this.proyectoService.CreateProyecto(CreateProyectoDto);
    }

  @Put('/update/:id')
    UpdateProyecto( @Param('id', ParseIntPipe) id_Proyecto: number, @Body() CreateProyectoDto: CreateProyectoDto )
    {
      return this.proyectoService.UpdateProyecto(id_Proyecto, CreateProyectoDto);
    }

  @Delete('/delete/:id')
    DeleteProyecto(@Param('id', ParseIntPipe) id_Proyecto: number)
    {
      return this.proyectoService.DeleteProyecto(id_Proyecto);
    }
}