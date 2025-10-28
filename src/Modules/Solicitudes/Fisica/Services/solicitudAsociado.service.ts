import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";
import { SolicitudAsociadoFisica } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudAsociadoFisicaDto } from "../../SolicitudDTO's/CreateSolicitudFisica.dto";
import { UpdateSolicitudAsociadoFisicaDto } from "../../SolicitudDTO's/UpdateSolicitudFisica.dto";
import { AfiliadosService } from "src/Modules/Afiliados/afiliados.service";
import { EmailService } from "src/Modules/Emails/email.service";

@Injectable()
export class SolicitudAsociadoFisicaService
{
    constructor(
        @InjectRepository(SolicitudAsociadoFisica)
        private readonly solicitudAsociadoFisicaRepository: Repository<SolicitudAsociadoFisica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        private readonly validationsService: ValidationsService,

        private readonly afiliadosService: AfiliadosService,

        private readonly emailService: EmailService,
    ) {}

    async getAllSolicitudesAsociado()
    {
        return this.solicitudAsociadoFisicaRepository.find({ relations: ['Estado'] });
    }

    @Public()
    async createSolicitudAsociado(dto: CreateSolicitudAsociadoFisicaDto)
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

            const solicitudAsociado = this.solicitudAsociadoFisicaRepository.create({...dto});
            await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Asociación', nombre);
            return this.solicitudAsociadoFisicaRepository.save(solicitudAsociado);
        }

        else {
            throw new BadRequestException(`Ya existe un afiliado físico con la identificación ${dto.Identificacion}. No se puede crear la solicitud de asociado.`);
        }
    }

    async updateSolicitudAsociado(id: number, dto: UpdateSolicitudAsociadoFisicaDto)
    {
        const solicitudAsociado = await this.solicitudAsociadoFisicaRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitudAsociado) { throw new BadRequestException(`Solicitud de asociado físico con id ${id} no encontrada`); }

        if (dto.Apellido2) {
            dto.Apellido2 = dto.Apellido2.trim()[0].toUpperCase() + dto.Apellido2.trim().slice(1).toLowerCase();
        }

        Object.assign(solicitudAsociado, dto);
        return this.solicitudAsociadoFisicaRepository.save(solicitudAsociado);
    }

    async UpdateEstadoSolicitudAsociado(id: number, nuevoEstadoId: number, idUsuario: number)
    {
        const solicitudAsociado = await this.solicitudAsociadoFisicaRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitudAsociado) {throw new BadRequestException(`Solicitud con id ${id} no encontrada`);}

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) {throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);}

        if (nuevoEstadoId === 2) { // Estado 2 = En revisión
            const nombre = `${solicitudAsociado.Nombre} ${solicitudAsociado.Apellido1 ?? ''} ${solicitudAsociado.Apellido2 ?? ''}`.trim();
            await this.emailService.enviarEmailActualizacionEstado(solicitudAsociado.Correo, 'Asociación', 'En revisión', nombre);
        }

        // Si el estado cambia a 3 (Aprobada), cambiar el tipo del afiliado existente de "Abonado" a "Asociado"
        if (nuevoEstadoId === 3) {
            await this.afiliadosService.cambiarAbonadoAAsociadoFisico(solicitudAsociado.Identificacion, idUsuario);

            const nombre = `${solicitudAsociado.Nombre} ${solicitudAsociado.Apellido1 ?? ''} ${solicitudAsociado.Apellido2 ?? ''}`.trim();
            await this.emailService.enviarEmailActualizacionEstado(solicitudAsociado.Correo, 'Asociación', 'Aprobada', nombre);
        }

        if (nuevoEstadoId === 4) { // Estado 4 = Rechazada
            const nombre = `${solicitudAsociado.Nombre} ${solicitudAsociado.Apellido1 ?? ''} ${solicitudAsociado.Apellido2 ?? ''}`.trim();
            await this.emailService.enviarEmailActualizacionEstado(solicitudAsociado.Correo, 'Asociación', 'Rechazada', nombre);
        }

        solicitudAsociado.Estado = nuevoEstado;
        return this.solicitudAsociadoFisicaRepository.save(solicitudAsociado);
    }
}