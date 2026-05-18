import { RequierePermisos } from "src/Modules/auth/Decorator/Permiso.decorator";
import { CreateSolicitudAfiliacionFisicaDto, CreateSolicitudAgregarMedidorFisicaDto, CreateSolicitudAsociadoFisicaDto, CreateSolicitudCambioMedidorFisicaDto, CreateSolicitudDesconexionFisicaDto } from "../SolicitudDTO's/CreateSolicitudFisica.dto"; import { Body, Controller, Get, Param, Patch, Post, UploadedFiles, UseInterceptors, Request, Put } from "@nestjs/common";
import { SolicitudesFisicasService } from "../Services/solicitudesFisicas.service";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { FileFieldsInterceptor, NoFilesInterceptor } from "@nestjs/platform-express";
import { ApiOperation } from "@nestjs/swagger";
import { UpdateSolicitudAfiliacionFisicaDto, UpdateSolicitudAgregarMedidorFisicaDto, UpdateSolicitudAsociadoFisicaDto, UpdateSolicitudCambioMedidorFisicaDto, UpdateSolicitudDesconexionFisicaDto } from "../SolicitudDTO's/UpdateSolicitudFisica.dto";
import { RechazarSolicitudDto } from "../SolicitudDTO's/RechazarSolicitud.dto";
import { PagarCambioMedidorDTO } from "../SolicitudDTO's/PagarCambioMedidor.dto";
import { PagarSolicitudEnEsperaDTO } from "../SolicitudDTO's/PagarSolicitudEnEspera.dto";

@Controller('solicitudes-fisicas')
export class SolicitudesFisicasController {
    constructor(
        private readonly solicitudesFisicasService: SolicitudesFisicasService,
    ) { }

    @Get('/all')
    @RequierePermisos('solicitudes', 'ver')
    @ApiOperation({ summary: 'Obtener todas las solicitudes físicas' })
    getAllSolicitudesFisicas() {
        return this.solicitudesFisicasService.getAllSolicitudesFisicas();
    }
    
    @Get('/afiliacion')
    @RequierePermisos('solicitudes', 'ver')
    @ApiOperation({ summary: 'Obtener todas las solicitudes de afiliación' })
    getAllSolicitudesAfiliacion() {
        return this.solicitudesFisicasService.getAllSolicitudesAfiliacion();
    }

    @Get('/desconexion')
    @RequierePermisos('solicitudes', 'ver')
    @ApiOperation({ summary: 'Obtener todas las solicitudes de desconexión' })
    getAllSolicitudesDesconexion() {
        return this.solicitudesFisicasService.getAllSolicitudesDesconexion();
    }

    @Get('/desconexion/medidores')
    @RequierePermisos('solicitudes', 'ver')
    @ApiOperation({ summary: 'Obtener medidores de solicitudes de desconexión físicas' })
    getMedidoresDesconexion() {
        return this.solicitudesFisicasService.getMedidoresDesconexion();
    }

    @Get('/cambio-medidor')
    @RequierePermisos('solicitudes', 'ver')
    @ApiOperation({ summary: 'Obtener todas las solicitudes de cambio de medidor' })
    getAllSolicitudesCambioMedidor() {
        return this.solicitudesFisicasService.getAllSolicitudesCambioMedidor();
    }

    @Get('/cambio-medidor/:id')
    @RequierePermisos('solicitudes', 'ver')
    @ApiOperation({ summary: 'Obtener el detalle de una solicitud de cambio de medidor física por ID' })
    getSolicitudCambioMedidorById(@Param('id') id: number) {
        return this.solicitudesFisicasService.getSolicitudCambioMedidorById(id);
    }

    @Get('/asociado')
    @RequierePermisos('solicitudes', 'ver')
    @ApiOperation({ summary: 'Obtener todas las solicitudes de asociado' })
    getAllSolicitudesAsociado() {
        return this.solicitudesFisicasService.getAllSolicitudesAsociado();
    }

