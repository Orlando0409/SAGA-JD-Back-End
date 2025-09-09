import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SolicitudAfiliacion } from "../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudAfiliacionDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { UpdateSolicitudAfiliacionDto } from "../SolicitudDTO's/UpdateSolicitud.dto";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";
import { AbonadosService } from "src/Modules/Afiliados/Services/abonados.service";

@Injectable()
export class SolicitudesAfiliacionService
{
    constructor
    (
        @InjectRepository(SolicitudAfiliacion)
        private readonly solicitudAfiliacionRepository: Repository<SolicitudAfiliacion>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly validationsService: ValidationsService,

        private readonly abonadosService: AbonadosService,
    ) {}

    async getAllSolicitudesAfiliacion()
    {
        return this.solicitudAfiliacionRepository.find({ relations: ['Estado'] });
    }

    async findSolicitudAfiliacionById(id: number)
    {
        const solicitud = await this.solicitudAfiliacionRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) {throw new BadRequestException(`Solicitud de afiliación con id ${id} no encontrada`);}
        return solicitud;
    }

    @Public()
    async createSolicitudAfiliacion(dto: CreateSolicitudAfiliacionDto, files: any)
    {
        const estadoInicial = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) { throw new BadRequestException(`Estado inicial de solicitud no configurado`); }

        const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesActivas(dto.Cedula);
        if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

        const planoFile = files.Planos_Terreno?.[0];
        const escrituraFile = files.Escritura_Terreno?.[0];
        const cedula = dto.Cedula;
    
        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Afiliacion', cedula) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Afiliacion', cedula) : null;
    
        const now = new Date();
        now.setSeconds(0, 0);

        // Guarda SOLO las URLs en tu BD
        const solicitudAfiliacion = {
            ...dto,
            Planos_Terreno: planoRes?.url,
            Escritura_Terreno: escrituraRes?.url,
            Estado: estadoInicial,
            Id_Tipo_Solicitud: 1
        };

        return this.solicitudAfiliacionRepository.save(solicitudAfiliacion);
    }

    async updateSolicitudAfiliacion(id: number, dto: UpdateSolicitudAfiliacionDto)
    {
        const solicitud = await this.solicitudAfiliacionRepository.findOne({
            where: { Id_Solicitud: id }
        });

        if (!solicitud) {
            throw new BadRequestException(`Solicitud de afiliación con id ${id} no encontrada`);
        }

        Object.assign(solicitud, dto);
        return this.solicitudAfiliacionRepository.save(solicitud);
    }

    async UpdateEstadoSolicitudAfiliacion(id: number, nuevoEstadoId: number)
    {
        const solicitud = await this.solicitudAfiliacionRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) { throw new BadRequestException(`Solicitud con id ${id} no encontrada`); }

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) { throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`); }

        solicitud.Estado = nuevoEstado;
        const solicitudActualizada = await this.solicitudAfiliacionRepository.save(solicitud);

        // Si el estado cambia a 3 (Aprobada), crear automáticamente el abonado
        if (nuevoEstadoId === 3) {
            try {
                await this.abonadosService.createAbonadoFromSolicitud(solicitudActualizada);
            } catch (error) {
                // Si ya existe el abonado, no lanzar error, solo continuar
                if (!error.message.includes('Ya existe un abonado')) {
                    throw error;
                }
            }
        }

        return solicitudActualizada;
    }

    async deleteSolicitudAfiliacion(id: number)
    {
        const solicitud = await this.solicitudAfiliacionRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) { throw new BadRequestException(`Solicitud de afiliación con id ${id} no encontrada`); }
        return this.solicitudAfiliacionRepository.remove(solicitud);
    }
}