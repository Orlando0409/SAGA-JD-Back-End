import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";
import { SolicitudAfiliacionFisica } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudAfiliacionFisicaDto } from "../../SolicitudDTO's/CreateSolicitudFisica.dto";
import { UpdateSolicitudAfiliacionFisicaDto } from "../../SolicitudDTO's/UpdateSolicitudFisica.dto";
import { AfiliadosService } from "src/Modules/Afiliados/afiliados.service";

@Injectable()
export class SolicitudAfiliacionFisicaService
{
    constructor
    (
        @InjectRepository(SolicitudAfiliacionFisica)
        private readonly solicitudAfiliacionFisicaRepository: Repository<SolicitudAfiliacionFisica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly validationsService: ValidationsService,

        private readonly afiliadosService: AfiliadosService,
    ) {}

    async getAllSolicitudesAfiliacion()
    {
        return this.solicitudAfiliacionFisicaRepository.find({ relations: ['Estado'] });
    }

    async findSolicitudAfiliacionById(id: number)
    {
        const solicitud = await this.solicitudAfiliacionFisicaRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) {throw new BadRequestException(`Solicitud de afiliación con id ${id} no encontrada`);}
        return solicitud;
    }

    @Public()
    async createSolicitudAfiliacion(dto: CreateSolicitudAfiliacionFisicaDto, files: any)
    {
        const estadoInicial = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) { throw new BadRequestException(`Estado inicial de solicitud no configurado`); }

        const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesFisicasActivas(dto.Cedula);
        if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

        const planoFile = files.Planos_Terreno?.[0];
        const escrituraFile = files.Escritura_Terreno?.[0];
        const cedula = dto.Cedula;

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Afiliacion', 'Fisicas', cedula) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Afiliacion', 'Fisicas', cedula) : null;

        const now = new Date();
        now.setSeconds(0, 0);

        // Guarda SOLO las URLs en tu BD
        const solicitudAfiliacion = {
            ...dto,
            Planos_Terreno: planoRes?.url,
            Escritura_Terreno: escrituraRes?.url,
            Estado: estadoInicial,
            Id_Tipo_Solicitud: 1
        };

        return this.solicitudAfiliacionFisicaRepository.save(solicitudAfiliacion);
    }

    async updateSolicitudAfiliacion(id: number, dto: UpdateSolicitudAfiliacionFisicaDto)
    {
        const solicitud = await this.solicitudAfiliacionFisicaRepository.findOne({
            where: { Id_Solicitud: id }
        });

        if (!solicitud) {
            throw new BadRequestException(`Solicitud de afiliación con id ${id} no encontrada`);
        }

        Object.assign(solicitud, dto);
        return this.solicitudAfiliacionFisicaRepository.save(solicitud);
    }

    async UpdateEstadoSolicitudAfiliacion(id: number, nuevoEstadoId: number)
    {
        const solicitud = await this.solicitudAfiliacionFisicaRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) { throw new BadRequestException(`Solicitud con id ${id} no encontrada`); }

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) { throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`); }

        solicitud.Estado = nuevoEstado;
        const solicitudActualizada = await this.solicitudAfiliacionFisicaRepository.save(solicitud);

        // Si el estado cambia a 3 (Aprobada), crear automáticamente el afiliado
        if (nuevoEstadoId === 3) {
            try {
                await this.afiliadosService.createAfiliadoFisicoFromSolicitud(solicitudActualizada);
            } catch (error) {
                // Manejar diferentes tipos de errores con mensajes específicos
                if (error.message.includes('Ya existe un afiliado físico')) {
                    throw new BadRequestException(`Error al crear afiliado: Ya existe un afiliado físico con la cédula ${solicitudActualizada.Cedula}. La solicitud fue aprobada pero el afiliado ya estaba registrado.`);
                } else if (error.message.includes('Estado inicial de afiliado no configurado')) {
                    throw new BadRequestException(`Error de configuración: El estado inicial de afiliado no está configurado en el sistema. Contacte al administrador.`);
                } else if (error.message.includes('Tipo de afiliado con ID')) {
                    throw new BadRequestException(`Error de configuración: El tipo de afiliado "Abonado" no está configurado en el sistema. Contacte al administrador.`);
                } else {
                    throw new BadRequestException(`Error al crear afiliado automáticamente: ${error.message}`);
                }
            }
        }

        return solicitudActualizada;
    }

    async deleteSolicitudAfiliacion(id: number)
    {
        const solicitud = await this.solicitudAfiliacionFisicaRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) { throw new BadRequestException(`Solicitud de afiliación con id ${id} no encontrada`); }
        return this.solicitudAfiliacionFisicaRepository.remove(solicitud);
    }
}