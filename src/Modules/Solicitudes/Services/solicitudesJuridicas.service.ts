import { Solicitud, SolicitudAfiliacionJuridica, SolicitudAsociadoJuridica, SolicitudCambioMedidorJuridica, SolicitudDesconexionJuridica, SolicitudJuridica } from "../SolicitudEntities/Solicitud.Entity";
import { Repository } from "typeorm";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EstadoSolicitud } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { EmailService } from "src/Modules/Emails/email.service";
import { AfiliadosService } from "src/Modules/Afiliados/afiliados.service";
import { ValidationsService } from "src/Validations/Validations.service";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { UsuariosService } from "src/Modules/Usuarios/Services/usuarios.service";
import { AuditoriaService } from "src/Modules/Auditoria/auditoria.service";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";
import { UpdateSolicitudAfiliacionJuridicaDto, UpdateSolicitudAsociadoJuridicaDto, UpdateSolicitudCambioMedidorJuridicaDto, UpdateSolicitudDesconexionJuridicaDto } from "../SolicitudDTO's/UpdateSolicitudJuridica.dto";
import { CreateSolicitudAfiliacionJuridicaDto, CreateSolicitudAsociadoJuridicaDto, CreateSolicitudCambioMedidorJuridicaDto, CreateSolicitudDesconexionJuridicaDto } from "../SolicitudDTO's/CreateSolicitudJuridica.dto";
import { AfiliadoJuridico } from "src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity";
import { EstadoAfiliado } from "src/Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity";

@Injectable()
export class SolicitudesJuridicasService {
    constructor(
        @InjectRepository(Solicitud)
        private readonly solicitudRepository: Repository<Solicitud>,

        @InjectRepository(SolicitudJuridica)
        private readonly solicitudJuridicaRepository: Repository<SolicitudJuridica>,

        @InjectRepository(SolicitudAfiliacionJuridica)
        private readonly solicitudAfiliacionRepository: Repository<SolicitudAfiliacionJuridica>,

        @InjectRepository(SolicitudDesconexionJuridica)
        private readonly solicitudDesconexionRepository: Repository<SolicitudDesconexionJuridica>,

        @InjectRepository(SolicitudCambioMedidorJuridica)
        private readonly solicitudCambioMedidorRepository: Repository<SolicitudCambioMedidorJuridica>,

        @InjectRepository(SolicitudAsociadoJuridica)
        private readonly solicitudAsociadoRepository: Repository<SolicitudAsociadoJuridica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepo: Repository<EstadoSolicitud>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        @InjectRepository(AfiliadoJuridico)
        private readonly afiliadoJuridicoRepository: Repository<AfiliadoJuridico>,

        @InjectRepository(EstadoAfiliado)
        private readonly estadoAfiliadoRepository: Repository<EstadoAfiliado>,

        private readonly dropboxFilesService: DropboxFilesService,
        
        private readonly validationsService: ValidationsService,

        private readonly afiliadosService: AfiliadosService,

        private readonly emailService: EmailService,

        private readonly usuariosService: UsuariosService,

        private readonly auditoriaService: AuditoriaService,
    ) { }

    // MÉTODOS PARA OBTENER SOLICITUDES JURÍDICAS
    async getAllSolicitudesJuridicas() {
        return {
            "Afiliacion": await this.getAllSolicitudesAfiliacion(),
            "Desconexion": await this.getAllSolicitudesDesconexion(),
            "Cambio De Medidor": await this.getAllSolicitudesCambioMedidor(),
            "Asociado": await this.getAllSolicitudesAsociado(),
        };
    }

    async getAllSolicitudesAfiliacion() {
        return this.solicitudAfiliacionRepository.find({ relations: ['Estado'] });
    }

    async getAllSolicitudesDesconexion() {
        return this.solicitudDesconexionRepository.find({ relations: ['Estado'] });
    }

    async getAllSolicitudesCambioMedidor() {
        return this.solicitudCambioMedidorRepository.find({ relations: ['Estado'] });
    }

    async getAllSolicitudesAsociado() {
        return this.solicitudAsociadoRepository.find({ relations: ['Estado'] });
    }