    @Public()
    @Post('/create/afiliacion')
    @ApiOperation({ summary: 'Crear una nueva solicitud de afiliacion fisica' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Certificacion_Literal', maxCount: 1 },
    ]),)
    async createSolicitudAfiliacion(
        @Body() solicitudAfiliacion: CreateSolicitudAfiliacionFisicaDto,
        @UploadedFiles() files: { Planos_Terreno: Express.Multer.File[]; Certificacion_Literal: Express.Multer.File[]; }) {
        return this.solicitudesFisicasService.createSolicitudAfiliacion(solicitudAfiliacion, files);
    }

    @Public()
    @Post('/create/desconexion')
    @ApiOperation({ summary: 'Crear una nueva solicitud de desconexion fisica' })
    @UseInterceptors(NoFilesInterceptor())
    async createSolicitudDesconexion(
        @Body() solicitudDesconexion: CreateSolicitudDesconexionFisicaDto,)
        {
        return this.solicitudesFisicasService.createSolicitudDesconexion(solicitudDesconexion);
    }

    @Public()
    @Post('/create/cambio-medidor')
    @ApiOperation({ summary: 'Crear una nueva solicitud de cambio de medidor fisica' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Certificacion_Literal', maxCount: 1 },
    ]))
    async createSolicitudCambioMedidor(
        @Body() solicitudCambioMedidor: CreateSolicitudCambioMedidorFisicaDto,
        @UploadedFiles() files: { Planos_Terreno: Express.Multer.File[]; Certificacion_Literal: Express.Multer.File[] }
    ) {
        return this.solicitudesFisicasService.createSolicitudCambioMedidor(solicitudCambioMedidor, files);
    }

    @Public()
    @Post('/create/asociado')
    @ApiOperation({ summary: 'Crear una nueva solicitud de asociado fisica' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Escrituras_Terreno', maxCount: 1 },
    ]))
    async createSolicitudAsociado(
        @Body() solicitudAsociado: CreateSolicitudAsociadoFisicaDto,
        @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Escrituras_Terreno?: Express.Multer.File[] },
    ) {
        return this.solicitudesFisicasService.createSolicitudAsociado(solicitudAsociado, files);
    }

    @Put('/update/afiliacion/:id')
    @RequierePermisos('solicitudes', 'editar')
    @ApiOperation({ summary: 'Actualizar una solicitud de afiliación fisica' })
    async updateSolicitudAfiliacion(
        @Param('id') id: number,
        @Body() solicitudAfiliacion: UpdateSolicitudAfiliacionFisicaDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesFisicasService.updateSolicitudAfiliacion(id, solicitudAfiliacion, idUsuario);
    }

    @Put('/update/desconexion/:id')
    @RequierePermisos('solicitudes', 'editar')
    @ApiOperation({ summary: 'Actualizar una solicitud de desconexión fisica' })
    async updateSolicitudDesconexion(
        @Param('id') id: number,
        @Body() solicitudDesconexion: UpdateSolicitudDesconexionFisicaDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesFisicasService.updateSolicitudDesconexion(id, solicitudDesconexion, idUsuario);
    }

    @Put('/update/cambio-medidor/:id')
    @RequierePermisos('solicitudes', 'editar')
    @ApiOperation({ summary: 'Actualizar una solicitud de cambio de medidor fisica' })
    async updateSolicitudCambioMedidor(
        @Param('id') id: number,
        @Body() solicitudCambioMedidor: UpdateSolicitudCambioMedidorFisicaDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesFisicasService.updateSolicitudCambioMedidor(id, solicitudCambioMedidor, idUsuario);
    }

    @Put('/update/asociado/:id')
    @RequierePermisos('solicitudes', 'editar')
    @ApiOperation({ summary: 'Actualizar una solicitud de asociado fisica' })
    async updateSolicitudAsociado(
        @Param('id') id: number,
        @Body() solicitudAsociado: UpdateSolicitudAsociadoFisicaDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesFisicasService.updateSolicitudAsociado(id, solicitudAsociado, idUsuario);
    }

    @Patch('/update/estado/afiliacion/:idSolicitud/:idNuevoEstado')
    @RequierePermisos('solicitudes', 'editar')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de afiliación fisica' })
    async updateEstadoSolicitudAfiliacion(
        @Param('idSolicitud') idSolicitud: number,
        @Param('idNuevoEstado') idNuevoEstado: number,
        @Body() dto: PagarSolicitudEnEsperaDTO,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesFisicasService.updateEstadoSolicitudAfiliacion(idSolicitud, idNuevoEstado, idUsuario, dto.motivoRechazo, dto.montoCambio);
    }

    @Patch('/update/estado/desconexion/:idSolicitud/:idNuevoEstado')
    @RequierePermisos('solicitudes', 'editar')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de desconexión fisica' })
    async updateEstadoSolicitudDesconexion(
        @Param('idSolicitud') idSolicitud: number,
        @Param('idNuevoEstado') idNuevoEstado: number,
        @Body() dto: RechazarSolicitudDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesFisicasService.updateEstadoSolicitudDesconexion(idSolicitud, idNuevoEstado, idUsuario, dto.motivoRechazo);
    }

    @Patch('/update/estado/cambio-medidor/:idSolicitud/:idNuevoEstado')
    @RequierePermisos('solicitudes', 'editar')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de cambio de medidor fisica' })
    async updateEstadoSolicitudCambioMedidor(
        @Param('idSolicitud') idSolicitud: number,
        @Param('idNuevoEstado') idNuevoEstado: number,
        @Body() dto: PagarCambioMedidorDTO,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesFisicasService.updateEstadoSolicitudCambioMedidor(idSolicitud, idNuevoEstado, idUsuario, dto.motivoRechazo, dto.montoCambio, dto.ocupaPago, dto.motivoCobro, dto.Estado_Pago);
    }

    @Patch('/update/estado/asociado/:idSolicitud/:idNuevoEstado')
    @RequierePermisos('solicitudes', 'editar')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de asociado fisica' })
    async updateEstadoSolicitudAsociado(
        @Param('idSolicitud') idSolicitud: number,
        @Param('idNuevoEstado') idNuevoEstado: number,
        @Body() dto: RechazarSolicitudDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesFisicasService.updateEstadoSolicitudAsociado(idSolicitud, idNuevoEstado, idUsuario, dto.motivoRechazo);
    }

    // ─── AGREGAR MEDIDOR ──────────────────────────────────────────────────────────

    @Get('/agregar-medidor')
    @RequierePermisos('solicitudes', 'ver')
    @ApiOperation({ summary: 'Obtener todas las solicitudes de agregar medidor fisicas' })
    getAllSolicitudesAgregarMedidor() {
        return this.solicitudesFisicasService.getAllSolicitudesAgregarMedidor();
    }

    @Get('/agregar-medidor/:id')
    @RequierePermisos('solicitudes', 'ver')
    @ApiOperation({ summary: 'Obtener el detalle de una solicitud de agregar medidor fisica por ID' })
    getSolicitudAgregarMedidorById(@Param('id') id: number) {
        return this.solicitudesFisicasService.getSolicitudAgregarMedidorById(id);
    }

    @Public()
    @Post('/create/agregar-medidor')
    @ApiOperation({ summary: 'Crear una nueva solicitud de agregar medidor fisica' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Certificacion_Literal', maxCount: 1 },
    ]),)
    async createSolicitudAgregarMedidor(
        @Body() solicitudAgregarMedidor: CreateSolicitudAgregarMedidorFisicaDto,
        @UploadedFiles() files: { Planos_Terreno: Express.Multer.File[]; Certificacion_Literal: Express.Multer.File[]; }
    ) {
        return this.solicitudesFisicasService.createSolicitudAgregarMedidor(solicitudAgregarMedidor, files);
    }

    @Put('/update/agregar-medidor/:id')
    @RequierePermisos('solicitudes', 'editar')
    @ApiOperation({ summary: 'Actualizar una solicitud de agregar medidor fisica' })
    async updateSolicitudAgregarMedidor(
        @Param('id') id: number,
        @Body() solicitudAgregarMedidor: UpdateSolicitudAgregarMedidorFisicaDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesFisicasService.updateSolicitudAgregarMedidor(id, solicitudAgregarMedidor, idUsuario);
    }

    @Patch('/update/estado/agregar-medidor/:idSolicitud/:idNuevoEstado')
    @RequierePermisos('solicitudes', 'editar')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de agregar medidor fisica' })
    async updateEstadoSolicitudAgregarMedidor(
        @Param('idSolicitud') idSolicitud: number,
        @Param('idNuevoEstado') idNuevoEstado: number,
        @Body() dto: PagarSolicitudEnEsperaDTO,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesFisicasService.updateEstadoSolicitudAgregarMedidor(idSolicitud, idNuevoEstado, idUsuario, dto.motivoRechazo, dto.montoCambio, dto.ocupaPago, dto.Estado_Pago);
    }
}