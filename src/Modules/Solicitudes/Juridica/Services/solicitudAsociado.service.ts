import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";
import { AsociadosService } from "src/Modules/Afiliados/Services/asociados.service";
import { SolicitudAsociadoJuridica } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudAsociadoJuridicaDto } from "../../SolicitudDTO's/CreateSolicitudJuridica.dto";
import { UpdateSolicitudAsociadoJuridicaDto } from "../../SolicitudDTO's/UpdateSolicitudJuridica.dto";

@Injectable()
export class SolicitudAsociadoJuridicaService
{
    constructor(
        @InjectRepository(SolicitudAsociadoJuridica)
        private readonly solicitudAsociadoJuridicaRepository: Repository<SolicitudAsociadoJuridica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        private readonly validationsService: ValidationsService,

        private readonly asociadosService: AsociadosService,
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

        // Si el estado cambia a 3 (Aprobada), crear automáticamente el asociado
        if (nuevoEstadoId === 3) {
            try {
                await this.asociadosService.createAsociadoJuridico(solicitudActualizada);
            } catch (error) {
                // Si ya existe el asociado, no lanzar error, solo continuar
                if (!error.message.includes('Ya existe un asociado')) {
                    throw error;
                }
            }
        }

        return solicitudActualizada;
    }

    async deleteSolicitudAsociado(id: number)
    {
        const solicitudAsociado = await this.solicitudAsociadoJuridicaRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitudAsociado) {
            throw new BadRequestException(`Solicitud de asociado jurídica con id ${id} no encontrada`);
        }
        return this.solicitudAsociadoJuridicaRepository.remove(solicitudAsociado);
    }
}
