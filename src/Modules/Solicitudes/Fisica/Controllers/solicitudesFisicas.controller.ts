import { Body, Controller, Get, Param, Patch, Post, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { SolicitudesFisicasService } from "../Services/solicitudesFisicas.service";
import { ApiOperation } from "@nestjs/swagger";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { CreateSolicitudAfiliacionFisicaDto, CreateSolicitudAsociadoFisicaDto, CreateSolicitudCambioMedidorFisicaDto, CreateSolicitudDesconexionFisicaDto } from "../../SolicitudDTO's/CreateSolicitudFisica.dto";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";

@Controller('solicitudes-fisicas')
export class SolicitudesFisicasController {
    constructor(
        private readonly solicitudesFisicasService: SolicitudesFisicasService,
    ) { }

    @Get('/all')
    @ApiOperation({ summary: 'Obtener todas las solicitudes físicas' })
    getAllSolicitudesFisicas() {
        return this.solicitudesFisicasService.getAllSolicitudesFisicas();
    }

    @Get('/afiliacion')
    @ApiOperation({ summary: 'Obtener todas las solicitudes de afiliación' })
    getAllSolicitudesAfiliacion() {
        return this.solicitudesFisicasService.getAllSolicitudesAfiliacion();
    }

    @Get('/desconexion')
    @ApiOperation({ summary: 'Obtener todas las solicitudes de desconexión' })
    getAllSolicitudesDesconexion() {
        return this.solicitudesFisicasService.getAllSolicitudesDesconexion();
    }

    @Get('/cambio-medidor')
    @ApiOperation({ summary: 'Obtener todas las solicitudes de cambio de medidor' })
    getAllSolicitudesCambioMedidor() {
        return this.solicitudesFisicasService.getAllSolicitudesCambioMedidor();
    }

    @Get('/asociado')
    @ApiOperation({ summary: 'Obtener todas las solicitudes de asociado' })
    getAllSolicitudesAsociado() {
        return this.solicitudesFisicasService.getAllSolicitudesAsociado();
    }

    @Public()
    @Post('/create/afiliacion')
    @ApiOperation({ summary: 'Crear una nueva solicitud de afiliacion fisica' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Escritura_Terreno', maxCount: 1 },
    ]),)
    async createSolicitudAfiliacion(
        @Body() solicitudAfiliacion: CreateSolicitudAfiliacionFisicaDto,
        @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Escritura_Terreno?: Express.Multer.File[]; }) {
        return this.solicitudesFisicasService.createSolicitudAfiliacion(solicitudAfiliacion, files);
    }

    @Public()
    @Post('/create/desconexion')
    @ApiOperation({ summary: 'Crear una nueva solicitud de desconexion fisica' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Escritura_Terreno', maxCount: 1 },
    ]),)
    async createSolicitudDesconexion(
        @Body() solicitudDesconexion: CreateSolicitudDesconexionFisicaDto,
        @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Escritura_Terreno?: Express.Multer.File[]; }) {
        return this.solicitudesFisicasService.createSolicitudDesconexion(solicitudDesconexion, files);
    }

    @Public()
    @Post('/create/cambio-medidor')
    @ApiOperation({ summary: 'Crear una nueva solicitud de cambio de medidor fisica' })
    async createSolicitudCambioMedidor(
        @Body() solicitudCambioMedidor: CreateSolicitudCambioMedidorFisicaDto,
    ) {
        return this.solicitudesFisicasService.createSolicitudCambioMedidor(solicitudCambioMedidor);
    }

    @Public()
    @Post('/create/asociado')
    @ApiOperation({ summary: 'Crear una nueva solicitud de asociado fisica' })
    async createSolicitudAsociado(
        @Body() solicitudAsociado: CreateSolicitudAsociadoFisicaDto,
    ) {
        return this.solicitudesFisicasService.createSolicitudAsociado(solicitudAsociado);
    }

    @Patch('/update/estado/afiliacion/:idSolicitud/:idNuevoEstado/:idUsuario')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de afiliación fisica' })
    async updateEstadoSolicitudAfiliacion(
        @Param('idSolicitud') idSolicitud: number,
        @Param('idNuevoEstado') idNuevoEstado: number,
        @Param('idUsuario') idUsuario: number,
    ) {
        return this.solicitudesFisicasService.updateEstadoSolicitudAfiliacion(idSolicitud, idNuevoEstado, idUsuario);
    }

    @Patch('/update/estado/desconexion/:idSolicitud/:idNuevoEstado/:idUsuario')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de desconexión fisica' })
    async updateEstadoSolicitudDesconexion(
        @Param('idSolicitud') idSolicitud: number,
        @Param('idNuevoEstado') idNuevoEstado: number,
        @Param('idUsuario') idUsuario: number,
    ) {
        return this.solicitudesFisicasService.updateEstadoSolicitudDesconexion(idSolicitud, idNuevoEstado, idUsuario);
    }

    @Patch('/update/estado/cambio-medidor/:idSolicitud/:idNuevoEstado/:idUsuario')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de cambio de medidor fisica' })
    async updateEstadoSolicitudCambioMedidor(
        @Param('idSolicitud') idSolicitud: number,
        @Param('idNuevoEstado') idNuevoEstado: number,
        @Param('idUsuario') idUsuario: number,
    ) {
        return this.solicitudesFisicasService.updateEstadoSolicitudCambioMedidor(idSolicitud, idNuevoEstado, idUsuario);
    }

    @Patch('/update/estado/asociado/:idSolicitud/:idNuevoEstado/:idUsuario')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de asociado fisica' })
    async updateEstadoSolicitudAsociado(
        @Param('idSolicitud') idSolicitud: number,
        @Param('idNuevoEstado') idNuevoEstado: number,
        @Param('idUsuario') idUsuario: number,
    ) {
        return this.solicitudesFisicasService.updateEstadoSolicitudAsociado(idSolicitud, idNuevoEstado, idUsuario);
    }
}