import { Body, Controller, Get, Post, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ActasService } from "./actas.service";
import { ApiOperation } from "@nestjs/swagger";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { CreateActaDto } from "./ActaDTO's/CreateActa.dto";

@Controller('Actas')
export class ActaController {
    constructor(private readonly actasService: ActasService) {}

    @Get('/all')
    @ApiOperation({ summary: 'Obtener todas las actas' })
    findAll() {
        return this.actasService.getAllActas();
    }

    @Post('/create')
    @ApiOperation({ summary: 'Crear una nueva acta' })
    @UseInterceptors(FileFieldsInterceptor([ 
        { name: 'Archivo', maxCount: 10 }, 
    ]),)
    createActa(@Body() dto: CreateActaDto,
    @UploadedFiles() files: { Archivo?: Express.Multer.File[]; }) {
        return this.actasService.createActa(dto, files.Archivo || []);
    }
}