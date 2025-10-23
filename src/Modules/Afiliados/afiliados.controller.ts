import { Body, Controller, Get, Param, Patch, Post, Put, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { AfiliadosService } from "./afiliados.service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateAfiliadoFisicoDto, CreateAfiliadoJuridicoDto } from "./AfiliadoDTO's/CreateAfiliado.dto";
import { UpdateAfiliadoFisicoDto, UpdateAfiliadoJuridicoDto } from "./AfiliadoDTO's/UpdateAfiliado.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express/multer";

@Controller('afiliados')
export class AfiliadosController {
    constructor(private readonly afiliadosService: AfiliadosService) {}

    @Get('/all')
    @ApiOperation({ summary: 'Obtener todos los afiliados' })
    findAll() {
        return this.afiliadosService.getAfiliados();
    }

    @Get('/fisico/all')
    @ApiOperation({ summary: 'Obtener todos los afiliados físicos' })
    findAllFisicos() {
        return this.afiliadosService.getAfiliadosFisicos();
    }

    @Get('/juridico/all')
    @ApiOperation({ summary: 'Obtener todos los afiliados jurídicos' })
    findAllJuridicos() {
        return this.afiliadosService.getAfiliadosJuridicos();
    }

    @Post('/fisico/create/:idUsuario')
    @ApiOperation({ summary: 'Crear un nuevo afiliado físico' })
    @UseInterceptors(FileFieldsInterceptor([ 
        { name: 'Planos_Terreno', maxCount: 1 }, 
        { name: 'Escritura_Terreno', maxCount: 1 }, 
    ]),)
    createAfiliadoFisico(@Body() dto: CreateAfiliadoFisicoDto,
    @Param('idUsuario') idUsuario: number,
    @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Escritura_Terreno?: Express.Multer.File[]; }) {
        return this.afiliadosService.createAfiliadoFisico(dto, idUsuario, files);
    }

    @Post('/juridico/create/:idUsuario')
    @ApiOperation({ summary: 'Crear un nuevo afiliado jurídico' })
    @UseInterceptors(FileFieldsInterceptor([ 
        { name: 'Planos_Terreno', maxCount: 1 }, 
        { name: 'Escritura_Terreno', maxCount: 1 }, 
    ]),)
    createAfiliadoJuridico(@Body() dto: CreateAfiliadoJuridicoDto,
    @Param('idUsuario') idUsuario: number,
    @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Escritura_Terreno?: Express.Multer.File[]; } ) {
        return this.afiliadosService.createAfiliadoJuridico(dto, idUsuario, files);
    }

    @Put('/update/fisico/:cedula/:idUsuario')
    @ApiOperation({ summary: 'Actualizar un afiliado físico' })
    @UseInterceptors(FileFieldsInterceptor([ 
        { name: 'Planos_Terreno', maxCount: 1 }, 
        { name: 'Escritura_Terreno', maxCount: 1 }, 
    ]),)
    updateAfiliadoFisico(@Param('cedula') cedula: string, @Body() dto: UpdateAfiliadoFisicoDto,
    @Param('idUsuario') idUsuario: number,
    @UploadedFiles() files?: { Planos_Terreno?: Express.Multer.File[]; Escritura_Terreno?: Express.Multer.File[]; }) {
        return this.afiliadosService.updateAfiliadoFisico(cedula, dto, idUsuario, files);
    }

    @Put('/update/juridico/:cedulaJuridica/:idUsuario')
    @ApiOperation({ summary: 'Actualizar un afiliado jurídico' })
    @UseInterceptors(FileFieldsInterceptor([ 
        { name: 'Planos_Terreno', maxCount: 1 }, 
        { name: 'Escritura_Terreno', maxCount: 1 }, 
    ]),)
    updateAfiliadoJuridico(@Param('cedulaJuridica') cedulaJuridica: string, @Body() dto: UpdateAfiliadoJuridicoDto,
    @Param('idUsuario') idUsuario: number,
    @UploadedFiles() files?: { Planos_Terreno?: Express.Multer.File[]; Escritura_Terreno?: Express.Multer.File[]; }) {
        return this.afiliadosService.updateAfiliadoJuridico(cedulaJuridica, dto, idUsuario, files);
    }

    @Patch('/fisico/:id/update/estado/:nuevoEstadoId/:idUsuario')
    @ApiOperation({ summary: 'Actualizar estado de un afiliado físico' })
    updateEstadoAfiliado(@Param('id') id: number, @Param('nuevoEstadoId') nuevoEstadoId: number, @Param('idUsuario') idUsuario: number) {
        return this.afiliadosService.updateEstadoAfiliadoFisico(id, nuevoEstadoId, idUsuario);
    }

    @Patch('/juridico/:id/update/estado/:nuevoEstadoId/:idUsuario')
    @ApiOperation({ summary: 'Actualizar estado de un afiliado jurídico' })
    updateEstadoAfiliadoJuridico(@Param('id') id: number, @Param('nuevoEstadoId') nuevoEstadoId: number, @Param('idUsuario') idUsuario: number) {
        return this.afiliadosService.updateEstadoAfiliadoJuridico(id, nuevoEstadoId, idUsuario);
    }

    @Patch('/update/tipo/fisico/:id/tipo/:nuevoTipoId/:idUsuario')
    @ApiOperation({ summary: 'Actualizar tipo de un afiliado físico' })
    updateTipoAfiliadoFisico(@Param('id') id: number, @Param('nuevoTipoId') nuevoTipoId: number, @Param('idUsuario') idUsuario: number) {
        return this.afiliadosService.updateTipoAfiliadoFisico(id, nuevoTipoId, idUsuario);
    }

    @Patch('/update/tipo/juridico/:id/tipo/:nuevoTipoId/:idUsuario')
    @ApiOperation({ summary: 'Actualizar tipo de un afiliado jurídico' })
    updateTipoAfiliadoJuridico(@Param('id') id: number, @Param('nuevoTipoId') nuevoTipoId: number, @Param('idUsuario') idUsuario: number) {
        return this.afiliadosService.updateTipoAfiliadoJuridico(id, nuevoTipoId, idUsuario);
    }
}