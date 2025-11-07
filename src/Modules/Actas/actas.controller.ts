import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFiles, UseInterceptors, UseGuards } from "@nestjs/common";
import { ActasService } from "./actas.service";
import { ApiOperation } from "@nestjs/swagger";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { CreateActaDto } from "./ActaDTO's/CreateActa.dto";
import { JwtAuthGuard } from "../auth/Guard/JwtGuard";
import { GetUser } from "../auth/Decorator/GetUser.decorator";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";

@Controller('Actas')
@UseGuards(JwtAuthGuard)
export class ActaController {
    constructor(private readonly actasService: ActasService) { }

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
    createActa(
        @Body() dto: CreateActaDto,
        @GetUser() usuario: Usuario,
        @UploadedFiles() files: { Archivo?: Express.Multer.File[]; }) {
        return this.actasService.createActa(dto, usuario.Id_Usuario, files.Archivo || []);
    }

    @Put('/update/:idActa')
    @ApiOperation({ summary: 'Actualizar una acta existente' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Archivo', maxCount: 10 },
    ]),)
    updateActa(
        @Param('idActa') id: number,
        @Body() dto: CreateActaDto,
        @GetUser() usuario: Usuario,
        @UploadedFiles() files: { Archivo?: Express.Multer.File[]; }) {
        return this.actasService.UpdateActa(id, dto, usuario.Id_Usuario, files.Archivo || []);
    }

    @Delete('/delete/:idActa')
    @ApiOperation({ summary: 'Eliminar una acta existente' })
    deleteActa(@Param('idActa') id: number, @GetUser() usuario: Usuario) {
        return this.actasService.deleteActa(id, usuario.Id_Usuario);
    }
}