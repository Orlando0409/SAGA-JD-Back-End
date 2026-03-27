import { Body, Controller, Get, Param, Patch, Post, Put, Request, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { SolicitudesJuridicasService } from "../Services/solicitudesJuridicas.service";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ApiOperation } from "@nestjs/swagger";
import { CreateSolicitudAfiliacionJuridicaDto, CreateSolicitudAgregarMedidorJuridicaDto, CreateSolicitudAsociadoJuridicaDto, CreateSolicitudCambioMedidorJuridicaDto, CreateSolicitudDesconexionJuridicaDto } from "../SolicitudDTO's/CreateSolicitudJuridica.dto";
import { UpdateSolicitudAfiliacionJuridicaDto, UpdateSolicitudAgregarMedidorJuridicaDto, UpdateSolicitudAsociadoJuridicaDto, UpdateSolicitudCambioMedidorJuridicaDto, UpdateSolicitudDesconexionJuridicaDto } from "../SolicitudDTO's/UpdateSolicitudJuridica.dto";
import { RechazarSolicitudDto } from "../SolicitudDTO's/RechazarSolicitud.dto";
import { PagarCambioMedidorDTO } from "../SolicitudDTO's/PagarCambioMedidor.dto";

@Controller('solicitudes-juridicas')
export class SolicitudesJuridicasController {
    constructor(
        private readonly solicitudesJuridicasService: SolicitudesJuridicasService
    ) { }

    @Get('/all')
    @ApiOperation({ summary: 'Obtener todas las solicitudes jurídicas' })
    getAllSolicitudesJuridicas() {
        return this.solicitudesJuridicasService.getAllSolicitudesJuridicas();
    }

    @Get('/afiliacion')
    @ApiOperation({ summary: 'Obtener todas las solicitudes de afiliación jurídica' })
    getAllSolicitudesAfiliacion() {
        return this.solicitudesJuridicasService.getAllSolicitudesAfiliacion();
    }

    @Get('/desconexion')
    @ApiOperation({ summary: 'Obtener todas las solicitudes de desconexión jurídica' })
    getAllSolicitudesDesconexion() {
        return this.solicitudesJuridicasService.getAllSolicitudesDesconexion();
    }

    @Get('/cambio-medidor')
    @ApiOperation({ summary: 'Obtener todas las solicitudes de cambio de medidor jurídica' })
    getAllSolicitudesCambioMedidor() {
        return this.solicitudesJuridicasService.getAllSolicitudesCambioMedidor();
    }

    @Get('/cambio-medidor/:id')
    @ApiOperation({ summary: 'Obtener el detalle de una solicitud de cambio de medidor jurídica por ID' })
    getSolicitudCambioMedidorById(@Param('id') id: number) {
        return this.solicitudesJuridicasService.getSolicitudCambioMedidorById(id);
    }

    @Get('/asociado')
    @ApiOperation({ summary: 'Obtener todas las solicitudes de asociado jurídica' })
    getAllSolicitudesAsociado() {
        return this.solicitudesJuridicasService.getAllSolicitudesAsociado();
    }

