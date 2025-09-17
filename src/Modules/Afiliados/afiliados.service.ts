import { BadRequestException, Injectable } from "@nestjs/common";
import { AfiliadoFisico, AfiliadoJuridico } from "./AfiliadoEntities/Afiliado.Entity";
import { EstadoAfiliado } from "./AfiliadoEntities/EstadoAfiliado.Entity";
import { SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica } from "src/Modules/Solicitudes/SolicitudEntities/Solicitud.Entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UpdateAfiliadoFisicoDto } from "./AfiliadoDTO's/UpdateAfiliado.dto";
import { TipoAfiliado } from "./AfiliadoEntities/TipoAfiliado.Entity";
import { CreateAfiliadoFisicoDto } from "./AfiliadoDTO's/CreateAfiliado.dto";
import { CreateAfiliacionJuridicaDto } from "src/Modules/Solicitudes/SolicitudDTO's/CreateSolicitudJuridica.dto";
import { ValidationsService } from "src/Validations/Validations.service";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";

@Injectable()
export class AfiliadosService {
  constructor (
    @InjectRepository(AfiliadoFisico)
    private readonly afiliadoFisicoRepository: Repository<AfiliadoFisico>,

    @InjectRepository(AfiliadoJuridico)
    private readonly afiliadoJuridicoRepository: Repository<AfiliadoJuridico>,

    @InjectRepository(EstadoAfiliado)
    private readonly estadoAfiliadoRepository: Repository<EstadoAfiliado>,

    @InjectRepository(TipoAfiliado)
    private readonly tipoAfiliadoRepository: Repository<TipoAfiliado>,

    @InjectRepository(SolicitudAfiliacionFisica)
    private readonly solicitudAfiliacionFisicaRepository: Repository<SolicitudAfiliacionFisica>,

    @InjectRepository(SolicitudAfiliacionJuridica)
    private readonly solicitudAfiliacionJuridicaRepository: Repository<SolicitudAfiliacionJuridica>,

    private readonly validationsService: ValidationsService,

    private readonly dropboxFilesService: DropboxFilesService,
  ) {}

    async getAfiliadosFisicos() {
        return this.afiliadoFisicoRepository.find({ relations: ['Estado', 'Tipo_Afiliado'] });
    }

    async getAfiliadosJuridicos() {
        return this.afiliadoJuridicoRepository.find({ relations: ['Estado', 'Tipo_Afiliado'] });
    }

    async createAfiliadoFisicoFromSolicitud(solicitud: SolicitudAfiliacionFisica) {
        const solicitudAprobada = await this.solicitudAfiliacionFisicaRepository.findOne({ where: { Id_Solicitud: solicitud.Id_Solicitud, Estado: { Id_Estado_Solicitud: 3 } }, relations: ['Estado'] });
        if (!solicitudAprobada) { throw new BadRequestException(`Solicitud de afiliación física con ID ${solicitud.Id_Solicitud} no aprobada`); }

        // Verificar que no existe ya un afiliado físico con esa cédula
        const afiliadoExistente = await this.afiliadoFisicoRepository.findOne({ where: { Cedula: solicitud.Cedula } });
        if (afiliadoExistente) { 
            throw new BadRequestException(`Ya existe un afiliado físico con la cédula ${solicitud.Cedula}`); 
        }

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) { throw new BadRequestException('Estado inicial de afiliado no configurado'); }

