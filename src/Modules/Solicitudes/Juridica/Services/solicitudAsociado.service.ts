import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";
import { SolicitudAsociadoJuridica } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudAsociadoJuridicaDto } from "../../SolicitudDTO's/CreateSolicitudJuridica.dto";
import { UpdateSolicitudAsociadoJuridicaDto } from "../../SolicitudDTO's/UpdateSolicitudJuridica.dto";
import { AfiliadosService } from "src/Modules/Afiliados/afiliados.service";
import { EmailService } from "src/Modules/Emails/email.service";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";

@Injectable()
export class SolicitudAsociadoJuridicaService {
    constructor(
        @InjectRepository(SolicitudAsociadoJuridica)
        private readonly solicitudAsociadoJuridicaRepository: Repository<SolicitudAsociadoJuridica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        private readonly validationsService: ValidationsService,

        private readonly afiliadosService: AfiliadosService,

        private readonly emailService: EmailService,
    ) { }

    async getAllSolicitudesAsociado() {
        return this.solicitudAsociadoJuridicaRepository.find({ relations: ['Estado'] });
    }

    @Public()
    async createSolicitudAsociado(dto: CreateSolicitudAsociadoJuridicaDto) {
        // Validar que existe un afiliado jurídico con esa cédula jurídica
        const AfiliadoExistente = await this.validationsService.validarExistenciaAfiliadoJuridico(dto.Cedula_Juridica);
        if (!AfiliadoExistente) {
            const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesJuridicasActivas(dto.Cedula_Juridica);
            if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

            dto.Razon_Social = dto.Razon_Social.trim()[0].toUpperCase() + dto.Razon_Social.trim().slice(1).toLowerCase();

            const solicitudAsociado = this.solicitudAsociadoJuridicaRepository.create({ ...dto });
            await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Asociación', dto.Razon_Social);
            return this.solicitudAsociadoJuridicaRepository.save(solicitudAsociado);
        }

        else throw new BadRequestException(`No existe un afiliado jurídico con la cédula jurídica ${dto.Cedula_Juridica}`);
    }

    async updateSolicitudAsociado(idSolicitud: number, dto: UpdateSolicitudAsociadoJuridicaDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('Usuario no encontrado');

        const solicitudAsociado = await this.solicitudAsociadoJuridicaRepository.findOne({ where: { Id_Solicitud: idSolicitud }, relations: ['Estado'] });
        if (!solicitudAsociado) throw new BadRequestException(`Solicitud de asociado jurídica con id ${idSolicitud} no encontrada`);

        Object.assign(solicitudAsociado, dto);
        return this.solicitudAsociadoJuridicaRepository.save(solicitudAsociado);
    }

    async UpdateEstadoSolicitudAsociado(idSolicitud: number, idNuevoEstado: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('Usuario no encontrado');

        const solicitudAsociado = await this.solicitudAsociadoJuridicaRepository.findOne({ where: { Id_Solicitud: idSolicitud }, relations: ['Estado'] });
        if (!solicitudAsociado) throw new BadRequestException(`Solicitud con id ${idSolicitud} no encontrada`);

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: idNuevoEstado } });
        if (!nuevoEstado) throw new BadRequestException(`Estado con id ${idNuevoEstado} no encontrado`);

        // Estado 2 = En revisión
        if (idNuevoEstado === 2) await this.emailService.enviarEmailActualizacionEstado(solicitudAsociado.Correo, 'Asociación', 'En revisión', solicitudAsociado.Razon_Social);

        // Si el estado cambia a 3 (Aprobada), cambiar el tipo del afiliado existente de "Abonado" a "Asociado"
        if (idNuevoEstado === 3) {
            await this.afiliadosService.cambiarAbonadoAAsociadoJuridico(solicitudAsociado.Cedula_Juridica, idUsuario);
            await this.emailService.enviarEmailActualizacionEstado(solicitudAsociado.Correo, 'Asociación', 'Aprobada', solicitudAsociado.Razon_Social);
        }

        // Estado 4 = Rechazada
        if (idNuevoEstado === 4) await this.emailService.enviarEmailActualizacionEstado(solicitudAsociado.Correo, 'Asociación', 'Rechazada', solicitudAsociado.Razon_Social);

        solicitudAsociado.Estado = nuevoEstado;
        return this.solicitudAsociadoJuridicaRepository.save(solicitudAsociado);
    }
}