import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";
import { SolicitudAfiliacionFisica } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudAfiliacionFisicaDto } from "../../SolicitudDTO's/CreateSolicitudFisica.dto";
import { UpdateSolicitudAfiliacionFisicaDto } from "../../SolicitudDTO's/UpdateSolicitudFisica.dto";
import { AfiliadosService } from "src/Modules/Afiliados/afiliados.service";

@Injectable()
export class SolicitudAfiliacionFisicaService
{
    constructor
    (
        @InjectRepository(SolicitudAfiliacionFisica)
        private readonly solicitudAfiliacionFisicaRepository: Repository<SolicitudAfiliacionFisica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly validationsService: ValidationsService,

        private readonly afiliadosService: AfiliadosService,
    ) {}

    async getAllSolicitudesAfiliacion()
    {
        return this.solicitudAfiliacionFisicaRepository.find({ relations: ['Estado'] });
    }

    @Public()
    async createSolicitudAfiliacion(dto: CreateSolicitudAfiliacionFisicaDto, files: any)
    {
        const estadoInicial = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) { throw new BadRequestException(`Estado inicial de solicitud no configurado`); }

        const AfiliadoExistente = await this.validationsService.validarExistenciaAfiliadoFisico(dto.Identificacion);
        if (AfiliadoExistente) {
            const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesFisicasActivas(dto.Identificacion);
            if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

            // Normalizar nombres en el servicio (Apellido2 se maneja automáticamente en la entidad)
            dto.Nombre = dto.Nombre.trim()[0].toUpperCase() + dto.Nombre.trim().slice(1).toLowerCase();
            dto.Apellido1 = dto.Apellido1.trim()[0].toUpperCase() + dto.Apellido1.trim().slice(1).toLowerCase();
            if (dto.Apellido2) {
                dto.Apellido2 = dto.Apellido2.trim()[0].toUpperCase() + dto.Apellido2.trim().slice(1).toLowerCase();
            }

            const planoFile = files.Planos_Terreno?.[0];
            const escrituraFile = files.Escritura_Terreno?.[0];
            const nombre = `${dto.Nombre} ${dto.Apellido1 ?? ''} ${dto.Apellido2 ?? ''}`.trim();

            const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Afiliacion', 'Fisicas', dto.Identificacion, nombre) : null;
            const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Afiliacion', 'Fisicas', dto.Identificacion, nombre) : null;

            // Crear instancia de la entidad para que se ejecuten los decoradores @BeforeInsert
            const solicitudAfiliacion = this.solicitudAfiliacionFisicaRepository.create({
                ...dto,
                Planos_Terreno: planoRes?.url,
                Escritura_Terreno: escrituraRes?.url,
                Estado: estadoInicial,
            });

            return this.solicitudAfiliacionFisicaRepository.save(solicitudAfiliacion);
        }

        else {
            throw new BadRequestException(`Ya existe un afiliado físico con la identificación ${dto.Identificacion}`);
        }
    }

    async updateSolicitudAfiliacion(id: number, dto: UpdateSolicitudAfiliacionFisicaDto, files?: any)
    {
        const solicitud = await this.solicitudAfiliacionFisicaRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) { throw new BadRequestException(`Solicitud de afiliación física con id ${id} no encontrada`); }

        // Manejar archivos si se proporcionan
        let planoUrl = solicitud.Planos_Terreno; // Mantener URL existente por defecto
        let escrituraUrl = solicitud.Escritura_Terreno; // Mantener URL existente por defecto

        if (dto.Apellido2) {
            dto.Apellido2 = dto.Apellido2.trim()[0].toUpperCase() + dto.Apellido2.trim().slice(1).toLowerCase();
        }

        if (files) {
            const planoFile = files.Planos_Terreno?.[0];
            const escrituraFile = files.Escritura_Terreno?.[0];

            // Solo subir archivo si se proporciona uno nuevo
            if (planoFile) {
                const planoRes = await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Afiliacion', 'Fisicas', solicitud.Identificacion);
                planoUrl = planoRes?.url;
            }

            if (escrituraFile) {
                const escrituraRes = await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Afiliacion', 'Fisicas', solicitud.Identificacion);
                escrituraUrl = escrituraRes?.url;
            }
        }

        // Actualizar solicitud con datos del DTO y URLs de archivos
        const solicitudActualizada = {
            ...dto,
            Planos_Terreno: planoUrl,
            Escritura_Terreno: escrituraUrl
        };

        Object.assign(solicitud, solicitudActualizada);
        return this.solicitudAfiliacionFisicaRepository.save(solicitud);
    }

    async UpdateEstadoSolicitudAfiliacion(id: number, nuevoEstadoId: number)
    {
        const solicitud = await this.solicitudAfiliacionFisicaRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) { throw new BadRequestException(`Solicitud con id ${id} no encontrada`); }

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) { throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`); }

        solicitud.Estado = nuevoEstado;
        const solicitudActualizada = await this.solicitudAfiliacionFisicaRepository.save(solicitud);

        // Si el estado cambia a 3 (Aprobada), crear automáticamente el afiliado
        if (nuevoEstadoId === 3) {
            try {
                await this.afiliadosService.createAfiliadoFisicoFromSolicitud(solicitudActualizada);
            } catch (error) {
                // Manejar diferentes tipos de errores con mensajes específicos
                if (error.message.includes('Ya existe un afiliado físico')) {
                    throw new BadRequestException(`Error al crear afiliado: Ya existe un afiliado físico con la identificación ${solicitudActualizada.Identificacion}. La solicitud fue aprobada pero el afiliado ya estaba registrado.`);
                } else if (error.message.includes('Estado inicial de afiliado no configurado')) {
                    throw new BadRequestException(`Error de configuración: El estado inicial de afiliado no está configurado en el sistema. Contacte al administrador.`);
                } else if (error.message.includes('Tipo de afiliado con ID')) {
                    throw new BadRequestException(`Error de configuración: El tipo de afiliado "Abonado" no está configurado en el sistema. Contacte al administrador.`);
                } else {
                    throw new BadRequestException(`Error al crear afiliado automáticamente: ${error.message}`);
                }
            }
        }

        return solicitudActualizada;
    }
}