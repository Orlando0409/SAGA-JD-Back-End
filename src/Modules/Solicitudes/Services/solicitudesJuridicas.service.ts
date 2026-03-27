import { Solicitud, SolicitudAfiliacionJuridica, SolicitudAgregarMedidorJuridica, SolicitudAsociadoJuridica, SolicitudCambioMedidorJuridica, SolicitudDesconexionJuridica, SolicitudJuridica } from "../SolicitudEntities/Solicitud.Entity";
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
import { UpdateSolicitudAfiliacionJuridicaDto, UpdateSolicitudAgregarMedidorJuridicaDto, UpdateSolicitudAsociadoJuridicaDto, UpdateSolicitudCambioMedidorJuridicaDto, UpdateSolicitudDesconexionJuridicaDto } from "../SolicitudDTO's/UpdateSolicitudJuridica.dto";
import { CreateSolicitudAfiliacionJuridicaDto, CreateSolicitudAgregarMedidorJuridicaDto, CreateSolicitudAsociadoJuridicaDto, CreateSolicitudCambioMedidorJuridicaDto, CreateSolicitudDesconexionJuridicaDto } from "../SolicitudDTO's/CreateSolicitudJuridica.dto";
import { AfiliadoJuridico } from "src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity";
import { EstadoAfiliado } from "src/Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity";
import { Medidor } from "src/Modules/Inventario/InventarioEntities/Medidor.Entity";
import { EstadoMedidor } from "src/Modules/Inventario/InventarioEntities/EstadoMedidor.Entity";

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

        @InjectRepository(SolicitudAgregarMedidorJuridica)
        private readonly solicitudAgregarMedidorRepository: Repository<SolicitudAgregarMedidorJuridica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepo: Repository<EstadoSolicitud>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        @InjectRepository(AfiliadoJuridico)
        private readonly afiliadoJuridicoRepository: Repository<AfiliadoJuridico>,

        @InjectRepository(EstadoAfiliado)
        private readonly estadoAfiliadoRepository: Repository<EstadoAfiliado>,

        @InjectRepository(Medidor)
        private readonly medidorRepository: Repository<Medidor>,

        @InjectRepository(EstadoMedidor)
        private readonly estadoMedidorRepository: Repository<EstadoMedidor>,

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
            "Agregar Medidor": await this.getAllSolicitudesAgregarMedidor(),
        };
    }

    async getAllSolicitudesAfiliacion() {
        return this.solicitudAfiliacionRepository.find({ relations: ['Estado'] });
    }

    async getAllSolicitudesDesconexion() {
        return this.solicitudDesconexionRepository.find({ relations: ['Estado'] });
    }

    async getAllSolicitudesCambioMedidor() {
        const solicitudes = await this.solicitudCambioMedidorRepository.find({
            relations: ['Estado', 'Medidor', 'Medidor.Estado_Medidor', 'Nuevo_Medidor', 'Nuevo_Medidor.Estado_Medidor']
        });

        return solicitudes.map(item => ({
            ...item,
            Numero_Medidor: item.Medidor?.Numero_Medidor ?? null,
            Medidor_Info: item.Medidor ? {
                Id_Medidor: item.Medidor.Id_Medidor,
                Numero_Medidor: item.Medidor.Numero_Medidor,
                Estado: item.Medidor.Estado_Medidor?.Nombre_Estado_Medidor ?? null
            } : null,
            Nuevo_Medidor_Info: item.Nuevo_Medidor ? {
                Id_Medidor: item.Nuevo_Medidor.Id_Medidor,
                Numero_Medidor: item.Nuevo_Medidor.Numero_Medidor,
                Estado: item.Nuevo_Medidor.Estado_Medidor?.Nombre_Estado_Medidor ?? null
            } : null
        }));
    }

    async getSolicitudCambioMedidorById(idSolicitud: number) {
        const solicitud = await this.solicitudCambioMedidorRepository.findOne({
            where: { Id_Solicitud: idSolicitud },
            relations: ['Estado', 'Medidor', 'Medidor.Estado_Medidor', 'Nuevo_Medidor', 'Nuevo_Medidor.Estado_Medidor']
        });
        if (!solicitud) throw new BadRequestException(`Solicitud de cambio de medidor jurídica con id ${idSolicitud} no encontrada`);
        return {
            ...solicitud,
            Numero_Medidor: solicitud.Medidor?.Numero_Medidor ?? null,
            Medidor_Info: solicitud.Medidor ? {
                Id_Medidor: solicitud.Medidor.Id_Medidor,
                Numero_Medidor: solicitud.Medidor.Numero_Medidor,
                Estado: solicitud.Medidor.Estado_Medidor?.Nombre_Estado_Medidor ?? null
            } : null,
            Nuevo_Medidor_Info: solicitud.Nuevo_Medidor ? {
                Id_Medidor: solicitud.Nuevo_Medidor.Id_Medidor,
                Numero_Medidor: solicitud.Nuevo_Medidor.Numero_Medidor,
                Estado: solicitud.Nuevo_Medidor.Estado_Medidor?.Nombre_Estado_Medidor ?? null
            } : null
        };
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

        const planoFile = files?.Planos_Terreno?.[0];
        const escrituraFile = files?.Certificacion_Literal?.[0];
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
            Certificacion_Literal: escrituraRes?.url || '',
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

        const planoFile = files?.Planos_Terreno?.[0];
        const escrituraFile = files?.Certificacion_Literal?.[0];
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
            Certificacion_Literal: escrituraRes?.url || '',
            Id_Medidor: dto.Id_Medidor,
        });
        const solicitudFinal = await this.solicitudDesconexionRepository.save(solicitudDesconexion);

        await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Desconexión', razonSocial);
        return solicitudFinal;
    }

    async createSolicitudCambioMedidor(
        dto: CreateSolicitudCambioMedidorJuridicaDto,
        files: { Planos_Terreno?: Express.Multer.File[]; Certificacion_Literal?: Express.Multer.File[] }
    ) {
        if (!files?.Planos_Terreno?.[0]) throw new BadRequestException('El archivo Planos_Terreno es obligatorio para crear una solicitud de cambio de medidor');
        if (!files?.Certificacion_Literal?.[0]) throw new BadRequestException('El archivo Certificacion_Literal es obligatorio para crear una solicitud de cambio de medidor');

        const solicitudActiva = await this.validationsService.validarSolicitudesJuridicasActivas(dto.Cedula_Juridica);
        if (solicitudActiva) throw new BadRequestException(solicitudActiva);

        const afiliadoExistente = await this.validationsService.validarExistenciaAfiliadoJuridico(dto.Cedula_Juridica);
        if (!afiliadoExistente) throw new BadRequestException(`No existe un afiliado jurídico con la cédula ${dto.Cedula_Juridica}`);

        const razonSocial = dto.Razon_Social;

        const planoRes = await this.dropboxFilesService.uploadFile(files.Planos_Terreno[0], 'Solicitudes-CambioMedidor', 'Juridicas', dto.Cedula_Juridica, razonSocial);
        const escrituraRes = await this.dropboxFilesService.uploadFile(files.Certificacion_Literal[0], 'Solicitudes-CambioMedidor', 'Juridicas', dto.Cedula_Juridica, razonSocial);

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
            Tipo_Entidad: 2,
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 3,
            Cedula_Juridica: dto.Cedula_Juridica,
            Razon_Social: dto.Razon_Social,
            Direccion_Exacta: dto.Direccion_Exacta,
            Motivo_Solicitud: dto.Motivo_Solicitud,
            Id_Medidor: dto.Id_Medidor,
            Planos_Terreno: planoRes.url,
            Certificacion_Literal: escrituraRes.url,
        });
        const solicitudFinal = await this.solicitudCambioMedidorRepository.save(solicitudCambioMedidor);

        await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Cambio de Medidor', razonSocial);
        return solicitudFinal;
    }

    async createSolicitudAsociado(dto: CreateSolicitudAsociadoJuridicaDto, files: { Planos_Terreno?: Express.Multer.File[]; Escrituras_Terreno?: Express.Multer.File[] }) {
        const solicitudActiva = await this.validationsService.validarSolicitudesJuridicasActivas(dto.Cedula_Juridica);
        if (solicitudActiva) throw new BadRequestException(solicitudActiva);

        // Validación específica para asociado: SÍ debe existir un afiliado jurídico
        const afiliadoExistente = await this.validationsService.validarExistenciaAfiliadoJuridico(dto.Cedula_Juridica);
        if (!afiliadoExistente) throw new BadRequestException(`No existe un afiliado jurídico con la cédula ${dto.Cedula_Juridica}. No se puede crear la solicitud de asociado.`);

        const razonSocial = dto.Razon_Social;
        const planoFile = files?.Planos_Terreno?.[0];
        const escrituraFile = files?.Escrituras_Terreno?.[0];
        if (!planoFile) throw new BadRequestException('El archivo Planos_Terreno es obligatorio para la solicitud de asociado');
        if (!escrituraFile) throw new BadRequestException('El archivo Escrituras_Terreno es obligatorio para la solicitud de asociado');

        const planoRes = await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Asociado', 'Juridicas', dto.Cedula_Juridica, razonSocial);
        const escrituraRes = await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Asociado', 'Juridicas', dto.Cedula_Juridica, razonSocial);

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
            Planos_Terreno: planoRes.url,
            Escrituras_Terreno: escrituraRes.url,
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
            Motivo_Solicitud: solicitudDesconexion.Motivo_Solicitud,
            Id_Medidor: solicitudDesconexion.Id_Medidor
        };

        // 4. Actualizar campos específicos de SolicitudDesconexionJuridica
        solicitudDesconexion.Razon_Social = dto.Razon_Social ?? solicitudDesconexion.Razon_Social;
        solicitudDesconexion.Numero_Telefono = dto.Numero_Telefono ?? solicitudDesconexion.Numero_Telefono;
        solicitudDesconexion.Correo = dto.Correo ?? solicitudDesconexion.Correo;
        solicitudDesconexion.Direccion_Exacta = dto.Direccion_Exacta ?? solicitudDesconexion.Direccion_Exacta;
        solicitudDesconexion.Motivo_Solicitud = dto.Motivo_Solicitud ?? solicitudDesconexion.Motivo_Solicitud;
        solicitudDesconexion.Id_Medidor = dto.Id_Medidor ?? solicitudDesconexion.Id_Medidor;

        // 5. Guardar cambios
        const resultado = await this.solicitudDesconexionRepository.save(solicitudDesconexion);

        // 6. Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Razon_Social: solicitudDesconexion.Razon_Social,
                Numero_Telefono: solicitudDesconexion.Numero_Telefono,
                Correo: solicitudDesconexion.Correo,
                Direccion_Exacta: solicitudDesconexion.Direccion_Exacta,
                Motivo_Solicitud: solicitudDesconexion.Motivo_Solicitud,
                Id_Medidor: solicitudDesconexion.Id_Medidor
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
        const solicitudCambioMedidor = await this.solicitudCambioMedidorRepository.findOne({
            where: { Id_Solicitud: idSolicitud },
            relations: ['Medidor', 'Medidor.Estado_Medidor']
        });
        if (!solicitudCambioMedidor) throw new BadRequestException(`Solicitud de cambio de medidor jurídica con id ${idSolicitud} no encontrada`);

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Razon_Social: solicitudCambioMedidor.Razon_Social,
            Numero_Telefono: solicitudCambioMedidor.Numero_Telefono,
            Correo: solicitudCambioMedidor.Correo,
            Direccion_Exacta: solicitudCambioMedidor.Direccion_Exacta,
            Motivo_Solicitud: solicitudCambioMedidor.Motivo_Solicitud,
            Id_Medidor: solicitudCambioMedidor.Id_Medidor
        };

        // 4. Actualizar campos específicos de SolicitudCambioMedidorJuridica
        solicitudCambioMedidor.Razon_Social = dto.Razon_Social ?? solicitudCambioMedidor.Razon_Social;
        solicitudCambioMedidor.Numero_Telefono = dto.Numero_Telefono ?? solicitudCambioMedidor.Numero_Telefono;
        solicitudCambioMedidor.Correo = dto.Correo ?? solicitudCambioMedidor.Correo;
        solicitudCambioMedidor.Direccion_Exacta = dto.Direccion_Exacta ?? solicitudCambioMedidor.Direccion_Exacta;
        solicitudCambioMedidor.Motivo_Solicitud = dto.Motivo_Solicitud ?? solicitudCambioMedidor.Motivo_Solicitud;
        solicitudCambioMedidor.Id_Medidor = dto.Id_Medidor ?? solicitudCambioMedidor.Id_Medidor;
        solicitudCambioMedidor.Id_Nuevo_Medidor = dto.Id_Nuevo_Medidor ?? solicitudCambioMedidor.Id_Nuevo_Medidor;

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
                Id_Medidor: solicitudCambioMedidor.Id_Medidor
            });
        } catch (error) {
            console.error('Error al registrar actualización de solicitud de cambio de medidor en auditoría:', error);
        }

        return {
            ...resultado,
            Numero_Medidor: resultado.Medidor?.Numero_Medidor ?? null,
            Medidor_Info: resultado.Medidor ? {
                Id_Medidor: resultado.Medidor.Id_Medidor,
                Numero_Medidor: resultado.Medidor.Numero_Medidor,
                Estado: resultado.Medidor.Estado_Medidor?.Nombre_Estado_Medidor ?? null
            } : null,
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

    async updateEstadoSolicitudCambioMedidor(idSolicitud: number, idNuevoEstado: number, idUsuario: number, ocupaPago?: boolean, montoCambio?: number, motivoCobro?: string) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar el estado de la solicitud de cambio de medidor.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        const solicitudCambioMedidor = await this.solicitudCambioMedidorRepository.findOne({
            where: { Id_Solicitud: idSolicitud },
            relations: ['Estado', 'Medidor', 'Medidor.Estado_Medidor']
        });
        if (!solicitudCambioMedidor) throw new BadRequestException(`Solicitud de cambio de medidor con id ${idSolicitud} no encontrada`);

        const nuevoEstado = await this.estadoSolicitudRepo.findOne({ where: { Id_Estado_Solicitud: idNuevoEstado } });
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
        if (idNuevoEstado === 3) {
             
            if (ocupaPago){
                
                if (montoCambio && motivoCobro)  await this.emailService.enviarEmailCambioMedidorAprobadaConCosto(solicitudCambioMedidor.Correo, razonSocial, montoCambio, motivoCobro);

                else throw new BadRequestException('Debe proporcionar el monto y el motivo del cambio de medidor para enviar el correo correspondiente');
            } 
        
            else await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'Aprobada y en espera', razonSocial);
        } 

        // Estado 4 = Completada
        if (idNuevoEstado === 4) {
            await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'Completada', razonSocial);

            // Cambiar estado del medidor ANTIGUO a Averiado (3)
            if (solicitudCambioMedidor.Id_Medidor) {
                const medidorAntiguo = await this.medidorRepository.findOne({ where: { Id_Medidor: solicitudCambioMedidor.Id_Medidor } });
                if (medidorAntiguo) {
                    const estadoAveriado = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor: 3 } }); // 3 = Averiado
                    if (estadoAveriado) {
                        medidorAntiguo.Estado_Medidor = estadoAveriado;
                        await this.medidorRepository.save(medidorAntiguo);
                        console.log(`Medidor antiguo ${medidorAntiguo.Numero_Medidor} cambiado a estado 'Averiado'`);
                    }
                } else {
                    console.warn(`Medidor antiguo con id ${solicitudCambioMedidor.Id_Medidor} no encontrado.`);
                }
            }

            // Asignar el NUEVO medidor al afiliado (acumulativo, no reemplaza los existentes)
            if (solicitudCambioMedidor.Id_Nuevo_Medidor) {
                const nuevoMedidor = await this.medidorRepository.findOne({
                    where: { Id_Medidor: solicitudCambioMedidor.Id_Nuevo_Medidor },
                    relations: ['Estado_Medidor']
                });
                if (nuevoMedidor) {
                    const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: solicitudCambioMedidor.Cedula_Juridica } });
                    if (afiliado) {
                        const estadoInstalado = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor: 2 } });
                        nuevoMedidor.Afiliado = afiliado;
                        nuevoMedidor.Planos_Terreno = solicitudCambioMedidor.Planos_Terreno;
                        nuevoMedidor.Certificacion_Literal = solicitudCambioMedidor.Certificacion_Literal;
                        if (estadoInstalado) nuevoMedidor.Estado_Medidor = estadoInstalado;
                        await this.medidorRepository.save(nuevoMedidor);
                    } else {
                        console.warn(`Afiliado jurídico con cédula ${solicitudCambioMedidor.Cedula_Juridica} no encontrado para asignar nuevo medidor.`);
                    }
                } else {
                    console.warn(`Nuevo medidor con id ${solicitudCambioMedidor.Id_Nuevo_Medidor} no encontrado.`);
                }
            }
        }

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
            Solicitud: {
                ...resultado,
                Numero_Medidor: resultado.Medidor?.Numero_Medidor ?? null,
                Medidor_Info: resultado.Medidor ? {
                    Id_Medidor: resultado.Medidor.Id_Medidor,
                    Numero_Medidor: resultado.Medidor.Numero_Medidor,
                    Estado: resultado.Medidor.Estado_Medidor?.Nombre_Estado_Medidor ?? null
                } : null
            },
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
            await this.afiliadosService.cambiarAbonadoAAsociadoJuridico(
                solicitudAsociado.Cedula_Juridica,
                idUsuario,
                solicitudAsociado.Planos_Terreno,
                solicitudAsociado.Escrituras_Terreno,
            );
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

    async getAllSolicitudesAgregarMedidor() {
        const solicitudes = await this.solicitudAgregarMedidorRepository.find({
            relations: ['Estado', 'Nuevo_Medidor', 'Nuevo_Medidor.Estado_Medidor']
        });

        return solicitudes.map(item => ({
            ...item,
            Nuevo_Medidor_Info: item.Nuevo_Medidor ? {
                Id_Medidor: item.Nuevo_Medidor.Id_Medidor,
                Numero_Medidor: item.Nuevo_Medidor.Numero_Medidor,
                Estado: item.Nuevo_Medidor.Estado_Medidor?.Nombre_Estado_Medidor ?? null
            } : null
        }));
    }

    async getSolicitudAgregarMedidorById(idSolicitud: number) {
        const solicitud = await this.solicitudAgregarMedidorRepository.findOne({
            where: { Id_Solicitud: idSolicitud },
            relations: ['Estado', 'Nuevo_Medidor', 'Nuevo_Medidor.Estado_Medidor']
        });
        if (!solicitud) throw new BadRequestException(`Solicitud de agregar medidor jurídica con id ${idSolicitud} no encontrada`);

        return {
            ...solicitud,
            Nuevo_Medidor_Info: solicitud.Nuevo_Medidor ? {
                Id_Medidor: solicitud.Nuevo_Medidor.Id_Medidor,
                Numero_Medidor: solicitud.Nuevo_Medidor.Numero_Medidor,
                Estado: solicitud.Nuevo_Medidor.Estado_Medidor?.Nombre_Estado_Medidor ?? null
            } : null
        };
    }

    async createSolicitudAgregarMedidor(dto: CreateSolicitudAgregarMedidorJuridicaDto, files: any) {
        const solicitudActiva = await this.validationsService.validarSolicitudesJuridicasActivas(dto.Cedula_Juridica);
        if (solicitudActiva) throw new BadRequestException(solicitudActiva);

        const afiliadoExistente = await this.validationsService.validarExistenciaAfiliadoJuridico(dto.Cedula_Juridica);
        if (!afiliadoExistente) throw new BadRequestException(`No existe un afiliado jurídico con la cédula ${dto.Cedula_Juridica}`);

        const planoFile = files?.Planos_Terreno?.[0];
        const escrituraFile = files?.Certificacion_Literal?.[0];
        const razonSocial = dto.Razon_Social;

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-AgregarMedidor', 'Juridicas', dto.Cedula_Juridica, razonSocial) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-AgregarMedidor', 'Juridicas', dto.Cedula_Juridica, razonSocial) : null;

        const solicitudBase = this.solicitudRepository.create({
            Tipo_Entidad: 2, 
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 5, 
        });
        const solicitudGuardada = await this.solicitudRepository.save(solicitudBase);

        const solicitudJuridica = this.solicitudJuridicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Tipo_Entidad: 2,
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 5,
            Cedula_Juridica: dto.Cedula_Juridica,
            Razon_Social: dto.Razon_Social,
        });
        await this.solicitudJuridicaRepository.save(solicitudJuridica);

        const solicitudAgregarMedidor = this.solicitudAgregarMedidorRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Tipo_Entidad: 2,
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 5,
            Cedula_Juridica: dto.Cedula_Juridica,
            Razon_Social: dto.Razon_Social,
            Direccion_Exacta: dto.Direccion_Exacta,
            Planos_Terreno: planoRes?.url || '',
            Certificacion_Literal: escrituraRes?.url || '',
            ...(dto.Id_Nuevo_Medidor && { Id_Nuevo_Medidor: dto.Id_Nuevo_Medidor }),
        });
        const solicitudFinal = await this.solicitudAgregarMedidorRepository.save(solicitudAgregarMedidor);

        await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Agregar Medidor', razonSocial);
        return solicitudFinal;
    }

    async updateSolicitudAgregarMedidor(idSolicitud: number, dto: UpdateSolicitudAgregarMedidorJuridicaDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar la solicitud.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        const solicitudBase = await this.solicitudRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudBase) throw new BadRequestException(`Solicitud con id ${idSolicitud} no encontrada`);

        if (solicitudBase.Id_Tipo_Solicitud !== 5) throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud de agregar medidor`);
        if (solicitudBase.Tipo_Entidad !== 2) throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud jurídica`);

        const solicitudAgregarMedidor = await this.solicitudAgregarMedidorRepository.findOne({
            where: { Id_Solicitud: idSolicitud },
            relations: ['Nuevo_Medidor', 'Nuevo_Medidor.Estado_Medidor']
        });
        if (!solicitudAgregarMedidor) throw new BadRequestException(`Solicitud de agregar medidor jurídica con id ${idSolicitud} no encontrada`);

        const datosAnteriores = {
            Cedula_Juridica: solicitudAgregarMedidor.Cedula_Juridica,
            Razon_Social: solicitudAgregarMedidor.Razon_Social,
            Numero_Telefono: solicitudAgregarMedidor.Numero_Telefono,
            Correo: solicitudAgregarMedidor.Correo,
            Direccion_Exacta: solicitudAgregarMedidor.Direccion_Exacta,
            Planos_Terreno: solicitudAgregarMedidor.Planos_Terreno,
            Certificacion_Literal: solicitudAgregarMedidor.Certificacion_Literal,
            Id_Nuevo_Medidor: solicitudAgregarMedidor.Id_Nuevo_Medidor
        };

        solicitudAgregarMedidor.Razon_Social = dto.Razon_Social ?? solicitudAgregarMedidor.Razon_Social;
        solicitudAgregarMedidor.Numero_Telefono = dto.Numero_Telefono ?? solicitudAgregarMedidor.Numero_Telefono;
        solicitudAgregarMedidor.Correo = dto.Correo ?? solicitudAgregarMedidor.Correo;
        solicitudAgregarMedidor.Direccion_Exacta = dto.Direccion_Exacta ?? solicitudAgregarMedidor.Direccion_Exacta;
        solicitudAgregarMedidor.Id_Nuevo_Medidor = dto.Id_Nuevo_Medidor ?? solicitudAgregarMedidor.Id_Nuevo_Medidor;

        const resultado = await this.solicitudAgregarMedidorRepository.save(solicitudAgregarMedidor);

        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Cedula_Juridica: solicitudAgregarMedidor.Cedula_Juridica,
                Razon_Social: solicitudAgregarMedidor.Razon_Social,
                Numero_Telefono: solicitudAgregarMedidor.Numero_Telefono,
                Correo: solicitudAgregarMedidor.Correo,
                Direccion_Exacta: solicitudAgregarMedidor.Direccion_Exacta,
                Planos_Terreno: solicitudAgregarMedidor.Planos_Terreno,
                Certificacion_Literal: solicitudAgregarMedidor.Certificacion_Literal,
                Id_Nuevo_Medidor: solicitudAgregarMedidor.Id_Nuevo_Medidor
            });
        } catch (error) {
            console.error('Error al registrar actualización de solicitud de agregar medidor jurídica en auditoría:', error);
        }

        return {
            ...resultado,
            Nuevo_Medidor_Info: resultado.Nuevo_Medidor ? {
                Id_Medidor: resultado.Nuevo_Medidor.Id_Medidor,
                Numero_Medidor: resultado.Nuevo_Medidor.Numero_Medidor,
                Estado: resultado.Nuevo_Medidor.Estado_Medidor?.Nombre_Estado_Medidor ?? null
            } : null,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
        };
    }

    async updateEstadoSolicitudAgregarMedidor(idSolicitud: number, idNuevoEstado: number, idUsuario: number, motivoRechazo?: string) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar el estado de la solicitud de agregar medidor.');

        if (idNuevoEstado === 5 && !motivoRechazo) {
            throw new BadRequestException('Debe proporcionar un motivo de rechazo');
        }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        const solicitudAgregarMedidor = await this.solicitudAgregarMedidorRepository.findOne({
            where: { Id_Solicitud: idSolicitud },
            relations: ['Estado', 'Nuevo_Medidor', 'Nuevo_Medidor.Estado_Medidor']
        });
        if (!solicitudAgregarMedidor) throw new BadRequestException(`Solicitud de agregar medidor con id ${idSolicitud} no encontrada`);

        const nuevoEstado = await this.estadoSolicitudRepo.findOne({ where: { Id_Estado_Solicitud: idNuevoEstado } });
        if (!nuevoEstado) throw new BadRequestException(`Estado con id ${idNuevoEstado} no encontrado`);

        const razonSocial = solicitudAgregarMedidor.Razon_Social;

        const datosAnteriores = {
            Cedula_Juridica: solicitudAgregarMedidor.Cedula_Juridica,
            Razon_Social: razonSocial,
            Estado_Anterior: solicitudAgregarMedidor.Estado
        };

        // Estado 2 = En revisión
        if (idNuevoEstado === 2) await this.emailService.enviarEmailActualizacionEstado(solicitudAgregarMedidor.Correo, 'Agregar Medidor', 'En revisión', razonSocial);

        // Estado 3 = Aprobada y en espera
        if (idNuevoEstado === 3) await this.emailService.enviarEmailActualizacionEstado(solicitudAgregarMedidor.Correo, 'Agregar Medidor', 'Aprobada y en espera', razonSocial);

        // Estado 4 = Completada ,asignar el nuevo medidor al afiliado acumulativo
        if (idNuevoEstado === 4) {
            await this.emailService.enviarEmailActualizacionEstado(solicitudAgregarMedidor.Correo, 'Agregar Medidor', 'Completada', razonSocial);

            if (solicitudAgregarMedidor.Id_Nuevo_Medidor) {
                const nuevoMedidor = await this.medidorRepository.findOne({
                    where: { Id_Medidor: solicitudAgregarMedidor.Id_Nuevo_Medidor },
                    relations: ['Estado_Medidor']
                });
                if (nuevoMedidor) {
                    const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: solicitudAgregarMedidor.Cedula_Juridica } });
                    if (afiliado) {
                        const estadoInstalado = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor: 2 } }); // 2 = Instalado
                        nuevoMedidor.Afiliado = afiliado;
                        if (estadoInstalado) nuevoMedidor.Estado_Medidor = estadoInstalado;
                        await this.medidorRepository.save(nuevoMedidor);
                        console.log(`Nuevo medidor ${nuevoMedidor.Numero_Medidor} agregado al afiliado jurídico ${afiliado.Cedula_Juridica} y marcado como 'Instalado'`);
                    } else {
                        console.warn(`Afiliado jurídico con cédula ${solicitudAgregarMedidor.Cedula_Juridica} no encontrado para asignar nuevo medidor.`);
                    }
                } else {
                    console.warn(`Nuevo medidor con id ${solicitudAgregarMedidor.Id_Nuevo_Medidor} no encontrado.`);
                }
            }
        }

        // Estado 5 = Rechazada
        if (idNuevoEstado === 5) {
            await this.emailService.enviarEmailSolicitudRechazada(
                solicitudAgregarMedidor.Correo,
                razonSocial,
                'Agregar Medidor',
                idSolicitud.toString(),
                motivoRechazo!
            );
        }

        solicitudAgregarMedidor.Estado = nuevoEstado;
        const resultado = await this.solicitudAgregarMedidorRepository.save(solicitudAgregarMedidor);

        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Cedula_Juridica: solicitudAgregarMedidor.Cedula_Juridica,
                Razon_Social: razonSocial,
                Estado_Nuevo: nuevoEstado.Nombre_Estado,
                ...(motivoRechazo && { Motivo_Rechazo: motivoRechazo })
            });
        } catch (error) {
            console.error('Error al actualizar estado de solicitud de agregar medidor jurídica:', error);
        }

        return {
            Solicitud: {
                ...resultado,
                Nuevo_Medidor_Info: resultado.Nuevo_Medidor ? {
                    Id_Medidor: resultado.Nuevo_Medidor.Id_Medidor,
                    Numero_Medidor: resultado.Nuevo_Medidor.Numero_Medidor,
                    Estado: resultado.Nuevo_Medidor.Estado_Medidor?.Nombre_Estado_Medidor ?? null
                } : null
            },
            Mensaje: `Estado de solicitud de agregar medidor cambiado a '${nuevoEstado.Nombre_Estado}' exitosamente`
        };
    }
}