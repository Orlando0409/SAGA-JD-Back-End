import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";
import { SolicitudCambioMedidorJuridica } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudCambioMedidorJuridicaDto } from "../../SolicitudDTO's/CreateSolicitudJuridica.dto";
import { UpdateSolicitudCambioMedidorJuridicaDto } from "../../SolicitudDTO's/UpdateSolicitudJuridica.dto";

@Injectable()
export class SolicitudCambioMedidorJuridicaService
{
    constructor(
        @InjectRepository(SolicitudCambioMedidorJuridica)
        private readonly solicitudCambioMedidorJuridicaRepository: Repository<SolicitudCambioMedidorJuridica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        private readonly validationsService: ValidationsService,
    ) {}

    async getAllSolicitudesCambioMedidor()
    {
        return this.solicitudCambioMedidorJuridicaRepository.find({ relations: ['Estado'] });
    }

    async findSolicitudCambioMedidorById(id: number)
    {
        const solicitud = await this.solicitudCambioMedidorJuridicaRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) {throw new BadRequestException(`Solicitud de cambio de medidor jurídica con id ${id} no encontrada`);}
        return solicitud;
    }

    @Public()
    async createSolicitudCambioMedidor(dto: CreateSolicitudCambioMedidorJuridicaDto)
    {
        const estadoInicial = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) {throw new BadRequestException(`Estado inicial de solicitud no configurado`);}

        const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesJuridicasActivas(dto.Cedula_Juridica);
        if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

        const now = new Date();
        now.setSeconds(0, 0);

        const solicitudCambioMedidor = this.solicitudCambioMedidorJuridicaRepository.create({...dto, Estado: estadoInicial, Fecha_Creacion: now});
        return this.solicitudCambioMedidorJuridicaRepository.save(solicitudCambioMedidor);
    }

    async updateSolicitudCambioMedidor(id: number, dto: UpdateSolicitudCambioMedidorJuridicaDto)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorJuridicaRepository.findOne({
            where: { Id_Solicitud: id }
        });

        if (!solicitudCambioMedidor) {
            throw new BadRequestException(`Solicitud de cambio de medidor jurídica con id ${id} no encontrada`);
        }

        Object.assign(solicitudCambioMedidor, dto);
        return this.solicitudCambioMedidorJuridicaRepository.save(solicitudCambioMedidor);
    }
    
    async UpdateEstadoSolicitudCambioMedidor(id: number, nuevoEstadoId: number)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorJuridicaRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitudCambioMedidor) {throw new BadRequestException(`Solicitud con id ${id} no encontrada`);}

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) {throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);}

        solicitudCambioMedidor.Estado = nuevoEstado;
        return this.solicitudCambioMedidorJuridicaRepository.save(solicitudCambioMedidor);
    }
}