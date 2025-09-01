import { Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { CalidadAguaService } from "./calidadAgua.service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateCalidadAguaDto } from "./CalidadAguaDTO's/CreateCalidadAgua.dto";

@Controller('CalidadAgua')
export class CalidadAguaController
{
    constructor (private readonly calidadAguaService: CalidadAguaService) {}

    @Get('/all')
    @ApiOperation({ summary: 'Obtener todos los registros de calidad de agua' })
    getCalidadAgua(){
        return this.calidadAguaService.getCalidadAgua();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener registro por ID' })
    findCalidadAguabyId(@Param('id', ParseIntPipe) id: number) {
        return this.calidadAguaService.getCalidadAguaById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo registro de calidad de agua' })
    CreateCalidadAgua(@Body() CreateCalidadAguaDto: CreateCalidadAguaDto) {
        return this.calidadAguaService.CreateCalidadAgua(CreateCalidadAguaDto)
    }
}