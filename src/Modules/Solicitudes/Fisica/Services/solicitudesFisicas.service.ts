import { Solicitud, SolicitudAfiliacionFisica, SolicitudAsociadoFisica, SolicitudCambioMedidorFisica, SolicitudDesconexionFisica, SolicitudFisica } from "../../SolicitudEntities/Solicitud.Entity";
import { CreateSolicitudAfiliacionFisicaDto, CreateSolicitudAsociadoFisicaDto, CreateSolicitudCambioMedidorFisicaDto, CreateSolicitudDesconexionFisicaDto } from "../../SolicitudDTO's/CreateSolicitudFisica.dto";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { ValidationsService } from "src/Validations/Validations.service";
import { AfiliadosService } from "src/Modules/Afiliados/afiliados.service";
import { EmailService } from "src/Modules/Emails/email.service";

@Injectable()
export class SolicitudesFisicasService {
    constructor(
        @InjectRepository(Solicitud)
        private readonly solicitudRepository: Repository<Solicitud>,

        @InjectRepository(SolicitudFisica)
        private readonly solicitudFisicaRepository: Repository<SolicitudFisica>,

        @InjectRepository(SolicitudAfiliacionFisica)
        private readonly solicitudAfiliacionFisicaRepository: Repository<SolicitudAfiliacionFisica>,

        @InjectRepository(SolicitudDesconexionFisica)
        private readonly solicitudDesconexionFisicaRepository: Repository<SolicitudDesconexionFisica>,

        @InjectRepository(SolicitudCambioMedidorFisica)
        private readonly solicitudCambioMedidorFisicaRepository: Repository<SolicitudCambioMedidorFisica>,

        @InjectRepository(SolicitudAsociadoFisica)
        private readonly solicitudAsociadoFisicaRepository: Repository<SolicitudAsociadoFisica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly validationsService: ValidationsService,

        private readonly afiliadosService: AfiliadosService,

        private readonly emailService: EmailService,
    ) { }

    async getAllSolicitudesFisicas() {
        return {
            "Afiliacion": await this.getAllSolicitudesAfiliacion(),
            "Desconexion": await this.getAllSolicitudesDesconexion(),
            "Cambio De Medidor": await this.getAllSolicitudesCambioMedidor(),
            "Asociado": await this.getAllSolicitudesAsociado(),
        };
    }

    async getAllSolicitudesAfiliacion() {
        return this.solicitudAfiliacionFisicaRepository.find({ relations: ['Estado'] });
    }

    async getAllSolicitudesDesconexion() {
        return this.solicitudDesconexionFisicaRepository.find({ relations: ['Estado'] });
    }

    async getAllSolicitudesCambioMedidor() {
        return this.solicitudCambioMedidorFisicaRepository.find({ relations: ['Estado'] });
    }

    async getAllSolicitudesAsociado() {
        return this.solicitudAsociadoFisicaRepository.find({ relations: ['Estado'] });
    }

    async createSolicitudAfiliacion(dto: CreateSolicitudAfiliacionFisicaDto, files: any) {
        // Validación específica para afiliación: NO debe existir un afiliado físico
        const afiliadoExistente = await this.validationsService.validarExistenciaAfiliadoFisico(dto.Identificacion);
        if (afiliadoExistente) throw new BadRequestException(`Ya existe un afiliado físico con la identificación ${dto.Identificacion}`);

        const solicitudActiva = await this.validationsService.validarSolicitudesFisicasActivas(dto.Identificacion);
        if (solicitudActiva) throw new BadRequestException(solicitudActiva);

        dto.Nombre = dto.Nombre.trim()[0].toUpperCase() + dto.Nombre.trim().slice(1).toLowerCase();
        dto.Apellido1 = dto.Apellido1.trim()[0].toUpperCase() + dto.Apellido1.trim().slice(1).toLowerCase();
        if (dto.Apellido2) dto.Apellido2 = dto.Apellido2.trim()[0].toUpperCase() + dto.Apellido2.trim().slice(1).toLowerCase();

        const planoFile = files?.Planos_Terreno?.[0];
        const escrituraFile = files?.Escritura_Terreno?.[0];
        const nombre = `${dto.Nombre} ${dto.Apellido1 ?? ''} ${dto.Apellido2 ?? ''}`.trim();

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Afiliacion', 'Fisicas', dto.Identificacion, nombre) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Afiliacion', 'Fisicas', dto.Identificacion, nombre) : null;

        // 1. Crear registro en tabla padre Solicitud
        const solicitudBase = this.solicitudRepository.create({
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 1, // Afiliación
        });
        const solicitudGuardada = await this.solicitudRepository.save(solicitudBase);

