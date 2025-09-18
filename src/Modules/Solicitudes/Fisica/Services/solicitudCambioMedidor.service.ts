import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";
import { SolicitudCambioMedidorFisica } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateCambioMedidorFisicaDto } from "../../SolicitudDTO's/CreateSolicitudFisica.dto";
import { UpdateSolicitudCambioMedidorFisicaDto } from "../../SolicitudDTO's/UpdateSolicitudFisica.dto";

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
    ) {}

    async getAllSolicitudesCambioMedidor()
    {
        return this.solicitudCambioMedidorFisicaRepository.find({ relations: ['Estado'] });
    }

    async findSolicitudCambioMedidorById(id: number)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorFisicaRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitudCambioMedidor) {
            throw new BadRequestException(`Solicitud de cambio de medidor con id ${id} no encontrada`);
        }
        return solicitudCambioMedidor;
    }

    @Public()
    async createSolicitudCambioMedidor(dto: CreateCambioMedidorFisicaDto)
    {
        const estadoInicial = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) {throw new BadRequestException(`Estado inicial de solicitud no configurado`);}
        
        const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesFisicasActivas(dto.Cedula);
        if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

        const now = new Date();
        now.setSeconds(0, 0);

        const solicitudCambioMedidor = this.solicitudCambioMedidorFisicaRepository.create({...dto, Estado: estadoInicial, Fecha_Creacion: now});
        return this.solicitudCambioMedidorFisicaRepository.save(solicitudCambioMedidor);
    }

    async updateSolicitudCambioMedidor(id: number, dto: UpdateSolicitudCambioMedidorFisicaDto)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorFisicaRepository.findOne({
            where: { Id_Solicitud: id }
        });
    
        if (!solicitudCambioMedidor) {
            throw new BadRequestException(`Solicitud de afiliación con id ${id} no encontrada`);
        }
    
        Object.assign(solicitudCambioMedidor, dto);
        return this.solicitudCambioMedidorFisicaRepository.save(solicitudCambioMedidor);
    }
    
    async UpdateEstadoSolicitudCambioMedidor(id: number, nuevoEstadoId: number)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorFisicaRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitudCambioMedidor) {throw new BadRequestException(`Solicitud con id ${id} no encontrada`);}
    
        const nuevoEstado = await this.estadoSolicitudRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) {throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);}
    
        solicitudCambioMedidor.Estado = nuevoEstado;
        return this.solicitudCambioMedidorFisicaRepository.save(solicitudCambioMedidor);
    }

    async deleteSolicitudCambioMedidor(id: number)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorFisicaRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitudCambioMedidor) {
            throw new BadRequestException(`Solicitud de cambio de medidor con id ${id} no encontrada`);
        }
        return this.solicitudCambioMedidorFisicaRepository.remove(solicitudCambioMedidor);
    }
}