    @Public()
    @Post('/create/afiliacion')
    @ApiOperation({ summary: 'Crear una nueva solicitud de afiliación jurídica' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Certificacion_Literal', maxCount: 1 },
    ]),)
    async createSolicitudAfiliacion(
        @Body() solicitudAfiliacion: CreateSolicitudAfiliacionJuridicaDto,
        @UploadedFiles() files: { Planos_Terreno: Express.Multer.File[]; Certificacion_Literal: Express.Multer.File[]; }) {
        return this.solicitudesJuridicasService.createSolicitudAfiliacion(solicitudAfiliacion, files);
    }

    @Public()
    @Post('/create/desconexion')
    @ApiOperation({ summary: 'Crear una nueva solicitud de desconexión jurídica' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Certificacion_Literal', maxCount: 1 },
    ]),)
    async createSolicitudDesconexion(
        @Body() solicitudDesconexion: CreateSolicitudDesconexionJuridicaDto,
        @UploadedFiles() files: { Planos_Terreno: Express.Multer.File[]; Certificacion_Literal: Express.Multer.File[]; }) {
        return this.solicitudesJuridicasService.createSolicitudDesconexion(solicitudDesconexion, files);
    }

    @Public()
    @Post('/create/cambio-medidor')
    @ApiOperation({ summary: 'Crear una nueva solicitud de cambio de medidor jurídica' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Certificacion_Literal', maxCount: 1 },
    ]))
    async createSolicitudCambioMedidor(
        @Body() solicitudCambioMedidor: CreateSolicitudCambioMedidorJuridicaDto,
        @UploadedFiles() files: { Planos_Terreno: Express.Multer.File[]; Certificacion_Literal: Express.Multer.File[] }
    ) {
        return this.solicitudesJuridicasService.createSolicitudCambioMedidor(solicitudCambioMedidor, files);
    }

    @Public()
    @Post('/create/asociado')
    @ApiOperation({ summary: 'Crear una nueva solicitud de asociado jurídica' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Escrituras_Terreno', maxCount: 1 },
    ]))
    async createSolicitudAsociado(
        @Body() solicitudAsociado: CreateSolicitudAsociadoJuridicaDto,
        @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Escrituras_Terreno?: Express.Multer.File[] },
    ) {
        return this.solicitudesJuridicasService.createSolicitudAsociado(solicitudAsociado, files);
    }

    @Put('/update/afiliacion/:id')
    @ApiOperation({ summary: 'Actualizar una solicitud de afiliación jurídica' })
    async updateSolicitudAfiliacion(
        @Param('id') id: number,
        @Body() solicitudAfiliacion: UpdateSolicitudAfiliacionJuridicaDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesJuridicasService.updateSolicitudAfiliacion(id, solicitudAfiliacion, idUsuario);
    }

    @Put('/update/desconexion/:id')
    @ApiOperation({ summary: 'Actualizar una solicitud de desconexión jurídica' })
    async updateSolicitudDesconexion(
        @Param('id') id: number,
        @Body() solicitudDesconexion: UpdateSolicitudDesconexionJuridicaDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesJuridicasService.updateSolicitudDesconexion(id, solicitudDesconexion, idUsuario);
    }

    @Put('/update/cambio-medidor/:id')
    @ApiOperation({ summary: 'Actualizar una solicitud de cambio de medidor jurídica' })
    async updateSolicitudCambioMedidor(
        @Param('id') id: number,
        @Body() solicitudCambioMedidor: UpdateSolicitudCambioMedidorJuridicaDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesJuridicasService.updateSolicitudCambioMedidor(id, solicitudCambioMedidor, idUsuario);
    }

    @Put('/update/asociado/:id')
    @ApiOperation({ summary: 'Actualizar una solicitud de asociado jurídica' })
    async updateSolicitudAsociado(
        @Param('id') id: number,
        @Body() solicitudAsociado: UpdateSolicitudAsociadoJuridicaDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesJuridicasService.updateSolicitudAsociado(id, solicitudAsociado, idUsuario);
    }

    @Patch('/update/estado/afiliacion/:idSolicitud/:idNuevoEstado')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de afiliación jurídica' })
    async updateEstadoSolicitudAfiliacion(
        @Param('idSolicitud') idSolicitud: number,
        @Param('idNuevoEstado') idNuevoEstado: number,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesJuridicasService.updateEstadoSolicitudAfiliacion(idSolicitud, idNuevoEstado, idUsuario);
    }

    @Patch('/update/estado/desconexion/:idSolicitud/:idNuevoEstado')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de desconexión jurídica' })
    async updateEstadoSolicitudDesconexion(
        @Param('idSolicitud') idSolicitud: number,
        @Param('idNuevoEstado') idNuevoEstado: number,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesJuridicasService.updateEstadoSolicitudDesconexion(idSolicitud, idNuevoEstado, idUsuario);
    }

    @Patch('/update/estado/cambio-medidor/:idSolicitud/:idNuevoEstado')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de cambio de medidor jurídica' })
    async updateEstadoSolicitudCambioMedidor(
    @Param('idSolicitud') idSolicitud: number,
    @Param('idNuevoEstado') idNuevoEstado: number,
    @Body() dtoPago: PagarCambioMedidorDTO,
    @Request() req: any
        ) {
            const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
            return this.solicitudesJuridicasService.updateEstadoSolicitudCambioMedidor(idSolicitud, idNuevoEstado, idUsuario,  dtoPago.ocupaPago, dtoPago.montoCambio , dtoPago.motivoCobro);
        }

    @Patch('/update/estado/asociado/:idSolicitud/:idNuevoEstado')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de asociado jurídica' })
    async updateEstadoSolicitudAsociado(
        @Param('idSolicitud') idSolicitud: number,
        @Param('idNuevoEstado') idNuevoEstado: number,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesJuridicasService.updateEstadoSolicitudAsociado(idSolicitud, idNuevoEstado, idUsuario);
    }

    // ─── AGREGAR MEDIDOR ───────────────────────────────────────────────────────────────────

    @Get('/agregar-medidor')
    @ApiOperation({ summary: 'Obtener todas las solicitudes de agregar medidor jurídicas' })
    getAllSolicitudesAgregarMedidor() {
        return this.solicitudesJuridicasService.getAllSolicitudesAgregarMedidor();
    }

    @Get('/agregar-medidor/:id')
    @ApiOperation({ summary: 'Obtener el detalle de una solicitud de agregar medidor jurídica por ID' })
    getSolicitudAgregarMedidorById(@Param('id') id: number) {
        return this.solicitudesJuridicasService.getSolicitudAgregarMedidorById(id);
    }

    @Public()
    @Post('/create/agregar-medidor')
    @ApiOperation({ summary: 'Crear una nueva solicitud de agregar medidor jurídica' })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'Planos_Terreno', maxCount: 1 },
        { name: 'Certificacion_Literal', maxCount: 1 },
    ]),)
    async createSolicitudAgregarMedidor(
        @Body() solicitudAgregarMedidor: CreateSolicitudAgregarMedidorJuridicaDto,
        @UploadedFiles() files: { Planos_Terreno: Express.Multer.File[]; Certificacion_Literal: Express.Multer.File[]; }
    ) {
        return this.solicitudesJuridicasService.createSolicitudAgregarMedidor(solicitudAgregarMedidor, files);
    }

    @Put('/update/agregar-medidor/:id')
    @ApiOperation({ summary: 'Actualizar una solicitud de agregar medidor jurídica' })
    async updateSolicitudAgregarMedidor(
        @Param('id') id: number,
        @Body() solicitudAgregarMedidor: UpdateSolicitudAgregarMedidorJuridicaDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesJuridicasService.updateSolicitudAgregarMedidor(id, solicitudAgregarMedidor, idUsuario);
    }

    @Patch('/update/estado/agregar-medidor/:idSolicitud/:idNuevoEstado')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de agregar medidor jurídica' })
    async updateEstadoSolicitudAgregarMedidor(
        @Param('idSolicitud') idSolicitud: number,
        @Param('idNuevoEstado') idNuevoEstado: number,
        @Body() dto: RechazarSolicitudDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.solicitudesJuridicasService.updateEstadoSolicitudAgregarMedidor(idSolicitud, idNuevoEstado, idUsuario, dto.motivoRechazo);
    }
}