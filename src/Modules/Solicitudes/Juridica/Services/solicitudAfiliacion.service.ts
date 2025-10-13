import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";
import { SolicitudAfiliacionJuridica } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudAfiliacionJuridicaDto } from "../../SolicitudDTO's/CreateSolicitudJuridica.dto";
import { UpdateSolicitudAfiliacionJuridicaDto } from "../../SolicitudDTO's/UpdateSolicitudJuridica.dto";
import { AfiliadosService } from "src/Modules/Afiliados/afiliados.service";
import { EmailService } from "src/Modules/Emails/email.service";
import e from "express";

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

        private readonly afiliadosService: AfiliadosService,

        private readonly emailService: EmailService,
    ) {}

    async getAllSolicitudesAfiliacion()
    {
        return this.solicitudAfiliacionJuridicaRepository.find({ relations: ['Estado'] });
    }

    @Public()
    async createSolicitudAfiliacion(dto: CreateSolicitudAfiliacionJuridicaDto, files: any)
    {
        // Validar que existe un afiliado jurídico con esa identificación
        const AfiliadoExistente = await this.validationsService.validarExistenciaAfiliadoJuridico(dto.Cedula_Juridica);
        if (AfiliadoExistente) {
            const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesJuridicasActivas(dto.Cedula_Juridica);
            if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

            const planoFile = files.Planos_Terreno?.[0];
            const escrituraFile = files.Escritura_Terreno?.[0];

            const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Afiliacion', 'Juridicas', dto.Cedula_Juridica, dto.Razon_Social) : null;
            const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Afiliacion', 'Juridicas', dto.Cedula_Juridica, dto.Razon_Social) : null;

            dto.Razon_Social = dto.Razon_Social.trim()[0].toUpperCase() + dto.Razon_Social.trim().slice(1).toLowerCase();

            // Crear instancia de la entidad para que se ejecuten los decoradores @BeforeInsert
            const solicitudAfiliacion = this.solicitudAfiliacionJuridicaRepository.create({
                ...dto,
                Planos_Terreno: planoRes?.url,
                Escritura_Terreno: escrituraRes?.url,
            });

            await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Afiliación', dto.Razon_Social);
            return this.solicitudAfiliacionJuridicaRepository.save(solicitudAfiliacion);
        }

        else {
            throw new BadRequestException(`Ya existe un afiliado jurídico con la cédula jurídica ${dto.Cedula_Juridica}`);
        }        
    }

    async updateSolicitudAfiliacion(id: number, dto: UpdateSolicitudAfiliacionJuridicaDto)
    {
        const solicitud = await this.solicitudAfiliacionJuridicaRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) { throw new BadRequestException(`Solicitud de afiliación jurídica con id ${id} no encontrada`); }

        Object.assign(solicitud, dto);
        return this.solicitudAfiliacionJuridicaRepository.save(solicitud);
    }

    async UpdateEstadoSolicitudAfiliacion(id: number, nuevoEstadoId: number)
    {
        const solicitud = await this.solicitudAfiliacionJuridicaRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) { throw new BadRequestException(`Solicitud con id ${id} no encontrada`); }

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) { throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`); }

        if (nuevoEstadoId === 2) { // Estado 2 = En revisión
            await this.emailService.enviarEmailActualizacionEstado(solicitud.Correo, 'Afiliación', 'En revisión', solicitud.Razon_Social);
        }

        // Si el estado cambia a 3 (Aprobada), crear automáticamente el afiliado
        if (nuevoEstadoId === 3) {
            await this.afiliadosService.createAfiliadoJuridicoFromSolicitud(solicitud);
            await this.emailService.enviarEmailActualizacionEstado(solicitud.Correo, 'Afiliación', 'Aprobada', solicitud.Razon_Social);
        }

        if (nuevoEstadoId === 4) { // Estado 4 = Rechazada
            await this.emailService.enviarEmailActualizacionEstado(solicitud.Correo, 'Afiliación', 'Rechazada', solicitud.Razon_Social);
        }

        solicitud.Estado = nuevoEstado;
        return this.solicitudAfiliacionJuridicaRepository.save(solicitud);
    }
}