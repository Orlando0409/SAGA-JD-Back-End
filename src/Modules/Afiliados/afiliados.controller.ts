import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, Res, UploadedFiles, UseInterceptors, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { AfiliadosService } from "./afiliados.service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateAfiliadoFisicoDto, CreateAfiliadoJuridicoDto } from "./AfiliadoDTO's/CreateAfiliado.dto";
import { UpdateAfiliadoFisicoDto, UpdateAfiliadoJuridicoDto } from "./AfiliadoDTO's/UpdateAfiliado.dto";
import { ExportAfiliadosPdfDto } from "./AfiliadoDTO's/ExportAfiliadosPdf.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express/multer";
import { JwtAuthGuard } from "../auth/Guard/JwtGuard";
import { RequierePermisos } from '../auth/Decorator/Permiso.decorator';
import { GetUser } from "../auth/Decorator/GetUser.decorator";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { Public } from "../auth/Decorator/Public.decorator";
import { AsignarMedidorExistenteAfiliadoDto } from "./AfiliadoDTO's/AsignarMedidorExistenteAfiliado.dto";
import { CrearYAsignarMedidorAfiliadoDto } from "./AfiliadoDTO's/CrearYAsignarMedidorAfiliado.dto";

@Controller('afiliados')
@UseGuards(JwtAuthGuard)
export class AfiliadosController {
    constructor(private readonly afiliadosService: AfiliadosService) { }

    @Public()
    @Get('/fisico/medidores/:identificacion')
    @ApiOperation({ summary: 'Obtener medidores de un afiliado físico por su identificación' })
    getMedidoresByIdentificacion(@Param('identificacion') identificacion: string) {
        return this.afiliadosService.getMedidoresbyIdentificacion(identificacion);
    }

    @Public()
    @Get('/juridico/medidores/:cedulaJuridica')
    @ApiOperation({ summary: 'Obtener medidores de un afiliado jurídico por su cédula jurídica' })
    getMedidoresByCedulaJuridica(@Param('cedulaJuridica') cedulaJuridica: string) {
        return this.afiliadosService.getMedidoresbyCedulaJuridica(cedulaJuridica);
    }


    @Get('/all')
    @RequierePermisos('abonados', 'ver')
    @ApiOperation({ summary: 'Obtener todos los afiliados' })
    findAll() {
        return this.afiliadosService.getAfiliados();
    }

    @Post('/pdf')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Exportar afiliados a PDF con filtros opcionales.' })
    async exportarPdf(
        @Body() dto: ExportAfiliadosPdfDto,
        @Res() res: Response,
    ) {
        await this.afiliadosService.generarAfiliadosPdf(dto, res);
    }

    @Get('/fisico/all')
    @RequierePermisos('abonados', 'ver')
    @ApiOperation({ summary: 'Obtener todos los afiliados físicos' })
    findAllFisicos() {
        return this.afiliadosService.getAfiliadosFisicos();
    }

    @Get('/juridico/all')
    @RequierePermisos('abonados', 'ver')
    @ApiOperation({ summary: 'Obtener todos los afiliados jurídicos' })
    findAllJuridicos() {
        return this.afiliadosService.getAfiliadosJuridicos();
    }

    @Get('/fisico/info/:identificacion')
    @RequierePermisos('abonados', 'ver')
    @ApiOperation({ summary: 'Obtener información completa de un afiliado físico por su cédula (para panel administrativo)' })
    getInfoAfiliadoFisicoByCedula(@Param('identificacion') identificacion: string) {
        return this.afiliadosService.getInfoAfiliadoFisicoByCedula(identificacion);
    }

    @Get('/juridico/info/:cedulaJuridica')
    @RequierePermisos('abonados', 'ver')
    @ApiOperation({ summary: 'Obtener información completa de un afiliado jurídico por su cédula jurídica (para panel administrativo)' })
    getInfoAfiliadoJuridicoByCedula(@Param('cedulaJuridica') cedulaJuridica: string) {
        return this.afiliadosService.getInfoAfiliadoJuridicoByCedula(cedulaJuridica);
    }

    @Get('/fisico/detail/:id')
    @RequierePermisos('abonados', 'ver')
    @ApiOperation({ summary: 'Obtener detalle completo de un afiliado físico incluyendo todos sus medidores' })
    getDetalleAfiliadoFisico(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.afiliadosService.getDetalleAfiliadoFisico(id);
    }

    @Get('/juridico/detail/:id')
    @RequierePermisos('abonados', 'ver')
    @ApiOperation({ summary: 'Obtener detalle completo de un afiliado jurídico incluyendo todos sus medidores' })
    getDetalleAfiliadoJuridico(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.afiliadosService.getDetalleAfiliadoJuridico(id);
    }

