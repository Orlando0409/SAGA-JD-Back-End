import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { ProyectoService } from "./proyecto.service";
import { CrearProyectoDto } from "./ProyectoDTO's/CreaProyecto.dto";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";

@Controller('proyectos')
export class ProyectoController
{
  constructor(private readonly proyectoService: ProyectoService) {}

  @Public()
  @Get('/all')
    AllProyectos() 
    {
      return this.proyectoService.AllProyects();
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

  @Put('/update/:id')
    UpdateProyecto( @Param('id', ParseIntPipe) id_Proyecto: number, @Body() CrearProyectoDto: CrearProyectoDto )
    {
      return this.proyectoService.UpdateProyecto(id_Proyecto, CrearProyectoDto);
    }

  @Delete('/delete/:id')
    DeleteProyecto(@Param('id', ParseIntPipe) id_Proyecto: number)
    {
      return this.proyectoService.DeleteProyecto(id_Proyecto);
    }
}