        // 2. Crear registro en tabla intermedia SolicitudFisica
        const solicitudFisica = this.solicitudFisicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 1,
            Tipo_Identificacion: dto.Tipo_Identificacion,
            Identificacion: dto.Identificacion,
            Nombre: dto.Nombre,
            Apellido1: dto.Apellido1,
            Apellido2: dto.Apellido2,
        });
        await this.solicitudFisicaRepository.save(solicitudFisica);

        // 3. Crear registro en tabla específica SolicitudAfiliacionFisica
        const solicitudAfiliacion = this.solicitudAfiliacionFisicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 1,
            Tipo_Identificacion: dto.Tipo_Identificacion,
            Identificacion: dto.Identificacion,
            Nombre: dto.Nombre,
            Apellido1: dto.Apellido1,
            Apellido2: dto.Apellido2,
            Direccion_Exacta: dto.Direccion_Exacta,
            Edad: dto.Edad,
            Planos_Terreno: planoRes?.url || '',
            Escritura_Terreno: escrituraRes?.url || '',
        });
        const solicitudFinal = await this.solicitudAfiliacionFisicaRepository.save(solicitudAfiliacion);

        await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Afiliación', nombre);
        return solicitudFinal;
    }

    async createSolicitudDesconexion(dto: CreateSolicitudDesconexionFisicaDto, files: any) {
        // Validación específica para desconexión: SÍ debe existir un afiliado físico
        const afiliadoExistente = await this.validationsService.validarExistenciaAfiliadoFisico(dto.Identificacion);
        if (!afiliadoExistente) throw new BadRequestException(`No existe un afiliado físico con la identificación ${dto.Identificacion}`);

        const solicitudActiva = await this.validationsService.validarSolicitudesFisicasActivas(dto.Identificacion);
        if (solicitudActiva) throw new BadRequestException(solicitudActiva);

        dto.Nombre = dto.Nombre.trim()[0].toUpperCase() + dto.Nombre.trim().slice(1).toLowerCase();
        dto.Apellido1 = dto.Apellido1.trim()[0].toUpperCase() + dto.Apellido1.trim().slice(1).toLowerCase();
        if (dto.Apellido2) dto.Apellido2 = dto.Apellido2.trim()[0].toUpperCase() + dto.Apellido2.trim().slice(1).toLowerCase();

        const planoFile = files?.Planos_Terreno?.[0];
        const escrituraFile = files?.Escritura_Terreno?.[0];
        const nombre = `${dto.Nombre} ${dto.Apellido1 ?? ''} ${dto.Apellido2 ?? ''}`.trim();

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Desconexion', 'Fisicas', dto.Identificacion, nombre) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Desconexion', 'Fisicas', dto.Identificacion, nombre) : null;

        // 1. Crear registro en tabla padre Solicitud
        const solicitudBase = this.solicitudRepository.create({
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 2, // Desconexión
        });
        const solicitudGuardada = await this.solicitudRepository.save(solicitudBase);

        // 2. Crear registro en tabla intermedia SolicitudFisica
        const solicitudFisica = this.solicitudFisicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 2,
            Tipo_Identificacion: dto.Tipo_Identificacion,
            Identificacion: dto.Identificacion,
            Nombre: dto.Nombre,
            Apellido1: dto.Apellido1,
            Apellido2: dto.Apellido2,
        });
        await this.solicitudFisicaRepository.save(solicitudFisica);

        // 3. Crear registro en tabla específica SolicitudDesconexionFisica
        const solicitudDesconexion = this.solicitudDesconexionFisicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 2,
            Tipo_Identificacion: dto.Tipo_Identificacion,
            Identificacion: dto.Identificacion,
            Nombre: dto.Nombre,
            Apellido1: dto.Apellido1,
            Apellido2: dto.Apellido2,
            Direccion_Exacta: dto.Direccion_Exacta,
            Motivo_Solicitud: dto.Motivo_Solicitud,
            Planos_Terreno: planoRes?.url || '',
            Escritura_Terreno: escrituraRes?.url || '',
        });
        const solicitudFinal = await this.solicitudDesconexionFisicaRepository.save(solicitudDesconexion);

        await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Desconexión', nombre);
        return solicitudFinal;
    }

    async createSolicitudCambioMedidor(dto: CreateSolicitudCambioMedidorFisicaDto) {
        // Validación específica para cambio medidor: SÍ debe existir un afiliado físico
        const afiliadoExistente = await this.validationsService.validarExistenciaAfiliadoFisico(dto.Identificacion);
        if (!afiliadoExistente) throw new BadRequestException(`No existe un afiliado físico con la identificación ${dto.Identificacion}`);

        const solicitudActiva = await this.validationsService.validarSolicitudesFisicasActivas(dto.Identificacion);
        if (solicitudActiva) throw new BadRequestException(solicitudActiva);

        dto.Nombre = dto.Nombre.trim()[0].toUpperCase() + dto.Nombre.trim().slice(1).toLowerCase();
        dto.Apellido1 = dto.Apellido1.trim()[0].toUpperCase() + dto.Apellido1.trim().slice(1).toLowerCase();
        if (dto.Apellido2) dto.Apellido2 = dto.Apellido2.trim()[0].toUpperCase() + dto.Apellido2.trim().slice(1).toLowerCase();

        const nombre = `${dto.Nombre} ${dto.Apellido1 ?? ''} ${dto.Apellido2 ?? ''}`.trim();

        // 1. Crear registro en tabla padre Solicitud
        const solicitudBase = this.solicitudRepository.create({
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 3, // Cambio de Medidor
        });
        const solicitudGuardada = await this.solicitudRepository.save(solicitudBase);

        // 2. Crear registro en tabla intermedia SolicitudFisica
        const solicitudFisica = this.solicitudFisicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 3,
            Tipo_Identificacion: dto.Tipo_Identificacion,
            Identificacion: dto.Identificacion,
            Nombre: dto.Nombre,
            Apellido1: dto.Apellido1,
            Apellido2: dto.Apellido2,
        });
        await this.solicitudFisicaRepository.save(solicitudFisica);

        // 3. Crear registro en tabla específica SolicitudCambioMedidorFisica
        const solicitudCambioMedidor = this.solicitudCambioMedidorFisicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 3,
            Tipo_Identificacion: dto.Tipo_Identificacion,
            Identificacion: dto.Identificacion,
            Nombre: dto.Nombre,
            Apellido1: dto.Apellido1,
            Apellido2: dto.Apellido2,
            Direccion_Exacta: dto.Direccion_Exacta,
            Motivo_Solicitud: dto.Motivo_Solicitud,
            Numero_Medidor_Anterior: dto.Numero_Medidor_Anterior,
        });
        const solicitudFinal = await this.solicitudCambioMedidorFisicaRepository.save(solicitudCambioMedidor);

        await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Cambio de Medidor', nombre);
        return solicitudFinal;
    }

    async createSolicitudAsociado(dto: CreateSolicitudAsociadoFisicaDto) {
        // Validación específica para asociado: SÍ debe existir un afiliado físico
        const afiliadoExistente = await this.validationsService.validarExistenciaAfiliadoFisico(dto.Identificacion);
        if (!afiliadoExistente) throw new BadRequestException(`No existe un afiliado físico con la identificación ${dto.Identificacion}. No se puede crear la solicitud de asociado.`);

        const solicitudActiva = await this.validationsService.validarSolicitudesFisicasActivas(dto.Identificacion);
        if (solicitudActiva) throw new BadRequestException(solicitudActiva);

        dto.Nombre = dto.Nombre.trim()[0].toUpperCase() + dto.Nombre.trim().slice(1).toLowerCase();
        dto.Apellido1 = dto.Apellido1.trim()[0].toUpperCase() + dto.Apellido1.trim().slice(1).toLowerCase();
        if (dto.Apellido2) dto.Apellido2 = dto.Apellido2.trim()[0].toUpperCase() + dto.Apellido2.trim().slice(1).toLowerCase();

        const nombre = `${dto.Nombre} ${dto.Apellido1 ?? ''} ${dto.Apellido2 ?? ''}`.trim();

        // 1. Crear registro en tabla padre Solicitud
        const solicitudBase = this.solicitudRepository.create({
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 4, // Asociado
        });
        const solicitudGuardada = await this.solicitudRepository.save(solicitudBase);

        // 2. Crear registro en tabla intermedia SolicitudFisica
        const solicitudFisica = this.solicitudFisicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 4,
            Tipo_Identificacion: dto.Tipo_Identificacion,
            Identificacion: dto.Identificacion,
            Nombre: dto.Nombre,
            Apellido1: dto.Apellido1,
            Apellido2: dto.Apellido2,
        });
        await this.solicitudFisicaRepository.save(solicitudFisica);

        // 3. Crear registro en tabla específica SolicitudAsociadoFisica
        const solicitudAsociado = this.solicitudAsociadoFisicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 4,
            Tipo_Identificacion: dto.Tipo_Identificacion,
            Identificacion: dto.Identificacion,
            Nombre: dto.Nombre,
            Apellido1: dto.Apellido1,
            Apellido2: dto.Apellido2,
            Motivo_Solicitud: dto.Motivo_Solicitud,
        });
        const solicitudFinal = await this.solicitudAsociadoFisicaRepository.save(solicitudAsociado);

        await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Asociación', nombre);
        return solicitudFinal;
    }
}