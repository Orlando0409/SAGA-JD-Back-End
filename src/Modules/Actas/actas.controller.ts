import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ActasService } from "./actas.service";
import { ApiOperation } from "@nestjs/swagger";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { CreateActaDto } from "./ActaDTO's/CreateActa.dto";

@Controller('Actas')
export class ActaController {
    constructor(private readonly actasService: ActasService) { }

    @Get('/all')
    @ApiOperation({ summary: 'Obtener todas las actas' })
    findAll() {
        return this.actasService.getAllActas();
    }

    @Post('/create/:idUsuario')
    @ApiOperation({ summary: 'Crear una nueva acta' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Archivo', maxCount: 10 },
    ]),)
    createActa(@Body() dto: CreateActaDto,
        @Param('idUsuario') idUsuario: number,
        @UploadedFiles() files: { Archivo?: Express.Multer.File[]; }) {
        return this.actasService.createActa(dto, idUsuario, files.Archivo || []);
    }

    @Put('/update/:idActa/:idUsuario')
    @ApiOperation({ summary: 'Actualizar una acta existente' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Archivo', maxCount: 10 },
    ]),)
    updateActa(@Param('idActa') id: number, @Body() dto: CreateActaDto,
        @Param('idUsuario') idUsuario: number,
        @UploadedFiles() files: { Archivo?: Express.Multer.File[]; }) {
        return this.actasService.UpdateActa(id, dto, idUsuario, files.Archivo || []);
    }

    @Delete('/delete/:idActa/:idUsuario')
    @ApiOperation({ summary: 'Eliminar una acta existente' })
    deleteActa(@Param('idActa') id: number, @Param('idUsuario') idUsuario: number) {
        return this.actasService.deleteActa(id, idUsuario);
    }
}