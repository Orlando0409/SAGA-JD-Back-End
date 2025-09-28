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

    @Public()
    async createSolicitudCambioMedidor(dto: CreateCambioMedidorFisicaDto)
    {
        const estadoInicial = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) {throw new BadRequestException(`Estado inicial de solicitud no configurado`);}

        // Validar que existe un afiliado físico con esa identificación
        const validacionAfiliadoExistente = await this.validationsService.validarExistenciaAfiliadoFisico(dto.Identificacion);
        if (validacionAfiliadoExistente) { throw new BadRequestException(validacionAfiliadoExistente); }

        const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesFisicasActivas(dto.Identificacion);
        if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

        // Normalizar nombres en el servicio (Apellido2 se maneja automáticamente en la entidad)
        dto.Nombre = dto.Nombre.trim()[0].toUpperCase() + dto.Nombre.trim().slice(1).toLowerCase();
        dto.Apellido1 = dto.Apellido1.trim()[0].toUpperCase() + dto.Apellido1.trim().slice(1).toLowerCase();

        const solicitudCambioMedidor = this.solicitudCambioMedidorFisicaRepository.create({...dto, Estado: estadoInicial});
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

        // Apellido2 se maneja automáticamente en la entidad

        Object.assign(solicitudCambioMedidor, dto);
        return this.solicitudCambioMedidorFisicaRepository.save(solicitudCambioMedidor);
    }
    
    async UpdateEstadoSolicitudCambioMedidor(id: number, nuevoEstadoId: number)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorFisicaRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitudCambioMedidor) {throw new BadRequestException(`Solicitud con id ${id} no encontrada`);}

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) {throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);}

        solicitudCambioMedidor.Estado = nuevoEstado;
        return this.solicitudCambioMedidorFisicaRepository.save(solicitudCambioMedidor);
    }
}