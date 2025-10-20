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
import { AfiliadoFisico } from "src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity";
import { EstadoAfiliado } from "src/Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";
import { AuditoriaService } from "src/Modules/Auditoria/auditoria.service";

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

        @InjectRepository(AfiliadoFisico)
        private readonly afiliadoFisicoRepository: Repository<AfiliadoFisico>,

        @InjectRepository(EstadoAfiliado)
        private readonly estadoAfiliadoRepository: Repository<EstadoAfiliado>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly validationsService: ValidationsService,

        private readonly afiliadosService: AfiliadosService,

        private readonly emailService: EmailService,

        private readonly auditoriaService: AuditoriaService,
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

    // MÉTODOS PARA CAMBIO DE ESTADO - Usando Id_Solicitud de tabla padre
    async updateEstadoSolicitudAfiliacion(idSolicitud: number, idNuevoEstado: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar el estado de la solicitud de afiliación.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        const solicitudAfiliacion = await this.solicitudAfiliacionFisicaRepository.findOne({ where: { Id_Solicitud: idSolicitud }, relations: ['Estado'] });
        if (!solicitudAfiliacion) throw new BadRequestException(`Solicitud de afiliación con id ${idSolicitud} no encontrada`);

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: idNuevoEstado } });
        if (!nuevoEstado) throw new BadRequestException(`Estado con id ${idNuevoEstado} no encontrado`);

        const nombre = `${solicitudAfiliacion.Nombre} ${solicitudAfiliacion.Apellido1 ?? ''} ${solicitudAfiliacion.Apellido2 ?? ''}`.trim();
        
        // Guardar estado anterior para auditoría
        const estadoAnterior = solicitudAfiliacion.Estado;

        // Estado 2 = En revisión
        if (idNuevoEstado === 2) await this.emailService.enviarEmailActualizacionEstado(solicitudAfiliacion.Correo, 'Afiliación', 'En revisión', nombre);

        // Estado 3 = Aprobada y en espera / Pendiente de instalar medidor
        if (idNuevoEstado === 3) await this.emailService.enviarEmailActualizacionEstado(solicitudAfiliacion.Correo, 'Afiliación', 'Aprobada y en espera', nombre);

        // Estado 4 = Completada
        if (idNuevoEstado === 4) {
            await this.afiliadosService.createAfiliadoFisicoFromSolicitud(solicitudAfiliacion);

            await this.emailService.enviarEmailActualizacionEstado(solicitudAfiliacion.Correo, 'Afiliación', 'Completada', nombre);
            console.log(`Estado de solicitud de afiliación ${idSolicitud} cambiado a 'Completada'`);
        }

        // Estado 5 = Rechazada
        if (idNuevoEstado === 5) console.log(`Estado de solicitud de afiliación ${idSolicitud} cambiado a 'Rechazada'`);

        solicitudAfiliacion.Estado = nuevoEstado;
        const resultado = await this.solicitudAfiliacionFisicaRepository.save(solicitudAfiliacion);

        // Registrar auditoría del cambio de estado
        await this.auditoriaService.createAuditoria(
            'Solicitudes',
            'Actualización',
            idUsuario,
            idSolicitud,
            { Estado_Anterior: estadoAnterior.Nombre_Estado, Nombre_Solicitante: nombre },
            { Estado_Nuevo: nuevoEstado.Nombre_Estado, Nombre_Solicitante: nombre }
        );

        return {
            solicitud: resultado,
            mensaje: `Estado de solicitud de afiliación cambiado a '${nuevoEstado.Nombre_Estado}' exitosamente`
        };
    }

    async updateEstadoSolicitudDesconexion(idSolicitud: number, idNuevoEstado: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar el estado de la solicitud de desconexión.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        const solicitudDesconexion = await this.solicitudDesconexionFisicaRepository.findOne({ where: { Id_Solicitud: idSolicitud }, relations: ['Estado'] });
        if (!solicitudDesconexion) throw new BadRequestException(`Solicitud de desconexión con id ${idSolicitud} no encontrada`);

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: idNuevoEstado } });
        if (!nuevoEstado) throw new BadRequestException(`Estado con id ${idNuevoEstado} no encontrado`);

        const nombre = `${solicitudDesconexion.Nombre} ${solicitudDesconexion.Apellido1 ?? ''} ${solicitudDesconexion.Apellido2 ?? ''}`.trim();

        // Guardar estado anterior para auditoría
        const estadoAnterior = solicitudDesconexion.Estado;

        // Estado 2 = En revisión
        if (idNuevoEstado === 2) await this.emailService.enviarEmailActualizacionEstado(solicitudDesconexion.Correo, 'Desconexión', 'En revisión', nombre);

        // Estado 3 = Aprobada
        if (idNuevoEstado === 3) console.log(`Estado de solicitud de desconexión ${idSolicitud} cambiado a 'Aprobada'`);

        // Estado 4 = Completada
        if (idNuevoEstado === 4) {
            await this.emailService.enviarEmailActualizacionEstado(solicitudDesconexion.Correo, 'Desconexión', 'Completada', nombre);
            console.log(`Estado de solicitud de desconexión ${idSolicitud} cambiado a 'Completada'`);

            // Actualizar estado del afiliado a inactivo
            const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Identificacion: solicitudDesconexion.Identificacion } });
            if (afiliado) {
                const estadoInactivo = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 2 } }); // 2 = Inactivo
                if (estadoInactivo) {
                    afiliado.Estado = estadoInactivo;
                    await this.afiliadoFisicoRepository.save(afiliado);
                }
            }
        }

        // Estado 5 = Rechazada
        if (idNuevoEstado === 5) {
            console.log(`Estado de solicitud de desconexión ${idSolicitud} cambiado a 'Rechazada'`);
            await this.emailService.enviarEmailActualizacionEstado(solicitudDesconexion.Correo, 'Desconexión', 'Rechazada', nombre);
        }

        solicitudDesconexion.Estado = nuevoEstado;
        const resultado = await this.solicitudDesconexionFisicaRepository.save(solicitudDesconexion);

        // Registrar auditoría del cambio de estado
        await this.auditoriaService.createAuditoria(
            'Solicitudes',
            'Actualización',
            idUsuario,
            idSolicitud,
            { Estado_Anterior: estadoAnterior.Nombre_Estado, Nombre_Solicitante: nombre },
            { Estado_Nuevo: nuevoEstado.Nombre_Estado, Nombre_Solicitante: nombre }
        );

        return {
            solicitud: resultado,
            mensaje: `Estado de solicitud de desconexión cambiado a '${nuevoEstado.Nombre_Estado}' exitosamente`
        };
    }

    async updateEstadoSolicitudCambioMedidor(idSolicitud: number, idNuevoEstado: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar el estado de la solicitud de cambio de medidor.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        const solicitudCambioMedidor = await this.solicitudCambioMedidorFisicaRepository.findOne({
            where: { Id_Solicitud: idSolicitud },
            relations: ['Estado']
        });
        if (!solicitudCambioMedidor) throw new BadRequestException(`Solicitud de cambio de medidor con id ${idSolicitud} no encontrada`);

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({
            where: { Id_Estado_Solicitud: idNuevoEstado }
        });
        if (!nuevoEstado) throw new BadRequestException(`Estado con id ${idNuevoEstado} no encontrado`);

        const nombre = `${solicitudCambioMedidor.Nombre} ${solicitudCambioMedidor.Apellido1 ?? ''} ${solicitudCambioMedidor.Apellido2 ?? ''}`.trim();

        // Guardar estado anterior para auditoría
        const estadoAnterior = solicitudCambioMedidor.Estado;

        // Estado 2 = En revisión
        if (idNuevoEstado === 2) await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'En revisión', nombre);

        // Estado 3 = Aprobada
        if (idNuevoEstado === 3) {
            await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'Aprobada', nombre);
            console.log(`Estado de solicitud de cambio de medidor ${idSolicitud} cambiado a 'Aprobada'`);
        }

        // Estado 4 = Completada
        if (idNuevoEstado === 4) {
            await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'Completada', nombre);
            console.log(`Estado de solicitud de cambio de medidor ${idSolicitud} cambiado a 'Completada'`);
        }

        // Estado 5 = Rechazada
        if (idNuevoEstado === 5) {
            console.log(`Estado de solicitud de cambio de medidor ${idSolicitud} cambiado a 'Rechazada'`);
            await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'Rechazada', nombre);
        }

        solicitudCambioMedidor.Estado = nuevoEstado;
        const resultado = await this.solicitudCambioMedidorFisicaRepository.save(solicitudCambioMedidor);

        // Registrar auditoría del cambio de estado
        await this.auditoriaService.createAuditoria(
            'Solicitudes',
            'Actualización',
            idUsuario,
            idSolicitud,
            { Estado_Anterior: estadoAnterior.Nombre_Estado, Nombre_Solicitante: nombre },
            { Estado_Nuevo: nuevoEstado.Nombre_Estado, Nombre_Solicitante: nombre }
        );

        return {
            solicitud: resultado,
            mensaje: `Estado de solicitud de cambio de medidor cambiado a '${nuevoEstado.Nombre_Estado}' exitosamente`
        };
    }

    async updateEstadoSolicitudAsociado(idSolicitud: number, idNuevoEstado: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar el estado de la solicitud de asociado.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        const solicitudAsociado = await this.solicitudAsociadoFisicaRepository.findOne({ where: { Id_Solicitud: idSolicitud }, relations: ['Estado'] });
        if (!solicitudAsociado) throw new BadRequestException(`Solicitud de asociado con id ${idSolicitud} no encontrada`);

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: idNuevoEstado } });
        if (!nuevoEstado) throw new BadRequestException(`Estado con id ${idNuevoEstado} no encontrado`);

        const nombre = `${solicitudAsociado.Nombre} ${solicitudAsociado.Apellido1 ?? ''} ${solicitudAsociado.Apellido2 ?? ''}`.trim();

        // Guardar estado anterior para auditoría
        const estadoAnterior = solicitudAsociado.Estado;

        // Estado 2 = En revisión
        if (idNuevoEstado === 2) await this.emailService.enviarEmailActualizacionEstado(solicitudAsociado.Correo, 'Asociado', 'En revisión', nombre);

        // Estado 3 = Aprobada y en espera
        if (idNuevoEstado === 3) console.log(`Estado de solicitud de asociado ${idSolicitud} cambiado a 'Aprobada'`);

        // Estado 4 = Completada
        if (idNuevoEstado === 4) {
            console.log(`Estado de solicitud de asociado ${idSolicitud} cambiado a 'Completada'`);
            await this.emailService.enviarEmailActualizacionEstado(solicitudAsociado.Correo, 'Asociado', 'Completada', nombre);

            // Cambiar afiliado de abonado a asociado
            await this.afiliadosService.cambiarAbonadoAAsociadoFisico(solicitudAsociado.Identificacion);
        }

        // Estado 5 = Rechazada
        if (idNuevoEstado === 5) {
            console.log(`Estado de solicitud de asociado ${idSolicitud} cambiado a 'Rechazada'`);
            await this.emailService.enviarEmailActualizacionEstado(solicitudAsociado.Correo, 'Asociado', 'Rechazada', nombre);
        }

        solicitudAsociado.Estado = nuevoEstado;
        const resultado = await this.solicitudAsociadoFisicaRepository.save(solicitudAsociado);

        // Registrar auditoría del cambio de estado
        await this.auditoriaService.createAuditoria(
            'Solicitudes',
            'Actualización',
            idUsuario,
            idSolicitud,
            { Estado_Anterior: estadoAnterior.Nombre_Estado, Nombre_Solicitante: nombre },
            { Estado_Nuevo: nuevoEstado.Nombre_Estado, Nombre_Solicitante: nombre }
        );

        return {
            solicitud: resultado,
            mensaje: `Estado de solicitud de asociado cambiado a '${nuevoEstado.Nombre_Estado}' exitosamente`
        };
    }
}