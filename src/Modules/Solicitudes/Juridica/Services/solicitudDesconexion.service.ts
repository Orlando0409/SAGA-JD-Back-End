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
import { AfiliadoJuridico } from "src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity";
import { EstadoAfiliado } from "src/Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity";

@Injectable()
export class SolicitudDesconexionJuridicaService
{
    constructor
    (
        @InjectRepository(SolicitudDesconexionJuridica)
        private readonly solicitudDesconexionJuridicaRepository: Repository<SolicitudDesconexionJuridica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        @InjectRepository(AfiliadoJuridico)
        private readonly afiliadoJuridicoRepository: Repository<AfiliadoJuridico>,

        @InjectRepository(EstadoAfiliado)
        private readonly estadoAfiliadoRepository: Repository<EstadoAfiliado>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly validationsService: ValidationsService,
    ) {}

    async getAllSolicitudesDesconexion()
    {
        return this.solicitudDesconexionJuridicaRepository.find({ relations: ['Estado'] });
    }

    @Public()
    async createSolicitudDesconexion(dto: CreateSolicitudDesconexionJuridicaDto, files: any)
    {
        const estadoInicial = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) { throw new BadRequestException(`Estado inicial de solicitud no configurado`); }

        // Validar que existe un afiliado jurídico con esa identificación
        const validacionAfiliadoExistente = await this.validationsService.validarExistenciaAfiliadoJuridico(dto.Cedula_Juridica);
        if (!validacionAfiliadoExistente) { throw new BadRequestException(validacionAfiliadoExistente); }

        const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesJuridicasActivas(dto.Cedula_Juridica);
        if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

        const planoFile = files.Planos_Terreno?.[0];
        const escrituraFile = files.Escritura_Terreno?.[0];

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Desconexion', 'Juridicas', dto.Cedula_Juridica, dto.Razon_Social) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Desconexion', 'Juridicas', dto.Cedula_Juridica, dto.Razon_Social) : null;

        dto.Razon_Social = dto.Razon_Social.trim()[0].toUpperCase() + dto.Razon_Social.trim().slice(1).toLowerCase();

        const solicitudDesconexion = this.solicitudDesconexionJuridicaRepository.create({
            ...dto,
            Planos_Terreno: planoRes?.url,
            Escritura_Terreno: escrituraRes?.url,
            Estado: estadoInicial,
        });

        return this.solicitudDesconexionJuridicaRepository.save(solicitudDesconexion);
    }

    async updateSolicitudDesconexion(id: number, dto: UpdateSolicitudDesconexionJuridicaDto)
    {
        const solicitud = await this.solicitudDesconexionJuridicaRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) { throw new BadRequestException(`Solicitud de desconexión jurídica con id ${id} no encontrada`); }

        Object.assign(solicitud, dto);
        return this.solicitudDesconexionJuridicaRepository.save(solicitud);
    }

    async UpdateEstadoSolicitudDesconexion(id: number, nuevoEstadoId: number)
    {
        const solicitud = await this.solicitudDesconexionJuridicaRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) { throw new BadRequestException(`Solicitud con id ${id} no encontrada`); }

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) { throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`); }

        // Actualizar estado de afiliado si la solicitud es aprobada
        if (nuevoEstadoId === 3) // Estado "Aprobada"
        {
            const validacionAfiliadoExistente = await this.validationsService.validarExistenciaAfiliadoJuridico(solicitud.Cedula_Juridica);
            if (!validacionAfiliadoExistente) { throw new BadRequestException(validacionAfiliadoExistente); }

            const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: solicitud.Cedula_Juridica } });
            if (afiliado) {
                const estadoInactivo = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 2 } });
                if (estadoInactivo) {
                    afiliado.Estado = estadoInactivo;
                    await this.afiliadoJuridicoRepository.save(afiliado);
                }
            }
        }

        solicitud.Estado = nuevoEstado;
        return this.solicitudDesconexionJuridicaRepository.save(solicitud);
    }
}