        const tipoAfiliado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 1 } });
        if (!tipoAfiliado) { throw new BadRequestException(`Tipo de afiliado con ID ${1} no encontrado`); }

        const afiliado = this.afiliadoFisicoRepository.create({
            ...solicitud,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado
        });

        return this.afiliadoFisicoRepository.save(afiliado);
    }

    async createAfiliadoFisico(dto: CreateAfiliadoFisicoDto, files: any) {
        // Verificar que no existe ya un afiliado físico con esa cédula
        const afiliadoExistente = await this.afiliadoFisicoRepository.findOne({ where: { Cedula: dto.Cedula } });
        if (afiliadoExistente) { 
            throw new BadRequestException(`Ya existe un afiliado físico con la cédula ${dto.Cedula}`); 
        }

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) { throw new BadRequestException('Estado inicial de afiliado no configurado'); }

        const tipoAfiliado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 1 } });
        if (!tipoAfiliado) { throw new BadRequestException(`Tipo de afiliado con ID ${1} no encontrado`); }

        const planoFile = files.Planos_Terreno?.[0];
        const escrituraFile = files.Escritura_Terreno?.[0];

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Afiliacion', 'Fisicas', dto.Cedula) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Afiliacion', 'Fisicas', dto.Cedula) : null;

        const afiliado = this.afiliadoFisicoRepository.create({
            ...dto,
            Planos_Terreno: planoRes?.url,
            Escritura_Terreno: escrituraRes?.url,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado
        });

        return this.afiliadoFisicoRepository.save(afiliado);
    }

    async createAfiliadoJuridicoFromSolicitud(solicitud: SolicitudAfiliacionJuridica) {
        const solicitudAprobada = await this.solicitudAfiliacionJuridicaRepository.findOne({ where: { Id_Solicitud: solicitud.Id_Solicitud, Estado: { Id_Estado_Solicitud: 3 } }, relations: ['Estado'] });
        if (!solicitudAprobada) { throw new BadRequestException(`Solicitud de afiliación jurídica con ID ${solicitud.Id_Solicitud} no aprobada`); }

        // Verificar que no existe ya un afiliado jurídico con esa cédula jurídica
        const afiliadoExistente = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: solicitud.Cedula_Juridica } });
        if (afiliadoExistente) { 
            throw new BadRequestException(`Ya existe un afiliado jurídico con la cédula jurídica ${solicitud.Cedula_Juridica}`); 
        }

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) { throw new BadRequestException('Estado inicial de afiliado no configurado'); }

        const tipoAfiliado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 1 } });
        if (!tipoAfiliado) { throw new BadRequestException(`Tipo de afiliado con ID ${1} no encontrado`); }

        const afiliado = this.afiliadoJuridicoRepository.create({
            ...solicitud,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado
        });

        return this.afiliadoJuridicoRepository.save(afiliado);
    }

    async createAfiliadoJuridico(dto: CreateAfiliacionJuridicaDto, files: any) {
        // Verificar que no existe ya un afiliado jurídico con esa cédula jurídica
        const afiliadoExistente = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: dto.Cedula_Juridica } });
        if (afiliadoExistente) { 
            throw new BadRequestException(`Ya existe un afiliado jurídico con la cédula jurídica ${dto.Cedula_Juridica}`); 
        }

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) { throw new BadRequestException('Estado inicial de afiliado no configurado'); }

        const tipoAfiliado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 1 } });
        if (!tipoAfiliado) { throw new BadRequestException(`Tipo de afiliado con ID ${1} no encontrado`); }

        const planoFile = files.Planos_Terreno?.[0];
        const escrituraFile = files.Escritura_Terreno?.[0];

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Afiliacion', 'Juridicas', dto.Cedula_Juridica) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Afiliacion', 'Juridicas', dto.Cedula_Juridica) : null;

        const afiliado = this.afiliadoJuridicoRepository.create({
            ...dto,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado,
            Planos_Terreno: planoRes?.url,
            Escritura_Terreno: escrituraRes?.url
        });

        return this.afiliadoJuridicoRepository.save(afiliado);
    }

    async updateAfiliadoFisico(cedula: string, dto: UpdateAfiliadoFisicoDto) {
        const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Cedula: cedula } });
        if (!afiliado) { throw new BadRequestException(`Afiliado físico con cédula ${cedula} no encontrado`); }

        Object.assign(afiliado, dto);
        return this.afiliadoFisicoRepository.save(afiliado);
    }

    async updateAfiliadoJuridico(cedulaJuridica: string, dto: UpdateAfiliadoFisicoDto) {
        const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica } });
        if (!afiliado) { throw new BadRequestException(`Afiliado jurídico con cédula jurídica ${cedulaJuridica} no encontrado`); }

        Object.assign(afiliado, dto);
        return this.afiliadoJuridicoRepository.save(afiliado);
    }

    async updateEstadoAfiliadoFisico(idafiliado: number, nuevoEstadoId: number) {
        const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Id_Afiliado: idafiliado }, relations: ['Estado'] });
        if (!afiliado) { throw new BadRequestException(`Afiliado físico con ID ${idafiliado} no encontrado`); }

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) { throw new BadRequestException('Estado inicial de abonado no configurado'); }

        const nuevoEstado = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: nuevoEstadoId } });
        if (!nuevoEstado) { throw new BadRequestException(`Estado con ID ${nuevoEstadoId} no encontrado`); }

        afiliado.Estado = nuevoEstado;
        return this.afiliadoFisicoRepository.save(afiliado);
    }

    async updateEstadoAfiliadoJuridico(idafiliado: number, nuevoEstadoId: number) {
        const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Id_Afiliado: idafiliado }, relations: ['Estado'] });
        if (!afiliado) { throw new BadRequestException(`Afiliado jurídico con ID ${idafiliado} no encontrado`); }

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) { throw new BadRequestException('Estado inicial de abonado no configurado'); }

        const nuevoEstado = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: nuevoEstadoId } });
        if (!nuevoEstado) { throw new BadRequestException(`Estado con ID ${nuevoEstadoId} no encontrado`); }

        afiliado.Estado = nuevoEstado;
        return this.afiliadoJuridicoRepository.save(afiliado);
    }

    async updateTipoAfiliadoFisico(idAfiliado: number, nuevoTipoId: number) {
        const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Id_Afiliado: idAfiliado }, relations: ['Tipo_Afiliado'] });
        if (!afiliado) { throw new BadRequestException(`Afiliado físico con ID ${idAfiliado} no encontrado`); }

        // Validar que el nuevo tipo sea diferente al actual
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado === nuevoTipoId) {
            throw new BadRequestException(`El afiliado ya tiene el tipo con ID ${nuevoTipoId}`);
        }

        // Validar que el tipo de destino exista
        const nuevoTipo = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: nuevoTipoId } });
        if (!nuevoTipo) { throw new BadRequestException(`Tipo de afiliado con ID ${nuevoTipoId} no encontrado`); }

        // Validar transiciones válidas (solo de Abonado a Asociado por ahora)
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado === 1 && nuevoTipoId !== 2) {
            throw new BadRequestException(`Solo se puede cambiar de Abonado (ID=1) a Asociado (ID=2)`);
        }

        afiliado.Tipo_Afiliado = nuevoTipo;
        return this.afiliadoFisicoRepository.save(afiliado);
    }

    async updateTipoAfiliadoJuridico(idAfiliado: number, nuevoTipoId: number) {
        const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Id_Afiliado: idAfiliado }, relations: ['Tipo_Afiliado'] });
        if (!afiliado) { throw new BadRequestException(`Afiliado jurídico con ID ${idAfiliado} no encontrado`); }

        // Validar que el nuevo tipo sea diferente al actual
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado === nuevoTipoId) {
            throw new BadRequestException(`El afiliado ya tiene el tipo con ID ${nuevoTipoId}`);
        }

        // Validar que el tipo de destino exista
        const nuevoTipo = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: nuevoTipoId } });
        if (!nuevoTipo) { throw new BadRequestException(`Tipo de afiliado con ID ${nuevoTipoId} no encontrado`); }

        // Validar transiciones válidas (solo de Abonado a Asociado por ahora)
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado === 1 && nuevoTipoId !== 2) {
            throw new BadRequestException(`Solo se puede cambiar de Abonado (ID=1) a Asociado (ID=2)`);
        }

        afiliado.Tipo_Afiliado = nuevoTipo;
        return this.afiliadoJuridicoRepository.save(afiliado);
    }

    // Métodos para cambiar afiliado a asociado basado en solicitud de asociado aprobada
    async cambiarAbonadoAAsociadoFisico(cedula: string) {
        const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Cedula: cedula }, relations: ['Tipo_Afiliado'] });
        if (!afiliado) { 
            throw new BadRequestException(`No existe un afiliado físico con la cédula ${cedula}`); 
        }

        // Verificar que es abonado (ID 1) antes de cambiar a asociado (ID 2)
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado !== 1) {
            throw new BadRequestException(`El afiliado con cédula ${cedula} ya es asociado o tiene otro tipo`);
        }

        const tipoAsociado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 2 } });
        if (!tipoAsociado) { throw new BadRequestException('Tipo "Asociado" no configurado'); }

        afiliado.Tipo_Afiliado = tipoAsociado;
        return this.afiliadoFisicoRepository.save(afiliado);
    }

    async cambiarAbonadoAAsociadoJuridico(cedulaJuridica: string) {
        const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica }, relations: ['Tipo_Afiliado'] });
        if (!afiliado) { 
            throw new BadRequestException(`No existe un afiliado jurídico con la cédula ${cedulaJuridica}`); 
        }

        // Verificar que es abonado (ID 1) antes de cambiar a asociado (ID 2)
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado !== 1) {
            throw new BadRequestException(`El afiliado con cédula jurídica ${cedulaJuridica} ya es asociado o tiene otro tipo`);
        }

        const tipoAsociado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 2 } });
        if (!tipoAsociado) { throw new BadRequestException('Tipo "Asociado" no configurado'); }

        afiliado.Tipo_Afiliado = tipoAsociado;
        return this.afiliadoJuridicoRepository.save(afiliado);
    }
}