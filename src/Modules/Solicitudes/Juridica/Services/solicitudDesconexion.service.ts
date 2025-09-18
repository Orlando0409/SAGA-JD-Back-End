import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";
import { SolicitudDesconexionJuridica } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudDesconexionJuridicaDto } from "../../SolicitudDTO's/CreateSolicitudJuridica.dto";
import { UpdateSolicitudDesconexionJuridicaDto } from "../../SolicitudDTO's/UpdateSolicitudJuridica.dto";

@Injectable()
export class SolicitudDesconexionJuridicaService
{
    constructor
    (
        @InjectRepository(SolicitudDesconexionJuridica)
        private readonly solicitudDesconexionJuridicaRepository: Repository<SolicitudDesconexionJuridica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly validationsService: ValidationsService,
    ) {}

    async getAllSolicitudesDesconexion()
    {
        return this.solicitudDesconexionJuridicaRepository.find({ relations: ['Estado'] });
    }

    async findSolicitudDesconexionById(id: number)
    {
        const solicitud = await this.solicitudDesconexionJuridicaRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) {throw new BadRequestException(`Solicitud de desconexión jurídica con id ${id} no encontrada`);}
        return solicitud;
    }

    @Public()
    async createSolicitudDesconexion(dto: CreateSolicitudDesconexionJuridicaDto, files: any)
    {
        const estadoInicial = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) { throw new BadRequestException(`Estado inicial de solicitud no configurado`); }

        const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesJuridicasActivas(dto.Cedula_Juridica);
        if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

        const planoFile = files.Planos_Terreno?.[0];
        const escrituraFile = files.Escritura_Terreno?.[0];
        const cedulaJuridica = dto.Cedula_Juridica;

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Desconexion', 'Juridicas', cedulaJuridica) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Desconexion', 'Juridicas', cedulaJuridica) : null;

        const now = new Date();
        now.setSeconds(0, 0);

        // Guarda SOLO las URLs en tu BD
        const solicitudDesconexion = {
            ...dto,
            Planos_Terreno: planoRes?.url,
            Escritura_Terreno: escrituraRes?.url,
            Estado: estadoInicial,
            Id_Tipo_Solicitud: 2
        };

        return this.solicitudDesconexionJuridicaRepository.save(solicitudDesconexion);
    }

    async updateSolicitudDesconexion(id: number, dto: UpdateSolicitudDesconexionJuridicaDto)
    {
        const solicitud = await this.solicitudDesconexionJuridicaRepository.findOne({
            where: { Id_Solicitud: id }
        });

        if (!solicitud) {
            throw new BadRequestException(`Solicitud de desconexión jurídica con id ${id} no encontrada`);
        }

        Object.assign(solicitud, dto);
        return this.solicitudDesconexionJuridicaRepository.save(solicitud);
    }

    async UpdateEstadoSolicitudDesconexion(id: number, nuevoEstadoId: number)
    {
        const solicitud = await this.solicitudDesconexionJuridicaRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) { throw new BadRequestException(`Solicitud con id ${id} no encontrada`); }

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) { throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`); }

        solicitud.Estado = nuevoEstado;
        return this.solicitudDesconexionJuridicaRepository.save(solicitud);
    }
}