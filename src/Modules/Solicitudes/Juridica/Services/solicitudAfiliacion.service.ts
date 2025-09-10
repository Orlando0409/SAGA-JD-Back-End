import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";
import { AbonadosService } from "src/Modules/Afiliados/Services/abonados.service";
import { SolicitudAfiliacionJuridica } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudAfiliacionJuridicaDto } from "../../SolicitudDTO's/CreateSolicitudJuridica.dto";
import { UpdateSolicitudAfiliacionJuridicaDto } from "../../SolicitudDTO's/UpdateSolicitudJuridica.dto";

@Injectable()
export class SolicitudAfiliacionJuridicaService
{
    constructor
    (
        @InjectRepository(SolicitudAfiliacionJuridica)
        private readonly solicitudAfiliacionJuridicaRepository: Repository<SolicitudAfiliacionJuridica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly validationsService: ValidationsService,

        private readonly abonadosService: AbonadosService,
    ) {}

    async getAllSolicitudesAfiliacion()
    {
        return this.solicitudAfiliacionJuridicaRepository.find({ relations: ['Estado'] });
    }

    async findSolicitudAfiliacionById(id: number)
    {
        const solicitud = await this.solicitudAfiliacionJuridicaRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) {throw new BadRequestException(`Solicitud de afiliación jurídica con id ${id} no encontrada`);}
        return solicitud;
    }

    @Public()
    async createSolicitudAfiliacion(dto: CreateSolicitudAfiliacionJuridicaDto, files: any)
    {
        const estadoInicial = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) { throw new BadRequestException(`Estado inicial de solicitud no configurado`); }

        const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesJuridicasActivas(dto.Cedula_Juridica);
        if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

        const planoFile = files.Planos_Terreno?.[0];
        const escrituraFile = files.Escritura_Terreno?.[0];
        const cedulaJuridica = dto.Cedula_Juridica;
    
        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Afiliacion', 'Juridicas', cedulaJuridica) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Afiliacion', 'Juridicas', cedulaJuridica) : null;

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

        return this.solicitudAfiliacionJuridicaRepository.save(solicitudAfiliacion);
    }

    async updateSolicitudAfiliacion(id: number, dto: UpdateSolicitudAfiliacionJuridicaDto)
    {
        const solicitud = await this.solicitudAfiliacionJuridicaRepository.findOne({
            where: { Id_Solicitud: id }
        });

        if (!solicitud) {
            throw new BadRequestException(`Solicitud de afiliación jurídica con id ${id} no encontrada`);
        }

        Object.assign(solicitud, dto);
        return this.solicitudAfiliacionJuridicaRepository.save(solicitud);
    }

    async UpdateEstadoSolicitudAfiliacion(id: number, nuevoEstadoId: number)
    {
        const solicitud = await this.solicitudAfiliacionJuridicaRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) { throw new BadRequestException(`Solicitud con id ${id} no encontrada`); }

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) { throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`); }

        solicitud.Estado = nuevoEstado;
        const solicitudActualizada = await this.solicitudAfiliacionJuridicaRepository.save(solicitud);

        // Si el estado cambia a 3 (Aprobada), crear automáticamente el abonado
        if (nuevoEstadoId === 3) {
            try {
                await this.abonadosService.createAbonadoJuridico(solicitudActualizada);
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
        const solicitud = await this.solicitudAfiliacionJuridicaRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) { throw new BadRequestException(`Solicitud de afiliación jurídica con id ${id} no encontrada`); }
        return this.solicitudAfiliacionJuridicaRepository.remove(solicitud);
    }
}