    @Post('/fisico/create')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Crear un nuevo afiliado físico' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Certificacion_Literal', maxCount: 1 },
    ]),)
    createAfiliadoFisico(
        @Body() dto: CreateAfiliadoFisicoDto,
        @GetUser() usuario: Usuario,
        @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Certificacion_Literal?: Express.Multer.File[]; }) {
        return this.afiliadosService.createAfiliadoFisico(dto, usuario.Id_Usuario, files);
    }

    @Post('/juridico/create')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Crear un nuevo afiliado jurídico' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Certificacion_Literal', maxCount: 1 },
    ]),)
    createAfiliadoJuridico(
        @Body() dto: CreateAfiliadoJuridicoDto,
        @GetUser() usuario: Usuario,
        @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Certificacion_Literal?: Express.Multer.File[]; }) {
        return this.afiliadosService.createAfiliadoJuridico(dto, usuario.Id_Usuario, files);
    }

    @Put('/update/fisico/:cedula')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Actualizar datos de un afiliado físico' })
    updateAfiliadoFisico(
        @Param('cedula') cedula: string,
        @Body() dto: UpdateAfiliadoFisicoDto,
        @GetUser() usuario: Usuario) {
        return this.afiliadosService.updateAfiliadoFisico(cedula, dto, usuario.Id_Usuario);
    }

    @Put('/update/juridico/:cedulaJuridica')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Actualizar datos de un afiliado jurídico' })
    updateAfiliadoJuridico(
        @Param('cedulaJuridica') cedulaJuridica: string,
        @Body() dto: UpdateAfiliadoJuridicoDto,
        @GetUser() usuario: Usuario) {
        return this.afiliadosService.updateAfiliadoJuridico(cedulaJuridica, dto, usuario.Id_Usuario);
    }

    @Patch('/fisico/:id/update/estado/:nuevoEstadoId')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Actualizar estado de un afiliado físico' })
    updateEstadoAfiliado(
        @Param('id') id: number,
        @Param('nuevoEstadoId') nuevoEstadoId: number,
        @GetUser() usuario: Usuario) {
        return this.afiliadosService.updateEstadoAfiliadoFisico(id, nuevoEstadoId, usuario.Id_Usuario);
    }

    @Patch('/juridico/:id/update/estado/:nuevoEstadoId')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Actualizar estado de un afiliado jurídico' })
    updateEstadoAfiliadoJuridico(
        @Param('id') id: number,
        @Param('nuevoEstadoId') nuevoEstadoId: number,
        @GetUser() usuario: Usuario) {
        return this.afiliadosService.updateEstadoAfiliadoJuridico(id, nuevoEstadoId, usuario.Id_Usuario);
    }

    @Patch('/update/tipo/fisico/:id/tipo/:nuevoTipoId')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Actualizar tipo de un afiliado físico' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Escrituras_Terreno', maxCount: 1 },
    ]))
    updateTipoAfiliadoFisico(
        @Param('id') id: number,
        @Param('nuevoTipoId') nuevoTipoId: number,
        @GetUser() usuario: Usuario,
        @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Escrituras_Terreno?: Express.Multer.File[]; }) {
        return this.afiliadosService.updateTipoAfiliadoFisico(id, nuevoTipoId, usuario.Id_Usuario, files);
    }

    @Patch('/update/tipo/juridico/:id/tipo/:nuevoTipoId')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Actualizar tipo de un afiliado jurídico' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Escrituras_Terreno', maxCount: 1 },
    ]))
    updateTipoAfiliadoJuridico(
        @Param('id') id: number,
        @Param('nuevoTipoId') nuevoTipoId: number,
        @GetUser() usuario: Usuario,
        @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Escrituras_Terreno?: Express.Multer.File[]; }) {
        return this.afiliadosService.updateTipoAfiliadoJuridico(id, nuevoTipoId, usuario.Id_Usuario, files);
    }

    @Patch('/revertir/fisico/:id/a-afiliado')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Revierte un asociado físico de vuelta a afiliado, eliminando sus documentos de Dropbox y la BD' })
    revertirAsociadoAAfiliadoFisico(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() usuario: Usuario
    ) {
        return this.afiliadosService.revertirAsociadoAAfiliadoFisico(id, usuario.Id_Usuario);
    }

    @Patch('/revertir/juridico/:id/a-afiliado')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Revierte un asociado jurídico de vuelta a afiliado, eliminando sus documentos de Dropbox y la BD' })
    revertirAsociadoAAfiliadoJuridico(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() usuario: Usuario
    ) {
        return this.afiliadosService.revertirAsociadoAAfiliadoJuridico(id, usuario.Id_Usuario);
    }

    @Post('/medidores/asignar-existente')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Asigna un medidor existente a un afiliado desde el modulo de afiliados. Requiere Planos_Terreno y Certificacion_Literal.' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Certificacion_Literal', maxCount: 1 },
    ]))
    asignarMedidorExistenteAAfiliado(
        @Body() dto: AsignarMedidorExistenteAfiliadoDto,
        @GetUser() usuario: Usuario,
        @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Certificacion_Literal?: Express.Multer.File[]; }
    ) {
        return this.afiliadosService.asignarMedidorExistenteAAfiliadoDesdeModuloAfiliados(dto, usuario.Id_Usuario, files);
    }

    @Post('/medidores/crear-y-asignar')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Crea un medidor nuevo y lo asigna a un afiliado desde el modulo de afiliados. Requiere Planos_Terreno y Certificacion_Literal.' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Certificacion_Literal', maxCount: 1 },
    ]))
    crearYAsignarMedidorAAfiliado(
        @Body() dto: CrearYAsignarMedidorAfiliadoDto,
        @GetUser() usuario: Usuario,
        @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Certificacion_Literal?: Express.Multer.File[]; }
    ) {
        return this.afiliadosService.crearYAsignarMedidorDesdeModuloAfiliados(dto, usuario.Id_Usuario, files);
    }

    @Post('/medidores/:id/archivos')
    @RequierePermisos('abonados', 'editar')
    @ApiOperation({ summary: 'Asigna archivos (Planos y/o Certificacion) a un medidor que aún no posee ningún archivo.' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Certificacion_Literal', maxCount: 1 },
    ]))
    asignarArchivosAMedidor(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() usuario: Usuario,
        @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Certificacion_Literal?: Express.Multer.File[]; }
    ) {
        return this.afiliadosService.asignarArchivosAMedidor(id, usuario.Id_Usuario, files);
    }
}