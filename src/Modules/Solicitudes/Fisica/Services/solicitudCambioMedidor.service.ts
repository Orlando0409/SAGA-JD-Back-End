import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";
import { SolicitudCambioMedidorFisica } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateCambioMedidorFisicaDto } from "../../SolicitudDTO's/CreateSolicitudFisica.dto";
import { UpdateSolicitudCambioMedidorFisicaDto } from "../../SolicitudDTO's/UpdateSolicitudFisica.dto";
import { EmailService } from "src/Modules/Emails/email.service";

@Injectable()
export class SolicitudesCambioMedidorFisicaService
{
    constructor
    (
        @InjectRepository(SolicitudCambioMedidorFisica)
        private readonly solicitudCambioMedidorFisicaRepository: Repository<SolicitudCambioMedidorFisica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        private readonly validationsService: ValidationsService,

        private readonly emailService: EmailService,
    ) {}

    async getAllSolicitudesCambioMedidor()
    {
        return this.solicitudCambioMedidorFisicaRepository.find({ relations: ['Estado'] });
    }

    @Public()
    async createSolicitudCambioMedidor(dto: CreateCambioMedidorFisicaDto)
    {
        // Validar que existe un afiliado físico con esa identificación
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

            const nombre = `${dto.Nombre} ${dto.Apellido1 ?? ''} ${dto.Apellido2 ?? ''}`.trim();

            const solicitudCambioMedidor = this.solicitudCambioMedidorFisicaRepository.create({...dto});
            await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Cambio de Medidor', nombre);
            return this.solicitudCambioMedidorFisicaRepository.save(solicitudCambioMedidor);
        }

        else {
            throw new BadRequestException(`No existe un afiliado físico con la identificación ${dto.Identificacion}`);
        }
    }

    async updateSolicitudCambioMedidor(id: number, dto: UpdateSolicitudCambioMedidorFisicaDto)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorFisicaRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitudCambioMedidor) { throw new BadRequestException(`Solicitud de cambio de medidor físico con id ${id} no encontrada`); }

        if(dto.Apellido2) {
            dto.Apellido2 = dto.Apellido2.trim()[0].toUpperCase() + dto.Apellido2.trim().slice(1).toLowerCase();
        }

        Object.assign(solicitudCambioMedidor, dto);
        return this.solicitudCambioMedidorFisicaRepository.save(solicitudCambioMedidor);
    }

    async UpdateEstadoSolicitudCambioMedidor(id: number, nuevoEstadoId: number)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorFisicaRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitudCambioMedidor) {throw new BadRequestException(`Solicitud con id ${id} no encontrada`);}

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) {throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);}

        if (nuevoEstadoId === 2) { // Estado 2 = En revisión
            const nombre = `${solicitudCambioMedidor.Nombre} ${solicitudCambioMedidor.Apellido1 ?? ''} ${solicitudCambioMedidor.Apellido2 ?? ''}`.trim();
            await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'En revisión', nombre);
        }

        if (nuevoEstadoId === 3) { // Estado 3 = Aprobada
            const nombre = `${solicitudCambioMedidor.Nombre} ${solicitudCambioMedidor.Apellido1 ?? ''} ${solicitudCambioMedidor.Apellido2 ?? ''}`.trim();
            await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'Aprobada', nombre);
        }

        if (nuevoEstadoId === 4) { // Estado 4 = Rechazada
            const nombre = `${solicitudCambioMedidor.Nombre} ${solicitudCambioMedidor.Apellido1 ?? ''} ${solicitudCambioMedidor.Apellido2 ?? ''}`.trim();
            await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'Rechazada', nombre);
        }

        solicitudCambioMedidor.Estado = nuevoEstado;
        return this.solicitudCambioMedidorFisicaRepository.save(solicitudCambioMedidor);
    }
}