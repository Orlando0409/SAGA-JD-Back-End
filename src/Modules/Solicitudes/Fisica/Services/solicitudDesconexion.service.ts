import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Transaction } from "typeorm";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";
import { SolicitudDesconexionFisica } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudDesconexionFisicaDto } from "../../SolicitudDTO's/CreateSolicitudFisica.dto";
import { UpdateSolicitudDesconexionFisicaDto } from "../../SolicitudDTO's/UpdateSolicitudFisica.dto";
import { AfiliadoFisico } from "src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity";
import { EstadoAfiliado } from "src/Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity";
import { EmailService } from "src/Modules/Emails/email.service";

@Injectable()
export class SolicitudesDesconexionFisicaService
{
    constructor
    (
        @InjectRepository(SolicitudDesconexionFisica)
        private readonly solicitudDesconexionFisicaRepository: Repository<SolicitudDesconexionFisica>,

        @InjectRepository(EstadoSolicitud)
        private readonly solicitudEstadoRepository: Repository<EstadoSolicitud>,

        @InjectRepository(AfiliadoFisico)
        private readonly afiliadoFisicoRepository: Repository<AfiliadoFisico>,

        @InjectRepository(EstadoAfiliado)
        private readonly estadoAfiliadoRepository: Repository<EstadoAfiliado>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly validationsService: ValidationsService,

        private readonly emailService: EmailService,
    ) {}

    async getAllSolicitudesDesconexion()
    {
        return this.solicitudDesconexionFisicaRepository.find({ relations: ['Estado'] });
    }

    @Public()
    async createSolicitudDesconexion(dto: CreateSolicitudDesconexionFisicaDto, files: any)
    {
        // Validar que existe un afiliado físico con esa identificación
        const AfiliadoExistente = await this.validationsService.validarExistenciaAfiliadoFisico(dto.Identificacion);
        if (!AfiliadoExistente) {
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
            const nombre = `${dto.Nombre} ${dto.Apellido1 ?? ''} `.trim();

            const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Desconexion', 'Fisicas', dto.Identificacion, nombre) : null;
            const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Desconexion', 'Fisicas', dto.Identificacion, nombre) : null;

            const solicitudDesconexion = this.solicitudDesconexionFisicaRepository.create({
                ...dto,
                Planos_Terreno: planoRes?.url,
                Escritura_Terreno: escrituraRes?.url,
            });

            return this.solicitudDesconexionFisicaRepository.save(solicitudDesconexion);
        }

        else {
            throw new BadRequestException(`No existe un afiliado físico con la identificación ${dto.Identificacion}`);
        }
    }

    async updateSolicitudDesconexion(id: number, dto: UpdateSolicitudDesconexionFisicaDto)
    {
        const solicitud = await this.solicitudDesconexionFisicaRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) { throw new BadRequestException(`Solicitud de desconexión física con id ${id} no encontrada`); }

        if(dto.Apellido2) {
            dto.Apellido2 = dto.Apellido2.trim()[0].toUpperCase() + dto.Apellido2.trim().slice(1).toLowerCase();
        }

        Object.assign(solicitud, dto);
        return this.solicitudDesconexionFisicaRepository.save(solicitud);
    }

    async UpdateEstadoSolicitudDesconexion(id: number, nuevoEstadoId: number)
    {
        const solicitudDesconexion = await this.solicitudDesconexionFisicaRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitudDesconexion) {throw new BadRequestException(`Solicitud con id ${id} no encontrada`);}

        const nuevoEstado = await this.solicitudEstadoRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) {throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);}

        if (nuevoEstadoId === 2) { // Estado 2 = En revisión
            const nombre = `${solicitudDesconexion.Nombre} ${solicitudDesconexion.Apellido1 ?? ''} ${solicitudDesconexion.Apellido2 ?? ''}`.trim();
            await this.emailService.enviarEmailActualizacionEstado(solicitudDesconexion.Correo, 'Desconexión', 'En revisión', nombre);
        }

        // Actualizar estado de afiliado si la solicitud es aprobada
        if (nuevoEstadoId === 3) // Estado "Aprobada"
        {
            const solicitudDesconexion = await this.solicitudDesconexionFisicaRepository.findOne({ where: { Id_Solicitud: id } });
            if (!solicitudDesconexion) { throw new BadRequestException(`Solicitud de desconexión física con id ${id} no encontrada`); }

            const nombre = `${solicitudDesconexion.Nombre} ${solicitudDesconexion.Apellido1 ?? ''} ${solicitudDesconexion.Apellido2 ?? ''}`.trim();
            await this.emailService.enviarEmailActualizacionEstado(solicitudDesconexion.Correo, 'Desconexión', 'Aprobada', nombre);

            const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Identificacion: solicitudDesconexion.Identificacion } });
            if (afiliado) {
                const estadoInactivo = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 2 } });
                if (estadoInactivo) {
                    afiliado.Estado = estadoInactivo;
                    await this.afiliadoFisicoRepository.save(afiliado);
                }
            }
        }

        if (nuevoEstadoId === 4) { // Estado 4 = Rechazada
            const nombre = `${solicitudDesconexion.Nombre} ${solicitudDesconexion.Apellido1 ?? ''} ${solicitudDesconexion.Apellido2 ?? ''}`.trim();
            await this.emailService.enviarEmailActualizacionEstado(solicitudDesconexion.Correo, 'Desconexión', 'Rechazada', nombre);
        }

        solicitudDesconexion.Estado = nuevoEstado;
        return this.solicitudDesconexionFisicaRepository.save(solicitudDesconexion);
    }
}