    // MÉTODOS PARA CREAR SOLICITUDES JURÍDICAS
    async createSolicitudAfiliacion(dto: CreateSolicitudAfiliacionJuridicaDto, files: any) {
        const solicitudActiva = await this.validationsService.validarSolicitudesJuridicasActivas(dto.Cedula_Juridica);
        if (solicitudActiva) throw new BadRequestException(solicitudActiva);

        // Validación específica para afiliación: NO debe existir un afiliado jurídico
        const afiliadoExistente = await this.validationsService.validarExistenciaAfiliadoJuridico(dto.Cedula_Juridica);
        if (afiliadoExistente) throw new BadRequestException(`Ya existe un afiliado jurídico con la cédula ${dto.Cedula_Juridica}`);

        dto.Razon_Social = dto.Razon_Social.trim()[0].toUpperCase() + dto.Razon_Social.trim().slice(1).toLowerCase();

        const planoFile = files?.Planos_Terreno?.[0];
        const escrituraFile = files?.Escritura_Terreno?.[0];
        const razonSocial = dto.Razon_Social;

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Afiliacion', 'Juridicas', dto.Cedula_Juridica, razonSocial) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Afiliacion', 'Juridicas', dto.Cedula_Juridica, razonSocial) : null;

        // 1. Crear registro en tabla padre Solicitud
        const solicitudBase = this.solicitudRepository.create({
            Tipo_Entidad: 2, // Jurídica
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 1, // Afiliación
        });
        const solicitudGuardada = await this.solicitudRepository.save(solicitudBase);

