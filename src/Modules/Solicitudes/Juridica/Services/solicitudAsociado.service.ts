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

@Injectable()
export class SolicitudAsociadoJuridicaService
{
    constructor(
        @InjectRepository(SolicitudAsociadoJuridica)
        private readonly solicitudAsociadoJuridicaRepository: Repository<SolicitudAsociadoJuridica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        private readonly validationsService: ValidationsService,

        private readonly afiliadosService: AfiliadosService,
    ) {}

    async getAllSolicitudesAsociado()
    {
        return this.solicitudAsociadoJuridicaRepository.find({ relations: ['Estado'] });
    }

    async findSolicitudAsociadoById(id: number)
    {
        const solicitud = await this.solicitudAsociadoJuridicaRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) {throw new BadRequestException(`Solicitud de asociado jurídica con id ${id} no encontrada`);}
        return solicitud;
    }

    @Public()
    async createSolicitudAsociado(dto: CreateSolicitudAsociadoJuridicaDto)
    {
        const estadoInicial = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) {throw new BadRequestException(`Estado inicial de solicitud no configurado`);}

        // Validar que existe un afiliado jurídico con esa cédula jurídica
        const validacionAfiliadoExistente = await this.validationsService.validarExistenciaAfiliadoJuridico(dto.Cedula_Juridica);
        if (validacionAfiliadoExistente) { throw new BadRequestException(validacionAfiliadoExistente); }

        const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesJuridicasActivas(dto.Cedula_Juridica);
        if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

        const now = new Date();
        now.setSeconds(0, 0);

        const solicitudAsociado = this.solicitudAsociadoJuridicaRepository.create({...dto, Estado: estadoInicial, Fecha_Creacion: now});
        return this.solicitudAsociadoJuridicaRepository.save(solicitudAsociado);
    }

    async updateSolicitudAsociado(id: number, dto: UpdateSolicitudAsociadoJuridicaDto)
    {
        const solicitudAsociado = await this.solicitudAsociadoJuridicaRepository.findOne({
            where: { Id_Solicitud: id }
        });

        if (!solicitudAsociado) {
            throw new BadRequestException(`Solicitud de asociado jurídica con id ${id} no encontrada`);
        }

        Object.assign(solicitudAsociado, dto);
        return this.solicitudAsociadoJuridicaRepository.save(solicitudAsociado);
    }
    
    async UpdateEstadoSolicitudAsociado(id: number, nuevoEstadoId: number)
    {
        const solicitudAsociado = await this.solicitudAsociadoJuridicaRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitudAsociado) {throw new BadRequestException(`Solicitud con id ${id} no encontrada`);}

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) {throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);}

        solicitudAsociado.Estado = nuevoEstado;
        const solicitudActualizada = await this.solicitudAsociadoJuridicaRepository.save(solicitudAsociado);

        // Si el estado cambia a 3 (Aprobada), cambiar el tipo del afiliado existente de "Abonado" a "Asociado"
        if (nuevoEstadoId === 3) {
            try {
                await this.afiliadosService.cambiarAbonadoAAsociadoJuridico(solicitudActualizada.Cedula_Juridica);
            } catch (error) {
                // Manejar diferentes tipos de errores con mensajes específicos
                if (error.message.includes('No existe un afiliado jurídico')) {
                    throw new BadRequestException(`Error al cambiar tipo: No se encontró un afiliado jurídico con la cédula jurídica ${solicitudActualizada.Cedula_Juridica}. La solicitud fue aprobada pero no se pudo cambiar el tipo.`);
                } else if (error.message.includes('ya es asociado')) {
                    throw new BadRequestException(`Información: El afiliado con cédula jurídica ${solicitudActualizada.Cedula_Juridica} ya es asociado. La solicitud fue aprobada correctamente.`);
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