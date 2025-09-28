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
    ) {}

    async getAllSolicitudesAsociado()
    {
        return this.solicitudAsociadoFisicaRepository.find({ relations: ['Estado'] });
    }

    @Public()
    async createSolicitudAsociado(dto: CreateSolicitudAsociadoFisicaDto)
    {
        const estadoInicial = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) {throw new BadRequestException(`Estado inicial de solicitud no configurado`);}

        // Validar que existe un afiliado físico con esa identificación
        const validacionAfiliadoExistente = await this.validationsService.validarExistenciaAfiliadoFisico(dto.Identificacion);
        if (validacionAfiliadoExistente) { throw new BadRequestException(validacionAfiliadoExistente); }

        const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesFisicasActivas(dto.Identificacion);
        if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

        dto.Nombre = dto.Nombre.trim()[0].toUpperCase() + dto.Nombre.trim().slice(1).toLowerCase();
        dto.Apellido1 = dto.Apellido1.trim()[0].toUpperCase() + dto.Apellido1.trim().slice(1).toLowerCase();
        if (dto.Apellido2 !== undefined && dto.Apellido2 !== '') {
            dto.Apellido2 = dto.Apellido2.trim()[0].toUpperCase() + dto.Apellido2.trim().slice(1).toLowerCase();
        }
        if (dto.Apellido2 === undefined || dto.Apellido2 === '') {
            dto.Apellido2 = 'No Proporcionado';
        }

        const solicitudAsociado = this.solicitudAsociadoFisicaRepository.create({...dto, Estado: estadoInicial});
        return this.solicitudAsociadoFisicaRepository.save(solicitudAsociado);
    }

    async updateSolicitudAsociado(id: number, dto: UpdateSolicitudAsociadoFisicaDto)
    {
        const solicitudAsociado = await this.solicitudAsociadoFisicaRepository.findOne({
            where: { Id_Solicitud: id }
        });

        if (!solicitudAsociado) {
            throw new BadRequestException(`Solicitud de afiliación con id ${id} no encontrada`);
        }

        if (dto.Apellido2 === '') {
            dto.Apellido2 = 'No Proporcionado';
        }

        Object.assign(solicitudAsociado, dto);
        return this.solicitudAsociadoFisicaRepository.save(solicitudAsociado);
    }

    async UpdateEstadoSolicitudAsociado(id: number, nuevoEstadoId: number)
    {
        const solicitudAsociado = await this.solicitudAsociadoFisicaRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitudAsociado) {throw new BadRequestException(`Solicitud con id ${id} no encontrada`);}

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) {throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);}

        solicitudAsociado.Estado = nuevoEstado;
        const solicitudActualizada = await this.solicitudAsociadoFisicaRepository.save(solicitudAsociado);

        // Si el estado cambia a 3 (Aprobada), cambiar el tipo del afiliado existente de "Abonado" a "Asociado"
        if (nuevoEstadoId === 3) {
            try {
                await this.afiliadosService.cambiarAbonadoAAsociadoFisico(solicitudActualizada.Identificacion);
            } catch (error) {
                // Manejar diferentes tipos de errores con mensajes específicos
                if (error.message.includes('No existe un afiliado físico')) {
                    throw new BadRequestException(`Error al cambiar tipo: No se encontró un afiliado físico con la identificación ${solicitudActualizada.Identificacion}. La solicitud fue aprobada pero no se pudo cambiar el tipo.`);
                } else if (error.message.includes('ya es asociado')) {
                    throw new BadRequestException(`Información: El afiliado con identificación ${solicitudActualizada.Identificacion} ya es asociado. La solicitud fue aprobada correctamente.`);
                } else if (error.message.includes('Tipo "Asociado" no configurado')) {
                    throw new BadRequestException(`Error de configuración: El tipo "Asociado" no está configurado en el sistema. Contacte al administrador.`);
                } else {
                    throw new BadRequestException(`Error al cambiar tipo de afiliado: ${error.message}`);
                }
            }
        }

        return solicitudActualizada;
    }
}