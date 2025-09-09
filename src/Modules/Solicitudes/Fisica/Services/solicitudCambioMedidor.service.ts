import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EstadoSolicitud } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { SolicitudCambioMedidor } from "../SolicitudEntities/Solicitud.Entity";
import { CreateCambioMedidorDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { UpdateSolicitudCambioMedidorDto } from "../SolicitudDTO's/UpdateSolicitud.dto";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";

@Injectable()
export class SolicitudesCambioMedidorService
{
    constructor
    (
        @InjectRepository(SolicitudCambioMedidor)
        private readonly solicitudCambioMedidorRepository: Repository<SolicitudCambioMedidor>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        private readonly validationsService: ValidationsService,
    ) {}

    async findAllSolicitudesCambioMedidor()
    {
        return this.solicitudCambioMedidorRepository.find({ relations: ['Estado'] });
    }

    async findSolicitudCambioMedidorById(id: number)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitudCambioMedidor) {
            throw new BadRequestException(`Solicitud de cambio de medidor con id ${id} no encontrada`);
        }
        return solicitudCambioMedidor;
    }

    @Public()
    async createSolicitudCambioMedidor(dto: CreateCambioMedidorDto)
    {
        const estadoInicial = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) {throw new BadRequestException(`Estado inicial de solicitud no configurado`);}
        
        const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesActivas(dto.Cedula);
        if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

        const now = new Date();
        now.setSeconds(0, 0);

        const solicitudCambioMedidor = this.solicitudCambioMedidorRepository.create({...dto, Estado: estadoInicial, Fecha_Creacion: now});
        return this.solicitudCambioMedidorRepository.save(solicitudCambioMedidor);
    }

    async updateSolicitudCambioMedidor(id: number, dto: UpdateSolicitudCambioMedidorDto)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorRepository.findOne({
            where: { Id_Solicitud: id }
        });
    
        if (!solicitudCambioMedidor) {
            throw new BadRequestException(`Solicitud de afiliación con id ${id} no encontrada`);
        }
    
        Object.assign(solicitudCambioMedidor, dto);
        return this.solicitudCambioMedidorRepository.save(solicitudCambioMedidor);
    }
    
    async UpdateEstadoSolicitudCambioMedidor(id: number, nuevoEstadoId: number)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitudCambioMedidor) {throw new BadRequestException(`Solicitud con id ${id} no encontrada`);}
    
        const nuevoEstado = await this.estadoSolicitudRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) {throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);}
    
        solicitudCambioMedidor.Estado = nuevoEstado;
        return this.solicitudCambioMedidorRepository.save(solicitudCambioMedidor);
    }

    async deleteSolicitudCambioMedidor(id: number)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitudCambioMedidor) {
            throw new BadRequestException(`Solicitud de cambio de medidor con id ${id} no encontrada`);
        }
        return this.solicitudCambioMedidorRepository.remove(solicitudCambioMedidor);
    }
}