import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SolicitudAfiliacion } from "../SolicitudEntities/Solicitud.Entity";
import { SolicitudEstado } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudAfiliacionDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { UpdateSolicitudAfiliacionDto } from "../SolicitudDTO's/UpdateSolicitud.dto";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";

@Injectable()
export class SolicitudesAfiliacionService
{
    constructor
    (
        @InjectRepository(SolicitudAfiliacion)
        private readonly solicitudAfiliacionRepository: Repository<SolicitudAfiliacion>,

        @InjectRepository(SolicitudEstado)
        private readonly solicitudEstadoRepository: Repository<SolicitudEstado>,

        private readonly dropboxFilesService: DropboxFilesService,
    ) {}

    async getAllSolicitudesAfiliacion()
    {
        return this.solicitudAfiliacionRepository.find({ relations: ['Estado'] });
    }

    async findSolicitudAfiliacionById(id: number)
    {
        const solicitud = await this.solicitudAfiliacionRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) {throw new Error(`Solicitud de afiliación con id ${id} no encontrada`);}
        return solicitud;
    }

    @Public()
    async createSolicitudAfiliacion(dto: CreateSolicitudAfiliacionDto, files: any)
    {
        const estadoInicial = await this.solicitudEstadoRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) { throw new Error(`Estado inicial de solicitud no configurado`); }

        const planoFile = files.Planos_Terreno?.[0];
        const escrituraFile = files.Escritura_Terreno?.[0];
        const cedula = dto.Cedula;
    
        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes Afiliacion', cedula) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes Afiliacion', cedula) : null;
    
        const now = new Date();
        now.setSeconds(0, 0);

        // Guarda SOLO las URLs en tu BD
        const solicitudAfiliacion = {
            ...dto,
            Planos_Terreno: planoRes?.url ?? null,
            Escritura_Terreno: escrituraRes?.url ?? null,
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
            throw new Error(`Solicitud de afiliación con id ${id} no encontrada`);
        }

        Object.assign(solicitud, dto);
        return this.solicitudAfiliacionRepository.save(solicitud);
    }

    async UpdateEstadoSolicitudAfiliacion(id: number, nuevoEstadoId: number)
    {
        const solicitud = await this.solicitudAfiliacionRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) { throw new Error(`Solicitud con id ${id} no encontrada`); }

        const nuevoEstado = await this.solicitudEstadoRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) { throw new Error(`Estado con id ${nuevoEstadoId} no encontrado`); }

        solicitud.Estado = nuevoEstado;
        return this.solicitudAfiliacionRepository.save(solicitud);
    }

    async deleteSolicitudAfiliacion(id: number)
    {
        const solicitud = await this.solicitudAfiliacionRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) { throw new Error(`Solicitud de afiliación con id ${id} no encontrada`); }
        return this.solicitudAfiliacionRepository.remove(solicitud);
    }
}