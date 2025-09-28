import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";
import { SolicitudAfiliacionJuridica } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudAfiliacionJuridicaDto } from "../../SolicitudDTO's/CreateSolicitudJuridica.dto";
import { UpdateSolicitudAfiliacionJuridicaDto } from "../../SolicitudDTO's/UpdateSolicitudJuridica.dto";
import { AfiliadosService } from "src/Modules/Afiliados/afiliados.service";

@Injectable()
export class SolicitudAfiliacionJuridicaService
{
    constructor
    (
        @InjectRepository(SolicitudAfiliacionJuridica)
        private readonly solicitudAfiliacionJuridicaRepository: Repository<SolicitudAfiliacionJuridica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly validationsService: ValidationsService,

        private readonly afiliadosService: AfiliadosService,
    ) {}

    async getAllSolicitudesAfiliacion()
    {
        return this.solicitudAfiliacionJuridicaRepository.find({ relations: ['Estado'] });
    }

    @Public()
    async createSolicitudAfiliacion(dto: CreateSolicitudAfiliacionJuridicaDto, files: any)
    {
        const estadoInicial = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) { throw new BadRequestException(`Estado inicial de solicitud no configurado`); }

        const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesJuridicasActivas(dto.Cedula_Juridica);
        if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

        const planoFile = files.Planos_Terreno?.[0];
        const escrituraFile = files.Escritura_Terreno?.[0];

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Afiliacion', 'Juridicas', dto.Cedula_Juridica, dto.Razon_Social) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Afiliacion', 'Juridicas', dto.Cedula_Juridica, dto.Razon_Social) : null;

        dto.Razon_Social = dto.Razon_Social.trim()[0].toUpperCase() + dto.Razon_Social.trim().slice(1).toLowerCase();

        // Crear instancia de la entidad para que se ejecuten los decoradores @BeforeInsert
        const solicitudAfiliacion = this.solicitudAfiliacionJuridicaRepository.create({
            ...dto,
            Planos_Terreno: planoRes?.url,
            Escritura_Terreno: escrituraRes?.url,
            Estado: estadoInicial
        });

        return this.solicitudAfiliacionJuridicaRepository.save(solicitudAfiliacion);
    }

    async updateSolicitudAfiliacion(id: number, dto: UpdateSolicitudAfiliacionJuridicaDto)
    {
        const solicitud = await this.solicitudAfiliacionJuridicaRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) { throw new BadRequestException(`Solicitud de afiliación jurídica con id ${id} no encontrada`); }

        if (dto.Razon_Social) {
            dto.Razon_Social = dto.Razon_Social.trim()[0].toUpperCase() + dto.Razon_Social.trim().slice(1).toLowerCase();
        }

        Object.assign(solicitud, dto);
        return this.solicitudAfiliacionJuridicaRepository.save(solicitud);
    }

    async UpdateEstadoSolicitudAfiliacion(id: number, nuevoEstadoId: number)
    {
        const solicitud = await this.solicitudAfiliacionJuridicaRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) { throw new BadRequestException(`Solicitud con id ${id} no encontrada`); }

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) { throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`); }

        solicitud.Estado = nuevoEstado;
        const solicitudActualizada = await this.solicitudAfiliacionJuridicaRepository.save(solicitud);

        // Si el estado cambia a 3 (Aprobada), crear automáticamente el afiliado
        if (nuevoEstadoId === 3) {
            try {
                await this.afiliadosService.createAfiliadoJuridicoFromSolicitud(solicitudActualizada);
            } catch (error) {
                // Manejar diferentes tipos de errores con mensajes específicos
                if (error.message.includes('Ya existe un afiliado jurídico')) {
                    throw new BadRequestException(`Error al crear afiliado: Ya existe un afiliado jurídico con la cédula jurídica ${solicitudActualizada.Cedula_Juridica}. La solicitud fue aprobada pero el afiliado ya estaba registrado.`);
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
}