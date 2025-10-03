import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";
import { SolicitudCambioMedidorJuridica } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudCambioMedidorJuridicaDto } from "../../SolicitudDTO's/CreateSolicitudJuridica.dto";
import { UpdateSolicitudCambioMedidorJuridicaDto } from "../../SolicitudDTO's/UpdateSolicitudJuridica.dto";
import { EmailService } from "src/Modules/Emails/email.service";

@Injectable()
export class SolicitudCambioMedidorJuridicaService
{
    constructor(
        @InjectRepository(SolicitudCambioMedidorJuridica)
        private readonly solicitudCambioMedidorJuridicaRepository: Repository<SolicitudCambioMedidorJuridica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        private readonly validationsService: ValidationsService,

        private readonly emailService: EmailService,
    ) {}

    async getAllSolicitudesCambioMedidor()
    {
        return this.solicitudCambioMedidorJuridicaRepository.find({ relations: ['Estado'] });
    }

    @Public()
    async createSolicitudCambioMedidor(dto: CreateSolicitudCambioMedidorJuridicaDto)
    {
        // Validar que existe un afiliado jurídico con esa identificación
        const AfiliadoExistente = await this.validationsService.validarExistenciaAfiliadoJuridico(dto.Cedula_Juridica);
        if (AfiliadoExistente) {
            const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesJuridicasActivas(dto.Cedula_Juridica);
            if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

            dto.Razon_Social = dto.Razon_Social.trim()[0].toUpperCase() + dto.Razon_Social.trim().slice(1).toLowerCase();

            const solicitudCambioMedidor = this.solicitudCambioMedidorJuridicaRepository.create({...dto});
            await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Cambio de Medidor', dto.Razon_Social);
            return this.solicitudCambioMedidorJuridicaRepository.save(solicitudCambioMedidor);
        }

        else {
            throw new BadRequestException(`No existe un afiliado jurídico con la cédula jurídica ${dto.Cedula_Juridica}`);
        }
    }

    async updateSolicitudCambioMedidor(id: number, dto: UpdateSolicitudCambioMedidorJuridicaDto)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorJuridicaRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitudCambioMedidor) { throw new BadRequestException(`Solicitud de cambio de medidor jurídica con id ${id} no encontrada`); }

        Object.assign(solicitudCambioMedidor, dto);
        return this.solicitudCambioMedidorJuridicaRepository.save(solicitudCambioMedidor);
    }

    async UpdateEstadoSolicitudCambioMedidor(id: number, nuevoEstadoId: number)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorJuridicaRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitudCambioMedidor) {throw new BadRequestException(`Solicitud con id ${id} no encontrada`);}

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) {throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);}

        if (nuevoEstadoId === 2) { // Estado 2 = En revisión
            await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'En revisión', solicitudCambioMedidor.Razon_Social);
        }

        if (nuevoEstadoId === 3) { // Estado 3 = Aprobada
            await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'Aprobada', solicitudCambioMedidor.Razon_Social);
        }

        if (nuevoEstadoId === 4) { // Estado 4 = Rechazada
            await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'Rechazada', solicitudCambioMedidor.Razon_Social);
        }

        solicitudCambioMedidor.Estado = nuevoEstado;
        return this.solicitudCambioMedidorJuridicaRepository.save(solicitudCambioMedidor);
    }
}