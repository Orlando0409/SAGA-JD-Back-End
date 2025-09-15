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

    async findSolicitudAsociadoById(id: number)
    {
        const solicitud = await this.solicitudAsociadoFisicaRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) {throw new BadRequestException(`Solicitud de asociado con id ${id} no encontrada`);}
        return solicitud;
    }

    @Public()
    async createSolicitudAsociado(dto: CreateSolicitudAsociadoFisicaDto)
    {
        const estadoInicial = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) {throw new BadRequestException(`Estado inicial de solicitud no configurado`);}

        // Validar que existe un afiliado físico con esa cédula
        const validacionAfiliadoExistente = await this.validationsService.validarExistenciaAfiliadoFisico(dto.Cedula);
        if (validacionAfiliadoExistente) { throw new BadRequestException(validacionAfiliadoExistente); }

        const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesFisicasActivas(dto.Cedula);
        if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

        const now = new Date();
        now.setSeconds(0, 0);

        const solicitudAsociado = this.solicitudAsociadoFisicaRepository.create({...dto, Estado: estadoInicial, Fecha_Creacion: now});
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
                await this.afiliadosService.cambiarAbonadoAAsociadoFisico(solicitudActualizada.Cedula);
            } catch (error) {
                // Manejar diferentes tipos de errores con mensajes específicos
                if (error.message.includes('No existe un afiliado físico')) {
                    throw new BadRequestException(`Error al cambiar tipo: No se encontró un afiliado físico con la cédula ${solicitudActualizada.Cedula}. La solicitud fue aprobada pero no se pudo cambiar el tipo.`);
                } else if (error.message.includes('ya es asociado')) {
                    throw new BadRequestException(`Información: El afiliado con cédula ${solicitudActualizada.Cedula} ya es asociado. La solicitud fue aprobada correctamente.`);
                } else if (error.message.includes('Tipo "Asociado" no configurado')) {
                    throw new BadRequestException(`Error de configuración: El tipo "Asociado" no está configurado en el sistema. Contacte al administrador.`);
                } else {
                    throw new BadRequestException(`Error al cambiar tipo de afiliado: ${error.message}`);
                }
            }
        }

        return solicitudActualizada;
    }

    async deleteSolicitudAsociado(id: number)
    {
        const solicitudAsociado = await this.solicitudAsociadoFisicaRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitudAsociado) {
            throw new BadRequestException(`Solicitud de cambio de medidor con id ${id} no encontrada`);
        }
        return this.solicitudAsociadoFisicaRepository.remove(solicitudAsociado);
    }
}