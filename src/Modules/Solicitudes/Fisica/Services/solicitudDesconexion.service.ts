import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ValidationsService } from "src/Validations/Validations.service";
import { SolicitudDesconexionFisica } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudDesconexionFisicaDto } from "../../SolicitudDTO's/CreateSolicitudFisica.dto";
import { UpdateSolicitudDesconexionFisicaDto } from "../../SolicitudDTO's/UpdateSolicitudFisica.dto";

@Injectable()
export class SolicitudesDesconexionFisicaService
{
    constructor
    (
        @InjectRepository(SolicitudDesconexionFisica)
        private readonly solicitudDesconexionFisicaRepository: Repository<SolicitudDesconexionFisica>,

        @InjectRepository(EstadoSolicitud)
        private readonly solicitudEstadoRepository: Repository<EstadoSolicitud>,
        
        private readonly dropboxFilesService: DropboxFilesService,

        private readonly validationsService: ValidationsService,
    ) {}

    async getAllSolicitudesDesconexion()
    {
        return this.solicitudDesconexionFisicaRepository.find({ relations: ['Estado'] });
    }

    @Public()
    async createSolicitudDesconexion(dto: CreateSolicitudDesconexionFisicaDto, files: any)
    {
        const estadoInicial = await this.solicitudEstadoRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) {throw new BadRequestException(`Estado inicial de solicitud no configurado`);}

        // Validar que existe un afiliado físico con esa identificación
        const validacionAfiliadoExistente = await this.validationsService.validarExistenciaAfiliadoFisico(dto.Identificacion);
        if (validacionAfiliadoExistente) { throw new BadRequestException(validacionAfiliadoExistente); }

        const validacionSolicitudesActivas = await this.validationsService.validarSolicitudesFisicasActivas(dto.Identificacion);
        if (validacionSolicitudesActivas) { throw new BadRequestException(validacionSolicitudesActivas); }

        // Normalizar nombres en el servicio (Apellido2 se maneja automáticamente en la entidad)
        dto.Nombre = dto.Nombre.trim()[0].toUpperCase() + dto.Nombre.trim().slice(1).toLowerCase();
        dto.Apellido1 = dto.Apellido1.trim()[0].toUpperCase() + dto.Apellido1.trim().slice(1).toLowerCase();

        const planoFile = files.Planos_Terreno?.[0];
        const escrituraFile = files.Escritura_Terreno?.[0];
        const nombre = `${dto.Nombre} ${dto.Apellido1 ?? ''} `.trim();

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Desconexion', 'Fisicas', dto.Identificacion, nombre) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Desconexion', 'Fisicas', dto.Identificacion, nombre) : null;

        // Crear instancia de la entidad para que se ejecuten los decoradores @BeforeInsert
        const solicitudDesconexion = this.solicitudDesconexionFisicaRepository.create({
            ...dto,
            Planos_Terreno: planoRes?.url,
            Escritura_Terreno: escrituraRes?.url,
            Estado: estadoInicial,
            Id_Tipo_Solicitud: 2
        });

        return this.solicitudDesconexionFisicaRepository.save(solicitudDesconexion);
    }

    async updateSolicitudDesconexion(id: number, dto: UpdateSolicitudDesconexionFisicaDto)
    {
        const solicitud = await this.solicitudDesconexionFisicaRepository.findOne({
            where: { Id_Solicitud: id }
        });

        if (!solicitud) {
            throw new BadRequestException(`Solicitud de afiliación con id ${id} no encontrada`);
        }

        // Apellido2 se maneja automáticamente en la entidad

        Object.assign(solicitud, dto);
        return this.solicitudDesconexionFisicaRepository.save(solicitud);
    }

    async UpdateEstadoSolicitudDesconexion(id: number, nuevoEstadoId: number)
    {
        const solicitud = await this.solicitudDesconexionFisicaRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) {throw new BadRequestException(`Solicitud con id ${id} no encontrada`);}
        
        const nuevoEstado = await this.solicitudEstadoRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) {throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);}
        
        solicitud.Estado = nuevoEstado;
        return this.solicitudDesconexionFisicaRepository.save(solicitud);
    }
}