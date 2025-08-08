import { Controller, Delete, Get, Post } from "@nestjs/common";
import { ProyectoService } from "./proyecto.service";

@Controller('proyectos')
export class ProyectoController
{
  constructor(private readonly proyectoService: ProyectoService) {}

  @Get('/all')
  async AllProyects() 
  {
    return this.proyectoService.AllProyects();
  }

  @Post('/create')
  async CreateProyecto(proyecto: any)
  {
    return this.proyectoService.CreateProyecto(proyecto);
  }

  @Delete('/delete/:id')
  async DeleteProyecto(Id_Proyecto: number) 
  {
    return this.proyectoService.DeleteProyecto(Id_Proyecto);
  }
}