        // 2. Crear registro en tabla intermedia SolicitudJuridica
        const solicitudJuridica = this.solicitudJuridicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Tipo_Entidad: 2, // Jurídica
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 1,
            Cedula_Juridica: dto.Cedula_Juridica,
            Razon_Social: dto.Razon_Social,
        });
        await this.solicitudJuridicaRepository.save(solicitudJuridica);

        // 3. Crear registro en tabla específica SolicitudAfiliacionJuridica
        const solicitudAfiliacion = this.solicitudAfiliacionRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Tipo_Entidad: 2, // Jurídica
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 1,
            Cedula_Juridica: dto.Cedula_Juridica,
            Razon_Social: dto.Razon_Social,
            Direccion_Exacta: dto.Direccion_Exacta,
            Planos_Terreno: planoRes?.url || '',
            Escritura_Terreno: escrituraRes?.url || '',
        });
        const solicitudFinal = await this.solicitudAfiliacionRepository.save(solicitudAfiliacion);

        await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Afiliación', razonSocial);
        return solicitudFinal;
    }

    async createSolicitudDesconexion(dto: CreateSolicitudDesconexionJuridicaDto, files: any) {
        const solicitudActiva = await this.validationsService.validarSolicitudesJuridicasActivas(dto.Cedula_Juridica);
        if (solicitudActiva) throw new BadRequestException(solicitudActiva);

        // Validación específica para desconexión: SÍ debe existir un afiliado jurídico
        const afiliadoExistente = await this.validationsService.validarExistenciaAfiliadoJuridico(dto.Cedula_Juridica);
        if (!afiliadoExistente) throw new BadRequestException(`No existe un afiliado jurídico con la cédula ${dto.Cedula_Juridica}`);

        dto.Razon_Social = dto.Razon_Social.trim()[0].toUpperCase() + dto.Razon_Social.trim().slice(1).toLowerCase();

        const planoFile = files?.Planos_Terreno?.[0];
        const escrituraFile = files?.Escritura_Terreno?.[0];
        const razonSocial = dto.Razon_Social;

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Desconexion', 'Juridicas', dto.Cedula_Juridica, razonSocial) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Desconexion', 'Juridicas', dto.Cedula_Juridica, razonSocial) : null;

        // 1. Crear registro en tabla padre Solicitud
        const solicitudBase = this.solicitudRepository.create({
            Tipo_Entidad: 2, // Jurídica
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 2, // Desconexión
        });
        const solicitudGuardada = await this.solicitudRepository.save(solicitudBase);

        // 2. Crear registro en tabla intermedia SolicitudJuridica
        const solicitudJuridica = this.solicitudJuridicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Tipo_Entidad: 2, // Jurídica
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 2,
            Cedula_Juridica: dto.Cedula_Juridica,
            Razon_Social: dto.Razon_Social,
        });
        await this.solicitudJuridicaRepository.save(solicitudJuridica);

        // 3. Crear registro en tabla específica SolicitudDesconexionJuridica
        const solicitudDesconexion = this.solicitudDesconexionRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Tipo_Entidad: 2, // Jurídica
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 2,
            Cedula_Juridica: dto.Cedula_Juridica,
            Razon_Social: dto.Razon_Social,
            Direccion_Exacta: dto.Direccion_Exacta,
            Motivo_Solicitud: dto.Motivo_Solicitud,
            Planos_Terreno: planoRes?.url || '',
            Escritura_Terreno: escrituraRes?.url || '',
        });
        const solicitudFinal = await this.solicitudDesconexionRepository.save(solicitudDesconexion);

        await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Desconexión', razonSocial);
        return solicitudFinal;
    }

    async createSolicitudCambioMedidor(dto: CreateSolicitudCambioMedidorJuridicaDto) {
        const solicitudActiva = await this.validationsService.validarSolicitudesJuridicasActivas(dto.Cedula_Juridica);
        if (solicitudActiva) throw new BadRequestException(solicitudActiva);

        // Validación específica para cambio medidor: SÍ debe existir un afiliado jurídico
        const afiliadoExistente = await this.validationsService.validarExistenciaAfiliadoJuridico(dto.Cedula_Juridica);
        if (!afiliadoExistente) throw new BadRequestException(`No existe un afiliado jurídico con la cédula ${dto.Cedula_Juridica}`);

        dto.Razon_Social = dto.Razon_Social.trim()[0].toUpperCase() + dto.Razon_Social.trim().slice(1).toLowerCase();

        const razonSocial = dto.Razon_Social;

        // 1. Crear registro en tabla padre Solicitud
        const solicitudBase = this.solicitudRepository.create({
            Tipo_Entidad: 2, // Jurídica
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 3, // Cambio de Medidor
        });
        const solicitudGuardada = await this.solicitudRepository.save(solicitudBase);

        // 2. Crear registro en tabla intermedia SolicitudJuridica
        const solicitudJuridica = this.solicitudJuridicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Tipo_Entidad: 2, // Jurídica
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 3,
            Cedula_Juridica: dto.Cedula_Juridica,
            Razon_Social: dto.Razon_Social,
        });
        await this.solicitudJuridicaRepository.save(solicitudJuridica);

        // 3. Crear registro en tabla específica SolicitudCambioMedidorJuridica
        const solicitudCambioMedidor = this.solicitudCambioMedidorRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Tipo_Entidad: 2, // Jurídica
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 3,
            Cedula_Juridica: dto.Cedula_Juridica,
            Razon_Social: dto.Razon_Social,
            Direccion_Exacta: dto.Direccion_Exacta,
            Motivo_Solicitud: dto.Motivo_Solicitud,
            Numero_Medidor_Anterior: dto.Numero_Medidor_Anterior,
        });
        const solicitudFinal = await this.solicitudCambioMedidorRepository.save(solicitudCambioMedidor);

        await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Cambio de Medidor', razonSocial);
        return solicitudFinal;
    }

    async createSolicitudAsociado(dto: CreateSolicitudAsociadoJuridicaDto) {
        const solicitudActiva = await this.validationsService.validarSolicitudesJuridicasActivas(dto.Cedula_Juridica);
        if (solicitudActiva) throw new BadRequestException(solicitudActiva);

        // Validación específica para asociado: SÍ debe existir un afiliado jurídico
        const afiliadoExistente = await this.validationsService.validarExistenciaAfiliadoJuridico(dto.Cedula_Juridica);
        if (!afiliadoExistente) throw new BadRequestException(`No existe un afiliado jurídico con la cédula ${dto.Cedula_Juridica}. No se puede crear la solicitud de asociado.`);

        dto.Razon_Social = dto.Razon_Social.trim()[0].toUpperCase() + dto.Razon_Social.trim().slice(1).toLowerCase();

        const razonSocial = dto.Razon_Social;

        // 1. Crear registro en tabla padre Solicitud
        const solicitudBase = this.solicitudRepository.create({
            Tipo_Entidad: 2, // Jurídica
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 4, // Asociado
        });
        const solicitudGuardada = await this.solicitudRepository.save(solicitudBase);

        // 2. Crear registro en tabla intermedia SolicitudJuridica
        const solicitudJuridica = this.solicitudJuridicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Tipo_Entidad: 2, // Jurídica
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 4,
            Cedula_Juridica: dto.Cedula_Juridica,
            Razon_Social: dto.Razon_Social,
        });
        await this.solicitudJuridicaRepository.save(solicitudJuridica);

        // 3. Crear registro en tabla específica SolicitudAsociadoJuridica
        const solicitudAsociado = this.solicitudAsociadoRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Tipo_Entidad: 2, // Jurídica
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 4,
            Cedula_Juridica: dto.Cedula_Juridica,
            Razon_Social: dto.Razon_Social,
            Motivo_Solicitud: dto.Motivo_Solicitud,
        });
        const solicitudFinal = await this.solicitudAsociadoRepository.save(solicitudAsociado);

        await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Asociación', razonSocial);
        return solicitudFinal;
    }



    // MÉTODOS PARA ACTUALIZAR SOLICITUDES JURÍDICAS
    async updateSolicitudAfiliacion(idSolicitud: number, dto: UpdateSolicitudAfiliacionJuridicaDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar la solicitud.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        // 1. Verificar que la solicitud existe en la tabla padre
        const solicitudBase = await this.solicitudRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudBase) throw new BadRequestException(`Solicitud con id ${idSolicitud} no encontrada`);

        // 2. Verificar que es una solicitud de afiliación jurídica (Id_Tipo_Solicitud = 1, Tipo_Entidad = 2)
        if (solicitudBase.Id_Tipo_Solicitud !== 1) {
            throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud de afiliación`);
        }
        if (solicitudBase.Tipo_Entidad !== 2) {
            throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud jurídica`);
        }

        // 3. Buscar la solicitud de afiliación jurídica específica
        const solicitudAfiliacion = await this.solicitudAfiliacionRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudAfiliacion) throw new BadRequestException(`Solicitud de afiliación jurídica con id ${idSolicitud} no encontrada`);

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Razon_Social: solicitudAfiliacion.Razon_Social,
            Numero_Telefono: solicitudAfiliacion.Numero_Telefono,
            Correo: solicitudAfiliacion.Correo,
            Direccion_Exacta: solicitudAfiliacion.Direccion_Exacta
        };

        // 4. Actualizar campos específicos de SolicitudAfiliacionJuridica
        solicitudAfiliacion.Razon_Social = dto.Razon_Social ?? solicitudAfiliacion.Razon_Social;
        solicitudAfiliacion.Numero_Telefono = dto.Numero_Telefono ?? solicitudAfiliacion.Numero_Telefono;
        solicitudAfiliacion.Correo = dto.Correo ?? solicitudAfiliacion.Correo;
        solicitudAfiliacion.Direccion_Exacta = dto.Direccion_Exacta ?? solicitudAfiliacion.Direccion_Exacta;

        // 5. Guardar cambios
        const resultado = await this.solicitudAfiliacionRepository.save(solicitudAfiliacion);

        // 6. Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Razon_Social: solicitudAfiliacion.Razon_Social,
                Numero_Telefono: solicitudAfiliacion.Numero_Telefono,
                Correo: solicitudAfiliacion.Correo,
                Direccion_Exacta: solicitudAfiliacion.Direccion_Exacta
            });
        } catch (error) {
            console.error('Error al registrar actualización de solicitud en auditoría:', error);
        }

        return {
            ...resultado,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
        }
    }

    async updateSolicitudDesconexion(idSolicitud: number, dto: UpdateSolicitudDesconexionJuridicaDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar la solicitud.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        // 1. Verificar que la solicitud existe en la tabla padre
        const solicitudBase = await this.solicitudRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudBase) throw new BadRequestException(`Solicitud con id ${idSolicitud} no encontrada`);

        // 2. Verificar que es una solicitud de desconexión jurídica (Id_Tipo_Solicitud = 2, Tipo_Entidad = 2)
        if (solicitudBase.Id_Tipo_Solicitud !== 2) {
            throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud de desconexión`);
        }
        if (solicitudBase.Tipo_Entidad !== 2) {
            throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud jurídica`);
        }

        // 3. Buscar la solicitud de desconexión jurídica específica
        const solicitudDesconexion = await this.solicitudDesconexionRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudDesconexion) throw new BadRequestException(`Solicitud de desconexión jurídica con id ${idSolicitud} no encontrada`);

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Razon_Social: solicitudDesconexion.Razon_Social,
            Numero_Telefono: solicitudDesconexion.Numero_Telefono,
            Correo: solicitudDesconexion.Correo,
            Direccion_Exacta: solicitudDesconexion.Direccion_Exacta,
            Motivo_Solicitud: solicitudDesconexion.Motivo_Solicitud
        };

        // 4. Actualizar campos específicos de SolicitudDesconexionJuridica
        solicitudDesconexion.Razon_Social = dto.Razon_Social ?? solicitudDesconexion.Razon_Social;
        solicitudDesconexion.Numero_Telefono = dto.Numero_Telefono ?? solicitudDesconexion.Numero_Telefono;
        solicitudDesconexion.Correo = dto.Correo ?? solicitudDesconexion.Correo;
        solicitudDesconexion.Direccion_Exacta = dto.Direccion_Exacta ?? solicitudDesconexion.Direccion_Exacta;
        solicitudDesconexion.Motivo_Solicitud = dto.Motivo_Solicitud ?? solicitudDesconexion.Motivo_Solicitud;

        // 5. Guardar cambios
        const resultado = await this.solicitudDesconexionRepository.save(solicitudDesconexion);

        // 6. Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Razon_Social: solicitudDesconexion.Razon_Social,
                Numero_Telefono: solicitudDesconexion.Numero_Telefono,
                Correo: solicitudDesconexion.Correo,
                Direccion_Exacta: solicitudDesconexion.Direccion_Exacta,
                Motivo_Solicitud: solicitudDesconexion.Motivo_Solicitud
            });
        } catch (error) {
            console.error('Error al registrar actualización de solicitud de desconexión en auditoría:', error);
        }

        return {
            ...resultado,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
        };
    }

    async updateSolicitudCambioMedidor(idSolicitud: number, dto: UpdateSolicitudCambioMedidorJuridicaDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar la solicitud.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        // 1. Verificar que la solicitud existe en la tabla padre
        const solicitudBase = await this.solicitudRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudBase) throw new BadRequestException(`Solicitud con id ${idSolicitud} no encontrada`);

        // 2. Verificar que es una solicitud de cambio de medidor jurídica (Id_Tipo_Solicitud = 3, Tipo_Entidad = 2)
        if (solicitudBase.Id_Tipo_Solicitud !== 3) {
            throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud de cambio de medidor`);
        }
        if (solicitudBase.Tipo_Entidad !== 2) {
            throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud jurídica`);
        }

        // 3. Buscar la solicitud de cambio de medidor jurídica específica
        const solicitudCambioMedidor = await this.solicitudCambioMedidorRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudCambioMedidor) throw new BadRequestException(`Solicitud de cambio de medidor jurídica con id ${idSolicitud} no encontrada`);

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Razon_Social: solicitudCambioMedidor.Razon_Social,
            Numero_Telefono: solicitudCambioMedidor.Numero_Telefono,
            Correo: solicitudCambioMedidor.Correo,
            Direccion_Exacta: solicitudCambioMedidor.Direccion_Exacta,
            Motivo_Solicitud: solicitudCambioMedidor.Motivo_Solicitud,
            Numero_Medidor_Anterior: solicitudCambioMedidor.Numero_Medidor_Anterior
        };

        // 4. Actualizar campos específicos de SolicitudCambioMedidorJuridica
        solicitudCambioMedidor.Razon_Social = dto.Razon_Social ?? solicitudCambioMedidor.Razon_Social;
        solicitudCambioMedidor.Numero_Telefono = dto.Numero_Telefono ?? solicitudCambioMedidor.Numero_Telefono;
        solicitudCambioMedidor.Correo = dto.Correo ?? solicitudCambioMedidor.Correo;
        solicitudCambioMedidor.Direccion_Exacta = dto.Direccion_Exacta ?? solicitudCambioMedidor.Direccion_Exacta;
        solicitudCambioMedidor.Motivo_Solicitud = dto.Motivo_Solicitud ?? solicitudCambioMedidor.Motivo_Solicitud;
        solicitudCambioMedidor.Numero_Medidor_Anterior = dto.Numero_Medidor_Anterior ?? solicitudCambioMedidor.Numero_Medidor_Anterior;

        // 5. Guardar cambios
        const resultado = await this.solicitudCambioMedidorRepository.save(solicitudCambioMedidor);

        // 6. Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Razon_Social: solicitudCambioMedidor.Razon_Social,
                Numero_Telefono: solicitudCambioMedidor.Numero_Telefono,
                Correo: solicitudCambioMedidor.Correo,
                Direccion_Exacta: solicitudCambioMedidor.Direccion_Exacta,
                Motivo_Solicitud: solicitudCambioMedidor.Motivo_Solicitud,
                Numero_Medidor_Anterior: solicitudCambioMedidor.Numero_Medidor_Anterior
            });
        } catch (error) {
            console.error('Error al registrar actualización de solicitud de cambio de medidor en auditoría:', error);
        }

        return {
            ...resultado,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
        };
    }

    async updateSolicitudAsociado(idSolicitud: number, dto: UpdateSolicitudAsociadoJuridicaDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar la solicitud.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        // 1. Verificar que la solicitud existe en la tabla padre
        const solicitudBase = await this.solicitudRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudBase) throw new BadRequestException(`Solicitud con id ${idSolicitud} no encontrada`);

        // 2. Verificar que es una solicitud de asociado jurídica (Id_Tipo_Solicitud = 4, Tipo_Entidad = 2)
        if (solicitudBase.Id_Tipo_Solicitud !== 4) {
            throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud de asociado`);
        }
        if (solicitudBase.Tipo_Entidad !== 2) {
            throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud jurídica`);
        }

        // 3. Buscar la solicitud de asociado jurídica específica
        const solicitudAsociado = await this.solicitudAsociadoRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudAsociado) throw new BadRequestException(`Solicitud de asociado jurídica con id ${idSolicitud} no encontrada`);

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Razon_Social: solicitudAsociado.Razon_Social,
            Numero_Telefono: solicitudAsociado.Numero_Telefono,
            Correo: solicitudAsociado.Correo,
            Motivo_Solicitud: solicitudAsociado.Motivo_Solicitud
        };

        // 4. Actualizar campos específicos de SolicitudAsociadoJuridica
        solicitudAsociado.Razon_Social = dto.Razon_Social ?? solicitudAsociado.Razon_Social;
        solicitudAsociado.Numero_Telefono = dto.Numero_Telefono ?? solicitudAsociado.Numero_Telefono;
        solicitudAsociado.Correo = dto.Correo ?? solicitudAsociado.Correo;
        solicitudAsociado.Motivo_Solicitud = dto.Motivo_Solicitud ?? solicitudAsociado.Motivo_Solicitud;

        // 5. Guardar cambios
        const resultado = await this.solicitudAsociadoRepository.save(solicitudAsociado);

        // 6. Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Razon_Social: solicitudAsociado.Razon_Social,
                Numero_Telefono: solicitudAsociado.Numero_Telefono,
                Correo: solicitudAsociado.Correo,
                Motivo_Solicitud: solicitudAsociado.Motivo_Solicitud
            });
        } catch (error) {
            console.error('Error al registrar actualización de solicitud de asociado en auditoría:', error);
        }

        return {
            ...resultado,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
        };
    }


    // MÉTODOS PARA CAMBIO DE ESTADO DE SOLICITUDES JURÍDICAS
    async updateEstadoSolicitudAfiliacion(idSolicitud: number, idNuevoEstado: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar el estado de la solicitud de afiliación.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        const solicitudAfiliacion = await this.solicitudAfiliacionRepository.findOne({ where: { Id_Solicitud: idSolicitud }, relations: ['Estado'] });
        if (!solicitudAfiliacion) throw new BadRequestException(`Solicitud de afiliación con id ${idSolicitud} no encontrada`);

        const nuevoEstado = await this.estadoSolicitudRepo.findOne({ where: { Id_Estado_Solicitud: idNuevoEstado } });
        if (!nuevoEstado) throw new BadRequestException(`Estado con id ${idNuevoEstado} no encontrado`);

        const razonSocial = solicitudAfiliacion.Razon_Social;

        // Guardar estado anterior para auditoría
        const datosAnteriores = {
            Cedula_Juridica: solicitudAfiliacion.Cedula_Juridica,
            Razon_Social: razonSocial,
            Estado_Anterior: solicitudAfiliacion.Estado
        }

        // Estado 2 = En revisión
        if (idNuevoEstado === 2) await this.emailService.enviarEmailActualizacionEstado(solicitudAfiliacion.Correo, 'Afiliación', 'En revisión', razonSocial);

        // Estado 3 = Aprobada y en espera / Pendiente de instalar medidor
        if (idNuevoEstado === 3) await this.emailService.enviarEmailActualizacionEstado(solicitudAfiliacion.Correo, 'Afiliación', 'Aprobada y en espera', razonSocial);

        // Estado 4 = Completada
        if (idNuevoEstado === 4) {
            await this.afiliadosService.createAfiliadoJuridicoFromSolicitud(solicitudAfiliacion);

            await this.emailService.enviarEmailActualizacionEstado(solicitudAfiliacion.Correo, 'Afiliación', 'Completada', razonSocial);
            console.log(`Estado de solicitud de afiliación ${idSolicitud} cambiado a 'Completada'`);
        }

        // Estado 5 = Rechazada
        if (idNuevoEstado === 5) console.log(`Estado de solicitud de afiliación ${idSolicitud} cambiado a 'Rechazada'`);

        solicitudAfiliacion.Estado = nuevoEstado;
        const resultado = await this.solicitudAfiliacionRepository.save(solicitudAfiliacion);

        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Cedula_Juridica: solicitudAfiliacion.Cedula_Juridica,
                Razon_Social: razonSocial,
                Estado_Nuevo: nuevoEstado.Nombre_Estado
            });
        } catch (error) {
            console.error('Error al actualizar estado de solicitud de afiliación:', error);
        }

        return {
            Solicitud: resultado,
            Mensaje: `Estado de solicitud de afiliación cambiado a '${nuevoEstado.Nombre_Estado}' exitosamente`
        };
    }

    async updateEstadoSolicitudDesconexion(idSolicitud: number, idNuevoEstado: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar el estado de la solicitud de desconexión.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        const solicitudDesconexion = await this.solicitudDesconexionRepository.findOne({ where: { Id_Solicitud: idSolicitud }, relations: ['Estado'] });
        if (!solicitudDesconexion) throw new BadRequestException(`Solicitud de desconexión con id ${idSolicitud} no encontrada`);

        const nuevoEstado = await this.estadoSolicitudRepo.findOne({ where: { Id_Estado_Solicitud: idNuevoEstado } });
        if (!nuevoEstado) throw new BadRequestException(`Estado con id ${idNuevoEstado} no encontrado`);

        const razonSocial = solicitudDesconexion.Razon_Social;

        // Guardar estado anterior para auditoría
        const datosAnteriores = {
            Cedula_Juridica: solicitudDesconexion.Cedula_Juridica,
            Razon_Social: razonSocial,
            Estado_Anterior: solicitudDesconexion.Estado
        };

        // Estado 2 = En revisión
        if (idNuevoEstado === 2) await this.emailService.enviarEmailActualizacionEstado(solicitudDesconexion.Correo, 'Desconexión', 'En revisión', razonSocial);

        // Estado 3 = Aprobada y en espera
        if (idNuevoEstado === 3) await this.emailService.enviarEmailActualizacionEstado(solicitudDesconexion.Correo, 'Desconexión', 'Aprobada y en espera', razonSocial);

        // Estado 4 = Completada
        if (idNuevoEstado === 4) {
            await this.emailService.enviarEmailActualizacionEstado(solicitudDesconexion.Correo, 'Desconexión', 'Completada', razonSocial);
            console.log(`Estado de solicitud de desconexión ${idSolicitud} cambiado a 'Completada'`);

            // Actualizar estado del afiliado a inactivo
            const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: solicitudDesconexion.Cedula_Juridica } });
            if (afiliado) {
                const estadoInactivo = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 2 } }); // 2 = Inactivo
                if (estadoInactivo) {
                    afiliado.Estado = estadoInactivo;
                    await this.afiliadoJuridicoRepository.save(afiliado);
                }
            } else if (!afiliado) {
                console.warn(`Afiliado jurídico con cédula ${solicitudDesconexion.Cedula_Juridica} no encontrado para actualizar su estado a inactivo.`);
            }
        }

        // Estado 5 = Rechazada
        if (idNuevoEstado === 5) await this.emailService.enviarEmailActualizacionEstado(solicitudDesconexion.Correo, 'Desconexión', 'Rechazada', razonSocial);

        solicitudDesconexion.Estado = nuevoEstado;
        const resultado = await this.solicitudDesconexionRepository.save(solicitudDesconexion);

        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Cedula_Juridica: solicitudDesconexion.Cedula_Juridica,
                Razon_Social: razonSocial,
                Estado_Nuevo: nuevoEstado.Nombre_Estado
            });
        } catch (error) {
            console.error(`Error al actualizar estado de solicitud de desconexión ${idSolicitud}:`, error);
        }

        return {
            Solicitud: resultado,
            Mensaje: `Estado de solicitud de desconexión cambiado a '${nuevoEstado.Nombre_Estado}' exitosamente`
        };
    }

    async updateEstadoSolicitudCambioMedidor(idSolicitud: number, idNuevoEstado: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar el estado de la solicitud de cambio de medidor.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        const solicitudCambioMedidor = await this.solicitudCambioMedidorRepository.findOne({where: { Id_Solicitud: idSolicitud }, relations: ['Estado']});
        if (!solicitudCambioMedidor) throw new BadRequestException(`Solicitud de cambio de medidor con id ${idSolicitud} no encontrada`);

        const nuevoEstado = await this.estadoSolicitudRepo.findOne({where: { Id_Estado_Solicitud: idNuevoEstado }});
        if (!nuevoEstado) throw new BadRequestException(`Estado con id ${idNuevoEstado} no encontrado`);

        const razonSocial = solicitudCambioMedidor.Razon_Social;

        // Guardar estado anterior para auditoría
        const datosAnteriores = {
            Cedula_Juridica: solicitudCambioMedidor.Cedula_Juridica,
            Razon_Social: razonSocial,
            Estado_Anterior: solicitudCambioMedidor.Estado
        }

        // Estado 2 = En revisión
        if (idNuevoEstado === 2) await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'En revisión', razonSocial);

        // Estado 3 = Aprobada y en espera
        if (idNuevoEstado === 3) await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'Aprobada y en espera', razonSocial);

        // Estado 4 = Completada
        if (idNuevoEstado === 4) await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'Completada', razonSocial);

        // Estado 5 = Rechazada
        if (idNuevoEstado === 5) await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'Rechazada', razonSocial);

        solicitudCambioMedidor.Estado = nuevoEstado;
        const resultado = await this.solicitudCambioMedidorRepository.save(solicitudCambioMedidor);

        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Cedula_Juridica: solicitudCambioMedidor.Cedula_Juridica,
                Razon_Social: razonSocial,
                Estado_Nuevo: nuevoEstado.Nombre_Estado
            });
        } catch (error) {
            console.error('Error al actualizar estado de solicitud de cambio de medidor:', error);
        }

        return {
            Solicitud: resultado,
            Mensaje: `Estado de solicitud de cambio de medidor cambiado a '${nuevoEstado.Nombre_Estado}' exitosamente`
        };
    }

    async updateEstadoSolicitudAsociado(idSolicitud: number, idNuevoEstado: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar el estado de la solicitud de asociado.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        const solicitudAsociado = await this.solicitudAsociadoRepository.findOne({ where: { Id_Solicitud: idSolicitud }, relations: ['Estado'] });
        if (!solicitudAsociado) throw new BadRequestException(`Solicitud de asociado con id ${idSolicitud} no encontrada`);

        const nuevoEstado = await this.estadoSolicitudRepo.findOne({ where: { Id_Estado_Solicitud: idNuevoEstado } });
        if (!nuevoEstado) throw new BadRequestException(`Estado con id ${idNuevoEstado} no encontrado`);

        const razonSocial = solicitudAsociado.Razon_Social;

        // Guardar estado anterior para auditoría
        const datosAnteriores = {
            Cedula_Juridica: solicitudAsociado.Cedula_Juridica,
            Razon_Social: razonSocial,
            Estado_Anterior: solicitudAsociado.Estado
        };

        // Estado 2 = En revisión
        if (idNuevoEstado === 2) await this.emailService.enviarEmailActualizacionEstado(solicitudAsociado.Correo, 'Asociado', 'En revisión', razonSocial);

        // Estado 3 = Aprobada y en espera
        if (idNuevoEstado === 3) console.log(`Estado de solicitud de asociado ${idSolicitud} cambiado a 'Aprobada'`);

        // Estado 4 = Completada
        if (idNuevoEstado === 4) {
            await this.emailService.enviarEmailActualizacionEstado(solicitudAsociado.Correo, 'Asociado', 'Completada', razonSocial);

            // Cambiar afiliado de abonado a asociado
            await this.afiliadosService.cambiarAbonadoAAsociadoJuridico(solicitudAsociado.Cedula_Juridica, idUsuario);
        }

        // Estado 5 = Rechazada
        if (idNuevoEstado === 5) await this.emailService.enviarEmailActualizacionEstado(solicitudAsociado.Correo, 'Asociado', 'Rechazada', razonSocial);

        solicitudAsociado.Estado = nuevoEstado;
        const resultado = await this.solicitudAsociadoRepository.save(solicitudAsociado);

        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Cedula_Juridica: solicitudAsociado.Cedula_Juridica,
                Razon_Social: razonSocial,
                Estado_Nuevo: nuevoEstado.Nombre_Estado
            });
        } catch (error) {
            console.error('Error al actualizar estado de solicitud de asociado:', error);
        }

        return {
            Solicitud: resultado,
            Mensaje: `Estado de solicitud de asociado cambiado a '${nuevoEstado.Nombre_Estado}' exitosamente`
        };
    }
}