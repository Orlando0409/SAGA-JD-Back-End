import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, UploadedFile, UseInterceptors } from "@nestjs/common";
import { CalidadAguaService } from "./calidadAgua.service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateCalidadAguaDto } from "./CalidadAguaDTO's/CreateCalidadAgua.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { Public } from "../auth/Decorator/Public.decorator";
import { UpdateCalidadAguaDto } from "./CalidadAguaDTO's/UpdateCalidadAgua.dto";

@Controller('calidad-agua')
export class CalidadAguaController
{
    constructor
    (
        private readonly calidadAguaService: CalidadAguaService
    ) {}

    @Public()
    @Get('/visibles')
    @ApiOperation({ summary: 'Obtener registros de calidad de agua visibles (estado activo)' })
    getCalidadAguaVisibles(){
        return this.calidadAguaService.getCalidadAguaVisibles();
    }

    @Get('/all')
    @ApiOperation({ summary: 'Obtener todos los registros de calidad de agua' })
    getCalidadAgua(){
        return this.calidadAguaService.getCalidadAgua();
    }

    @Post('/create/:idUsuarioCreador')
    @UseInterceptors(FileInterceptor("Archivo_Calidad_Agua"))
    @ApiOperation({ summary: "Crear un nuevo registro de calidad de agua" })
    CreateCalidadAgua(
        @Body() createCalidadAguaDto: CreateCalidadAguaDto,
        @Param('idUsuarioCreador', ParseIntPipe) idUsuarioCreador: number,
        @UploadedFile() Archivo_Calidad_Agua: Express.Multer.File,
    ) {
        return this.calidadAguaService.CreateCalidadAgua(createCalidadAguaDto, idUsuarioCreador, Archivo_Calidad_Agua);
    }

    @Put('/update/:id')
    @UseInterceptors(FileInterceptor('Archivo_Calidad_Agua'))
    @ApiOperation({ summary: 'Actualizar un registro de calidad de agua' })
    updateCalidadAgua(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCalidadAguaDto,
    @UploadedFile() Archivo_Calidad_Agua?: Express.Multer.File
    ) {
        return this.calidadAguaService.updateCalidadAgua(id, dto, Archivo_Calidad_Agua);
    }

    @Patch('/update/visibilidad/:id')
    @ApiOperation({ summary: 'Actualizar visibilidad de un registro de calidad de agua' })
    updateVisibilidadCalidadAgua(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.calidadAguaService.updateVisibilidadCalidadAgua(id);
    }
}