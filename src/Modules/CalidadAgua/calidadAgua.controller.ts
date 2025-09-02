import { Body, Controller, Get, Param, ParseIntPipe, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { CalidadAguaService } from "./calidadAgua.service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateCalidadAguaDto } from "./CalidadAguaDTO's/CreateCalidadAgua.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('calidad-agua')
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

    @Post('/create')
    @UseInterceptors(FileInterceptor("Archivo_Calidad_Agua"))
    @ApiOperation({ summary: "Crear un nuevo registro de calidad de agua" })
    CreateCalidadAgua(
        @Body() createCalidadAguaDto: CreateCalidadAguaDto,
        @UploadedFile() Archivo_Calidad_Agua: Express.Multer.File,
    ) {
        return this.calidadAguaService.CreateCalidadAgua(createCalidadAguaDto, Archivo_Calidad_Agua);
    }
}