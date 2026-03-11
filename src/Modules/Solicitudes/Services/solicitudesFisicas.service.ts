import { UpdateSolicitudAfiliacionFisicaDto, UpdateSolicitudAgregarMedidorFisicaDto, UpdateSolicitudAsociadoFisicaDto, UpdateSolicitudCambioMedidorFisicaDto, UpdateSolicitudDesconexionFisicaDto } from "../SolicitudDTO's/UpdateSolicitudFisica.dto";
import { Solicitud, SolicitudAfiliacionFisica, SolicitudAgregarMedidorFisica, SolicitudAsociadoFisica, SolicitudCambioMedidorFisica, SolicitudDesconexionFisica, SolicitudFisica } from "../SolicitudEntities/Solicitud.Entity";
import { CreateSolicitudAfiliacionFisicaDto, CreateSolicitudAgregarMedidorFisicaDto, CreateSolicitudAsociadoFisicaDto, CreateSolicitudCambioMedidorFisicaDto, CreateSolicitudDesconexionFisicaDto } from "../SolicitudDTO's/CreateSolicitudFisica.dto";
import { EstadoSolicitud } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { ValidationsService } from "src/Validations/Validations.service";
import { AfiliadosService } from "src/Modules/Afiliados/afiliados.service";
import { EmailService } from "src/Modules/Emails/email.service";
import { AfiliadoFisico } from "src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity";
import { EstadoAfiliado } from "src/Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";
import { AuditoriaService } from "src/Modules/Auditoria/auditoria.service";
import { UsuariosService } from 'src/Modules/Usuarios/Services/usuarios.service';
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Medidor } from "src/Modules/Inventario/InventarioEntities/Medidor.Entity";
import { EstadoMedidor } from "src/Modules/Inventario/InventarioEntities/EstadoMedidor.Entity";

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

        @InjectRepository(SolicitudAgregarMedidorFisica)
        private readonly solicitudAgregarMedidorFisicaRepository: Repository<SolicitudAgregarMedidorFisica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        @InjectRepository(AfiliadoFisico)
        private readonly afiliadoFisicoRepository: Repository<AfiliadoFisico>,

        @InjectRepository(EstadoAfiliado)
        private readonly estadoAfiliadoRepository: Repository<EstadoAfiliado>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

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

    // MÉTODOS PARA OBTENER SOLICITUDES FÍSICAS
    async getAllSolicitudesFisicas() {
        return {
            "Afiliacion": await this.getAllSolicitudesAfiliacion(),
            "Desconexion": await this.getAllSolicitudesDesconexion(),
            "Cambio De Medidor": await this.getAllSolicitudesCambioMedidor(),
            "Asociado": await this.getAllSolicitudesAsociado(),
            "Agregar Medidor": await this.getAllSolicitudesAgregarMedidor(),
        };
    }

    async getAllSolicitudesAfiliacion() {
        return this.solicitudAfiliacionFisicaRepository.find({ relations: ['Estado'] });
    }

    async getAllSolicitudesDesconexion() {
        return this.solicitudDesconexionFisicaRepository.find({ relations: ['Estado'] });
    }

    async getAllSolicitudesCambioMedidor() {
        const solicitudes = await this.solicitudCambioMedidorFisicaRepository.find({
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
        const solicitud = await this.solicitudCambioMedidorFisicaRepository.findOne({
            where: { Id_Solicitud: idSolicitud },
            relations: ['Estado', 'Medidor', 'Medidor.Estado_Medidor', 'Nuevo_Medidor', 'Nuevo_Medidor.Estado_Medidor']
        });
        if (!solicitud) throw new BadRequestException(`Solicitud de cambio de medidor física con id ${idSolicitud} no encontrada`);
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
        return this.solicitudAsociadoFisicaRepository.find({ relations: ['Estado'] });
    }



    // MÉTODOS PARA CREAR SOLICITUDES FÍSICAS
    async createSolicitudAfiliacion(dto: CreateSolicitudAfiliacionFisicaDto, files: any) {
        const solicitudActiva = await this.validationsService.validarSolicitudesFisicasActivas(dto.Identificacion);
        if (solicitudActiva) throw new BadRequestException(solicitudActiva);

        // Validación específica para afiliación: NO debe existir un afiliado físico
        const afiliadoExistente = await this.validationsService.validarExistenciaAfiliadoFisico(dto.Identificacion);
        if (afiliadoExistente) throw new BadRequestException(`Ya existe un afiliado físico con la identificación ${dto.Identificacion}`);

        const planoFile = files?.Planos_Terreno?.[0];
        const escrituraFile = files?.Escritura_Terreno?.[0];
        const nombre = `${dto.Nombre} ${dto.Apellido1 ?? ''} ${dto.Apellido2 ?? ''}`.trim();

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Afiliacion', 'Fisicas', dto.Identificacion, nombre) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Afiliacion', 'Fisicas', dto.Identificacion, nombre) : null;

        // 1. Crear registro en tabla padre Solicitud
        const solicitudBase = this.solicitudRepository.create({
            Tipo_Entidad: 1, // Física
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 1, // Afiliación
        });
        const solicitudGuardada = await this.solicitudRepository.save(solicitudBase);

        // 2. Crear registro en tabla intermedia SolicitudFisica
        const solicitudFisica = this.solicitudFisicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Tipo_Entidad: 1, // Física
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
            Tipo_Entidad: 1, // Física
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
        const solicitudActiva = await this.validationsService.validarSolicitudesFisicasActivas(dto.Identificacion);
        if (solicitudActiva) throw new BadRequestException(solicitudActiva);

        // Validación específica para desconexión: SÍ debe existir un afiliado físico
        const afiliadoExistente = await this.validationsService.validarExistenciaAfiliadoFisico(dto.Identificacion);
        if (!afiliadoExistente) throw new BadRequestException(`No existe un afiliado físico con la identificación ${dto.Identificacion}`);

        const planoFile = files?.Planos_Terreno?.[0];
        const escrituraFile = files?.Escritura_Terreno?.[0];
        const nombre = `${dto.Nombre} ${dto.Apellido1 ?? ''} ${dto.Apellido2 ?? ''}`.trim();

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Desconexion', 'Fisicas', dto.Identificacion, nombre) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Desconexion', 'Fisicas', dto.Identificacion, nombre) : null;

        // 1. Crear registro en tabla padre Solicitud
        const solicitudBase = this.solicitudRepository.create({
            Tipo_Entidad: 1, // Física
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 2, // Desconexión
        });
        const solicitudGuardada = await this.solicitudRepository.save(solicitudBase);

        // 2. Crear registro en tabla intermedia SolicitudFisica
        const solicitudFisica = this.solicitudFisicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Tipo_Entidad: 1, // Física
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
            Tipo_Entidad: 1, // Física
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
            Id_Medidor: dto.Id_Medidor,
        });
        const solicitudFinal = await this.solicitudDesconexionFisicaRepository.save(solicitudDesconexion);

        await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Desconexión', nombre);
        return solicitudFinal;
    }

    async createSolicitudCambioMedidor(dto: CreateSolicitudCambioMedidorFisicaDto) {
        const solicitudActiva = await this.validationsService.validarSolicitudesFisicasActivas(dto.Identificacion);
        if (solicitudActiva) throw new BadRequestException(solicitudActiva);

        // Validación específica para cambio medidor: SÍ debe existir un afiliado físico
        const afiliadoExistente = await this.validationsService.validarExistenciaAfiliadoFisico(dto.Identificacion);
        if (!afiliadoExistente) throw new BadRequestException(`No existe un afiliado físico con la identificación ${dto.Identificacion}`);

        const nombre = `${dto.Nombre} ${dto.Apellido1 ?? ''} ${dto.Apellido2 ?? ''}`.trim();

        // 1. Crear registro en tabla padre Solicitud
        const solicitudBase = this.solicitudRepository.create({
            Tipo_Entidad: 1, // Física
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 3, // Cambio de Medidor
        });
        const solicitudGuardada = await this.solicitudRepository.save(solicitudBase);

        // 2. Crear registro en tabla intermedia SolicitudFisica
        const solicitudFisica = this.solicitudFisicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Tipo_Entidad: 1, // Física
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
            Tipo_Entidad: 1, // Física
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
            Id_Medidor: dto.Id_Medidor,
        });
        const solicitudFinal = await this.solicitudCambioMedidorFisicaRepository.save(solicitudCambioMedidor);

        await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Cambio de Medidor', nombre);
        return solicitudFinal;
    }

    async createSolicitudAsociado(dto: CreateSolicitudAsociadoFisicaDto) {
        const solicitudActiva = await this.validationsService.validarSolicitudesFisicasActivas(dto.Identificacion);
        if (solicitudActiva) throw new BadRequestException(solicitudActiva);

        // Validación específica para asociado: SÍ debe existir un afiliado físico
        const afiliadoExistente = await this.validationsService.validarExistenciaAfiliadoFisico(dto.Identificacion);
        if (!afiliadoExistente) throw new BadRequestException(`No existe un afiliado físico con la identificación ${dto.Identificacion}. No se puede crear la solicitud de asociado.`);

        const nombre = `${dto.Nombre} ${dto.Apellido1 ?? ''} ${dto.Apellido2 ?? ''}`.trim();

        // 1. Crear registro en tabla padre Solicitud
        const solicitudBase = this.solicitudRepository.create({
            Tipo_Entidad: 1, // Física
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 4, // Asociado
        });
        const solicitudGuardada = await this.solicitudRepository.save(solicitudBase);

        // 2. Crear registro en tabla intermedia SolicitudFisica
        const solicitudFisica = this.solicitudFisicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Tipo_Entidad: 1, // Física
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
            Tipo_Entidad: 1, // Física
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



    // MÉTODOS PARA ACTUALIZAR SOLICITUDES FÍSICAS
    async updateSolicitudAfiliacion(idSolicitud: number, dto: UpdateSolicitudAfiliacionFisicaDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar la solicitud.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        // 1. Verificar que la solicitud existe en la tabla padre
        const solicitudBase = await this.solicitudRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudBase) throw new BadRequestException(`Solicitud con id ${idSolicitud} no encontrada`);

        // 2. Verificar que es una solicitud de afiliación física (Id_Tipo_Solicitud = 1, Tipo_Entidad = 1)
        if (solicitudBase.Id_Tipo_Solicitud !== 1) throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud de afiliación`);
        if (solicitudBase.Tipo_Entidad !== 1) throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud física`);

        // 3. Buscar la solicitud de afiliación física específica
        const solicitudAfiliacion = await this.solicitudAfiliacionFisicaRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudAfiliacion) throw new BadRequestException(`Solicitud de afiliación física con id ${idSolicitud} no encontrada`);

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Nombre: solicitudAfiliacion.Nombre,
            Apellido1: solicitudAfiliacion.Apellido1,
            Apellido2: solicitudAfiliacion.Apellido2,
            Numero_Telefono: solicitudAfiliacion.Numero_Telefono,
            Correo: solicitudAfiliacion.Correo,
            Direccion_Exacta: solicitudAfiliacion.Direccion_Exacta,
            Edad: solicitudAfiliacion.Edad
        };

        // 4. Actualizar campos específicos de SolicitudAfiliacionFisica
        solicitudAfiliacion.Nombre = dto.Nombre ?? solicitudAfiliacion.Nombre;
        solicitudAfiliacion.Apellido1 = dto.Apellido1 ?? solicitudAfiliacion.Apellido1;
        solicitudAfiliacion.Apellido2 = dto.Apellido2 ?? solicitudAfiliacion.Apellido2;
        solicitudAfiliacion.Numero_Telefono = dto.Numero_Telefono ?? solicitudAfiliacion.Numero_Telefono;
        solicitudAfiliacion.Correo = dto.Correo ?? solicitudAfiliacion.Correo;
        solicitudAfiliacion.Direccion_Exacta = dto.Direccion_Exacta ?? solicitudAfiliacion.Direccion_Exacta;
        solicitudAfiliacion.Edad = dto.Edad ?? solicitudAfiliacion.Edad;

        // 5. Guardar cambios
        const resultado = await this.solicitudAfiliacionFisicaRepository.save(solicitudAfiliacion);

        // 6. Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Nombre: solicitudAfiliacion.Nombre,
                Apellido1: solicitudAfiliacion.Apellido1,
                Apellido2: solicitudAfiliacion.Apellido2,
                Numero_Telefono: solicitudAfiliacion.Numero_Telefono,
                Correo: solicitudAfiliacion.Correo,
                Direccion_Exacta: solicitudAfiliacion.Direccion_Exacta,
                Edad: solicitudAfiliacion.Edad
            });
        } catch (error) {
            console.error('Error al registrar actualización de solicitud en auditoría:', error);
        }

        return {
            ...resultado,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
        }
    }

    async updateSolicitudDesconexion(idSolicitud: number, dto: UpdateSolicitudDesconexionFisicaDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar la solicitud.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        // 1. Verificar que la solicitud existe en la tabla padre
        const solicitudBase = await this.solicitudRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudBase) throw new BadRequestException(`Solicitud con id ${idSolicitud} no encontrada`);

        // 2. Verificar que es una solicitud de desconexión física (Id_Tipo_Solicitud = 2, Tipo_Entidad = 1)
        if (solicitudBase.Id_Tipo_Solicitud !== 2) throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud de desconexión`);
        if (solicitudBase.Tipo_Entidad !== 1) throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud física`);

        // 3. Buscar la solicitud de desconexión física específica
        const solicitudDesconexion = await this.solicitudDesconexionFisicaRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudDesconexion) throw new BadRequestException(`Solicitud de desconexión física con id ${idSolicitud} no encontrada`);

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Nombre: solicitudDesconexion.Nombre,
            Apellido1: solicitudDesconexion.Apellido1,
            Apellido2: solicitudDesconexion.Apellido2,
            Numero_Telefono: solicitudDesconexion.Numero_Telefono,
            Correo: solicitudDesconexion.Correo,
            Direccion_Exacta: solicitudDesconexion.Direccion_Exacta,
            Motivo_Solicitud: solicitudDesconexion.Motivo_Solicitud,
            Id_Medidor: solicitudDesconexion.Id_Medidor
        };

        // 4. Actualizar campos específicos de SolicitudDesconexionFisica
        solicitudDesconexion.Nombre = dto.Nombre ?? solicitudDesconexion.Nombre;
        solicitudDesconexion.Apellido1 = dto.Apellido1 ?? solicitudDesconexion.Apellido1;
        solicitudDesconexion.Apellido2 = dto.Apellido2 ?? solicitudDesconexion.Apellido2;
        solicitudDesconexion.Numero_Telefono = dto.Numero_Telefono ?? solicitudDesconexion.Numero_Telefono;
        solicitudDesconexion.Correo = dto.Correo ?? solicitudDesconexion.Correo;
        solicitudDesconexion.Direccion_Exacta = dto.Direccion_Exacta ?? solicitudDesconexion.Direccion_Exacta;
        solicitudDesconexion.Motivo_Solicitud = dto.Motivo_Solicitud ?? solicitudDesconexion.Motivo_Solicitud;
        solicitudDesconexion.Id_Medidor = dto.Id_Medidor ?? solicitudDesconexion.Id_Medidor;

        // 5. Guardar cambios
        const resultado = await this.solicitudDesconexionFisicaRepository.save(solicitudDesconexion);

        // 6. Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Nombre: solicitudDesconexion.Nombre,
                Apellido1: solicitudDesconexion.Apellido1,
                Apellido2: solicitudDesconexion.Apellido2,
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

    async updateSolicitudCambioMedidor(idSolicitud: number, dto: UpdateSolicitudCambioMedidorFisicaDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar la solicitud.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        // 1. Verificar que la solicitud existe en la tabla padre
        const solicitudBase = await this.solicitudRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudBase) throw new BadRequestException(`Solicitud con id ${idSolicitud} no encontrada`);

        // 2. Verificar que es una solicitud de cambio de medidor física (Id_Tipo_Solicitud = 3, Tipo_Entidad = 1)
        if (solicitudBase.Id_Tipo_Solicitud !== 3) throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud de cambio de medidor`);
        if (solicitudBase.Tipo_Entidad !== 1) throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud física`);

        // 3. Buscar la solicitud de cambio de medidor física específica
        const solicitudCambioMedidor = await this.solicitudCambioMedidorFisicaRepository.findOne({
            where: { Id_Solicitud: idSolicitud },
            relations: ['Medidor', 'Medidor.Estado_Medidor']
        });
        if (!solicitudCambioMedidor) throw new BadRequestException(`Solicitud de cambio de medidor física con id ${idSolicitud} no encontrada`);

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Nombre: solicitudCambioMedidor.Nombre,
            Apellido1: solicitudCambioMedidor.Apellido1,
            Apellido2: solicitudCambioMedidor.Apellido2,
            Numero_Telefono: solicitudCambioMedidor.Numero_Telefono,
            Correo: solicitudCambioMedidor.Correo,
            Direccion_Exacta: solicitudCambioMedidor.Direccion_Exacta,
            Motivo_Solicitud: solicitudCambioMedidor.Motivo_Solicitud,
            Id_Medidor: solicitudCambioMedidor.Id_Medidor
        };

        // 4. Actualizar campos específicos de SolicitudCambioMedidorFisica
        solicitudCambioMedidor.Nombre = dto.Nombre ?? solicitudCambioMedidor.Nombre;
        solicitudCambioMedidor.Apellido1 = dto.Apellido1 ?? solicitudCambioMedidor.Apellido1;
        solicitudCambioMedidor.Apellido2 = dto.Apellido2 ?? solicitudCambioMedidor.Apellido2;
        solicitudCambioMedidor.Numero_Telefono = dto.Numero_Telefono ?? solicitudCambioMedidor.Numero_Telefono;
        solicitudCambioMedidor.Correo = dto.Correo ?? solicitudCambioMedidor.Correo;
        solicitudCambioMedidor.Direccion_Exacta = dto.Direccion_Exacta ?? solicitudCambioMedidor.Direccion_Exacta;
        solicitudCambioMedidor.Motivo_Solicitud = dto.Motivo_Solicitud ?? solicitudCambioMedidor.Motivo_Solicitud;
        solicitudCambioMedidor.Id_Medidor = dto.Id_Medidor ?? solicitudCambioMedidor.Id_Medidor;
        solicitudCambioMedidor.Id_Nuevo_Medidor = dto.Id_Nuevo_Medidor ?? solicitudCambioMedidor.Id_Nuevo_Medidor;

        // 5. Guardar cambios
        const resultado = await this.solicitudCambioMedidorFisicaRepository.save(solicitudCambioMedidor);

        // 6. Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Nombre: solicitudCambioMedidor.Nombre,
                Apellido1: solicitudCambioMedidor.Apellido1,
                Apellido2: solicitudCambioMedidor.Apellido2,
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

    async updateSolicitudAsociado(idSolicitud: number, dto: UpdateSolicitudAsociadoFisicaDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar la solicitud.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        // 1. Verificar que la solicitud existe en la tabla padre
        const solicitudBase = await this.solicitudRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudBase) throw new BadRequestException(`Solicitud con id ${idSolicitud} no encontrada`);

        // 2. Verificar que es una solicitud de asociado física (Id_Tipo_Solicitud = 4, Tipo_Entidad = 1)
        if (solicitudBase.Id_Tipo_Solicitud !== 4) throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud de asociado`);
        if (solicitudBase.Tipo_Entidad !== 1) throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud física`);

        // 3. Buscar la solicitud de asociado física específica
        const solicitudAsociado = await this.solicitudAsociadoFisicaRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudAsociado) throw new BadRequestException(`Solicitud de asociado física con id ${idSolicitud} no encontrada`);

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Nombre: solicitudAsociado.Nombre,
            Apellido1: solicitudAsociado.Apellido1,
            Apellido2: solicitudAsociado.Apellido2,
            Numero_Telefono: solicitudAsociado.Numero_Telefono,
            Correo: solicitudAsociado.Correo,
            Motivo_Solicitud: solicitudAsociado.Motivo_Solicitud
        };

        // 4. Actualizar campos específicos de SolicitudAsociadoFisica
        solicitudAsociado.Nombre = dto.Nombre ?? solicitudAsociado.Nombre;
        solicitudAsociado.Apellido1 = dto.Apellido1 ?? solicitudAsociado.Apellido1;
        solicitudAsociado.Apellido2 = dto.Apellido2 ?? solicitudAsociado.Apellido2;
        solicitudAsociado.Numero_Telefono = dto.Numero_Telefono ?? solicitudAsociado.Numero_Telefono;
        solicitudAsociado.Correo = dto.Correo ?? solicitudAsociado.Correo;
        solicitudAsociado.Motivo_Solicitud = dto.Motivo_Solicitud ?? solicitudAsociado.Motivo_Solicitud;

        // 5. Guardar cambios
        const resultado = await this.solicitudAsociadoFisicaRepository.save(solicitudAsociado);

        // 6. Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Nombre: solicitudAsociado.Nombre,
                Apellido1: solicitudAsociado.Apellido1,
                Apellido2: solicitudAsociado.Apellido2,
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



    // MÉTODOS PARA CAMBIO DE ESTADO DE SOLICITUDES FÍSICAS
    async updateEstadoSolicitudAfiliacion(idSolicitud: number, idNuevoEstado: number, idUsuario: number, motivoRechazo?: string) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar el estado de la solicitud de afiliación.');

        //prueba 
        if (idNuevoEstado === 5 && !motivoRechazo) {
            throw new BadRequestException('Debe proporcionar un motivo de rechazo');
        }//

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        const solicitudAfiliacion = await this.solicitudAfiliacionFisicaRepository.findOne({ where: { Id_Solicitud: idSolicitud }, relations: ['Estado'] });
        if (!solicitudAfiliacion) throw new BadRequestException(`Solicitud de afiliación con id ${idSolicitud} no encontrada`);

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: idNuevoEstado } });
        if (!nuevoEstado) throw new BadRequestException(`Estado con id ${idNuevoEstado} no encontrado`);

        const nombre = `${solicitudAfiliacion.Nombre} ${solicitudAfiliacion.Apellido1 ?? ''} ${solicitudAfiliacion.Apellido2 ?? ''}`.trim();

        // Guardar estado anterior para auditoría
        const datosAnteriores = {
            Tipo_Identificacion: solicitudAfiliacion.Tipo_Identificacion,
            Identificacion: solicitudAfiliacion.Identificacion,
            Nombre_Solicitante: nombre,
            Estado_Anterior: solicitudAfiliacion.Estado
        }

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
        if (idNuevoEstado === 5) {
            await this.emailService.enviarEmailSolicitudRechazada(
                solicitudAfiliacion.Correo,
                nombre,
                'Afiliación',
                idSolicitud.toString(),
                motivoRechazo!
            );
            console.log(`Estado de solicitud de afiliación ${idSolicitud} cambiado a 'Rechazada'`);
        }

        solicitudAfiliacion.Estado = nuevoEstado;
        const resultado = await this.solicitudAfiliacionFisicaRepository.save(solicitudAfiliacion);

        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Tipo_Identificacion: solicitudAfiliacion.Tipo_Identificacion,
                Identificacion: solicitudAfiliacion.Identificacion,
                Nombre_Solicitante: nombre,
                Estado_Nuevo: nuevoEstado.Nombre_Estado,
                ...(motivoRechazo && { Motivo_Rechazo: motivoRechazo })
            });
        } catch (error) {
            console.error('Error al actualizar estado de solicitud de afiliación:', error);
        }

        return {
            Solicitud: resultado,
            Mensaje: `Estado de solicitud de afiliación cambiado a '${nuevoEstado.Nombre_Estado}' exitosamente`
        };
    }

    async updateEstadoSolicitudDesconexion(idSolicitud: number, idNuevoEstado: number, idUsuario: number, motivoRechazo?: string) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar el estado de la solicitud de desconexión.');

        // Validar que si el estado es rechazado (5), se proporcione el motivo
        if (idNuevoEstado === 5 && !motivoRechazo) {
            throw new BadRequestException('Debe proporcionar un motivo de rechazo');
        }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        const solicitudDesconexion = await this.solicitudDesconexionFisicaRepository.findOne({ where: { Id_Solicitud: idSolicitud }, relations: ['Estado'] });
        if (!solicitudDesconexion) throw new BadRequestException(`Solicitud de desconexión con id ${idSolicitud} no encontrada`);

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: idNuevoEstado } });
        if (!nuevoEstado) throw new BadRequestException(`Estado con id ${idNuevoEstado} no encontrado`);

        const nombre = `${solicitudDesconexion.Nombre} ${solicitudDesconexion.Apellido1 ?? ''} ${solicitudDesconexion.Apellido2 ?? ''}`.trim();

        // Guardar estado anterior para auditoría
        const datosAnteriores = {
            Tipo_Identificacion: solicitudDesconexion.Tipo_Identificacion,
            Identificacion: solicitudDesconexion.Identificacion,
            Nombre_Solicitante: nombre,
            Estado_Anterior: solicitudDesconexion.Estado
        };

        // Estado 2 = En revisión
        if (idNuevoEstado === 2) await this.emailService.enviarEmailActualizacionEstado(solicitudDesconexion.Correo, 'Desconexión', 'En revisión', nombre);

        // Estado 3 = Aprobada y en espera
        if (idNuevoEstado === 3) await this.emailService.enviarEmailActualizacionEstado(solicitudDesconexion.Correo, 'Desconexión', 'Aprobada y en espera', nombre);

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
            } else if (!afiliado) {
                console.warn(`Afiliado físico con identificación ${solicitudDesconexion.Identificacion} no encontrado para actualizar su estado a inactivo.`);
            }
        }

        // Estado 5 = Rechazada
        if (idNuevoEstado === 5) {
            await this.emailService.enviarEmailSolicitudRechazada(
                solicitudDesconexion.Correo,
                nombre,
                'Desconexión',
                idSolicitud.toString(),
                motivoRechazo!
            );
            console.log(`Estado de solicitud de desconexión ${idSolicitud} cambiado a 'Rechazada'`);
        }

        solicitudDesconexion.Estado = nuevoEstado;
        const resultado = await this.solicitudDesconexionFisicaRepository.save(solicitudDesconexion);

        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Tipo_Identificacion: solicitudDesconexion.Tipo_Identificacion,
                Identificacion: solicitudDesconexion.Identificacion,
                Nombre_Solicitante: nombre,
                Estado_Nuevo: nuevoEstado.Nombre_Estado,
                ...(motivoRechazo && { Motivo_Rechazo: motivoRechazo })
            });
        } catch (error) {
            console.error(`Error al actualizar estado de solicitud de desconexión ${idSolicitud}:`, error);
        }

        return {
            Solicitud: resultado,
            Mensaje: `Estado de solicitud de desconexión cambiado a '${nuevoEstado.Nombre_Estado}' exitosamente`
        };
    }

    async updateEstadoSolicitudCambioMedidor(idSolicitud: number, idNuevoEstado: number, idUsuario: number, motivoRechazo?: string) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar el estado de la solicitud de cambio de medidor.');

        // Validar que si el estado es rechazado (5), se proporcione el motivo
        if (idNuevoEstado === 5 && !motivoRechazo) {
            throw new BadRequestException('Debe proporcionar un motivo de rechazo');
        }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        const solicitudCambioMedidor = await this.solicitudCambioMedidorFisicaRepository.findOne({
            where: { Id_Solicitud: idSolicitud },
            relations: ['Estado', 'Medidor', 'Medidor.Estado_Medidor']
        });
        if (!solicitudCambioMedidor) throw new BadRequestException(`Solicitud de cambio de medidor con id ${idSolicitud} no encontrada`);

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: idNuevoEstado } });
        if (!nuevoEstado) throw new BadRequestException(`Estado con id ${idNuevoEstado} no encontrado`);

        const nombre = `${solicitudCambioMedidor.Nombre} ${solicitudCambioMedidor.Apellido1 ?? ''} ${solicitudCambioMedidor.Apellido2 ?? ''}`.trim();

        // Guardar estado anterior para auditoría
        const datosAnteriores = {
            Tipo_Identificacion: solicitudCambioMedidor.Tipo_Identificacion,
            Identificacion: solicitudCambioMedidor.Identificacion,
            Nombre_Solicitante: nombre,
            Estado_Anterior: solicitudCambioMedidor.Estado
        }

        // Estado 2 = En revisión
        if (idNuevoEstado === 2) await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'En revisión', nombre);

        // Estado 3 = Aprobada y en espera
        if (idNuevoEstado === 3) await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'Aprobada y en espera', nombre);

        // Estado 4 = Completada
        if (idNuevoEstado === 4) {
            await this.emailService.enviarEmailActualizacionEstado(solicitudCambioMedidor.Correo, 'Cambio de Medidor', 'Completada', nombre);

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
                    const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Identificacion: solicitudCambioMedidor.Identificacion } });
                    if (afiliado) {
                        const estadoInstalado = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor: 2 } }); // 2 = Instalado
                        nuevoMedidor.Afiliado = afiliado;
                        if (estadoInstalado) nuevoMedidor.Estado_Medidor = estadoInstalado;
                        await this.medidorRepository.save(nuevoMedidor);
                        console.log(`Nuevo medidor ${nuevoMedidor.Numero_Medidor} asignado al afiliado ${afiliado.Identificacion} y marcado como 'Instalado'`);
                    } else {
                        console.warn(`Afiliado físico con identificación ${solicitudCambioMedidor.Identificacion} no encontrado para asignar nuevo medidor.`);
                    }
                } else {
                    console.warn(`Nuevo medidor con id ${solicitudCambioMedidor.Id_Nuevo_Medidor} no encontrado.`);
                }
            }
        }

        // Estado 5 = Rechazada
        if (idNuevoEstado === 5) {
            await this.emailService.enviarEmailSolicitudRechazada(
                solicitudCambioMedidor.Correo,
                nombre,
                'Cambio de Medidor',
                idSolicitud.toString(),
                motivoRechazo!
            );
            console.log(`Estado de solicitud de cambio de medidor ${idSolicitud} cambiado a 'Rechazada'`);
        }

        solicitudCambioMedidor.Estado = nuevoEstado;
        const resultado = await this.solicitudCambioMedidorFisicaRepository.save(solicitudCambioMedidor);

        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Tipo_Identificacion: solicitudCambioMedidor.Tipo_Identificacion,
                Identificacion: solicitudCambioMedidor.Identificacion,
                Nombre_Solicitante: nombre,
                Estado_Nuevo: nuevoEstado.Nombre_Estado,
                ...(motivoRechazo && { Motivo_Rechazo: motivoRechazo })
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

    async updateEstadoSolicitudAsociado(idSolicitud: number, idNuevoEstado: number, idUsuario: number, motivoRechazo?: string) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar el estado de la solicitud de asociado.');

        // Validar que si el estado es rechazado (5), se proporcione el motivo
        if (idNuevoEstado === 5 && !motivoRechazo) {
            throw new BadRequestException('Debe proporcionar un motivo de rechazo');
        }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        const solicitudAsociado = await this.solicitudAsociadoFisicaRepository.findOne({ where: { Id_Solicitud: idSolicitud }, relations: ['Estado'] });
        if (!solicitudAsociado) throw new BadRequestException(`Solicitud de asociado con id ${idSolicitud} no encontrada`);

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: idNuevoEstado } });
        if (!nuevoEstado) throw new BadRequestException(`Estado con id ${idNuevoEstado} no encontrado`);

        const nombre = `${solicitudAsociado.Nombre} ${solicitudAsociado.Apellido1 ?? ''} ${solicitudAsociado.Apellido2 ?? ''}`.trim();

        // Guardar estado anterior para auditoría
        const datosAnteriores = {
            Tipo_Identificacion: solicitudAsociado.Tipo_Identificacion,
            Identificacion: solicitudAsociado.Identificacion,
            Nombre_Solicitante: nombre,
            Estado_Anterior: solicitudAsociado.Estado
        };

        // Estado 2 = En revisión
        if (idNuevoEstado === 2) await this.emailService.enviarEmailActualizacionEstado(solicitudAsociado.Correo, 'Asociado', 'En revisión', nombre);

        // Estado 3 = Aprobada y en espera
        if (idNuevoEstado === 3) console.log(`Estado de solicitud de asociado ${idSolicitud} cambiado a 'Aprobada'`);

        // Estado 4 = Completada
        if (idNuevoEstado === 4) {
            await this.emailService.enviarEmailActualizacionEstado(solicitudAsociado.Correo, 'Asociado', 'Completada', nombre);

            // Cambiar afiliado de abonado a asociado
            await this.afiliadosService.cambiarAbonadoAAsociadoFisico(solicitudAsociado.Identificacion, idUsuario);
        }

        // Estado 5 = Rechazada
        if (idNuevoEstado === 5) {
            await this.emailService.enviarEmailSolicitudRechazada(
                solicitudAsociado.Correo,
                nombre,
                'Asociado',
                idSolicitud.toString(),
                motivoRechazo!
            );
            console.log(`Estado de solicitud de asociado ${idSolicitud} cambiado a 'Rechazada'`);
        }

        solicitudAsociado.Estado = nuevoEstado;
        const resultado = await this.solicitudAsociadoFisicaRepository.save(solicitudAsociado);

        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Tipo_Identificacion: solicitudAsociado.Tipo_Identificacion,
                Identificacion: solicitudAsociado.Identificacion,
                Nombre_Solicitante: nombre,
                Estado_Nuevo: nuevoEstado.Nombre_Estado,
                ...(motivoRechazo && { Motivo_Rechazo: motivoRechazo })
            });
        } catch (error) {
            console.error('Error al actualizar estado de solicitud de asociado:', error);
        }

        return {
            Solicitud: resultado,
            Mensaje: `Estado de solicitud de asociado cambiado a '${nuevoEstado.Nombre_Estado}' exitosamente`
        };
    }



    // ─────────────────────────────────────────────────────────────────────────────
    // AGREGAR MEDIDOR FÍSICO
    // ─────────────────────────────────────────────────────────────────────────────

    async getAllSolicitudesAgregarMedidor() {
        const solicitudes = await this.solicitudAgregarMedidorFisicaRepository.find({
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
        const solicitud = await this.solicitudAgregarMedidorFisicaRepository.findOne({
            where: { Id_Solicitud: idSolicitud },
            relations: ['Estado', 'Nuevo_Medidor', 'Nuevo_Medidor.Estado_Medidor']
        });
        if (!solicitud) throw new BadRequestException(`Solicitud de agregar medidor física con id ${idSolicitud} no encontrada`);

        return {
            ...solicitud,
            Nuevo_Medidor_Info: solicitud.Nuevo_Medidor ? {
                Id_Medidor: solicitud.Nuevo_Medidor.Id_Medidor,
                Numero_Medidor: solicitud.Nuevo_Medidor.Numero_Medidor,
                Estado: solicitud.Nuevo_Medidor.Estado_Medidor?.Nombre_Estado_Medidor ?? null
            } : null
        };
    }

    async createSolicitudAgregarMedidor(dto: CreateSolicitudAgregarMedidorFisicaDto, files: any) {
        const solicitudActiva = await this.validationsService.validarSolicitudesFisicasActivas(dto.Identificacion);
        if (solicitudActiva) throw new BadRequestException(solicitudActiva);

        // Validación específica: SÍ debe existir un afiliado físico
        const afiliadoExistente = await this.validationsService.validarExistenciaAfiliadoFisico(dto.Identificacion);
        if (!afiliadoExistente) throw new BadRequestException(`No existe un afiliado físico con la identificación ${dto.Identificacion}`);

        const planoFile = files?.Planos_Terreno?.[0];
        const escrituraFile = files?.Escritura_Terreno?.[0];
        const nombre = `${dto.Nombre} ${dto.Apellido1 ?? ''} ${dto.Apellido2 ?? ''}`.trim();

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-AgregarMedidor', 'Fisicas', dto.Identificacion, nombre) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-AgregarMedidor', 'Fisicas', dto.Identificacion, nombre) : null;

        // 1. Crear registro en tabla padre Solicitud
        const solicitudBase = this.solicitudRepository.create({
            Tipo_Entidad: 1, // Física
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 5, // Agregar Medidor
        });
        const solicitudGuardada = await this.solicitudRepository.save(solicitudBase);

        // 2. Crear registro en tabla intermedia SolicitudFisica
        const solicitudFisica = this.solicitudFisicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Tipo_Entidad: 1,
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 5,
            Tipo_Identificacion: dto.Tipo_Identificacion,
            Identificacion: dto.Identificacion,
            Nombre: dto.Nombre,
            Apellido1: dto.Apellido1,
            Apellido2: dto.Apellido2,
        });
        await this.solicitudFisicaRepository.save(solicitudFisica);

        // 3. Crear registro en tabla específica SolicitudAgregarMedidorFisica
        const solicitudAgregarMedidor = this.solicitudAgregarMedidorFisicaRepository.create({
            Id_Solicitud: solicitudGuardada.Id_Solicitud,
            Tipo_Entidad: 1,
            Correo: dto.Correo,
            Numero_Telefono: dto.Numero_Telefono,
            Id_Tipo_Solicitud: 5,
            Tipo_Identificacion: dto.Tipo_Identificacion,
            Identificacion: dto.Identificacion,
            Nombre: dto.Nombre,
            Apellido1: dto.Apellido1,
            Apellido2: dto.Apellido2,
            Direccion_Exacta: dto.Direccion_Exacta,
            Planos_Terreno: planoRes?.url || '',
            Escritura_Terreno: escrituraRes?.url || '',
            ...(dto.Id_Nuevo_Medidor && { Id_Nuevo_Medidor: dto.Id_Nuevo_Medidor }),
        });
        const solicitudFinal = await this.solicitudAgregarMedidorFisicaRepository.save(solicitudAgregarMedidor);

        await this.emailService.enviarEmailSolicitudCreada(dto.Correo, 'Agregar Medidor', nombre);
        return solicitudFinal;
    }

    async updateSolicitudAgregarMedidor(idSolicitud: number, dto: UpdateSolicitudAgregarMedidorFisicaDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('ID de usuario es requerido para actualizar la solicitud.');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

        const solicitudBase = await this.solicitudRepository.findOne({ where: { Id_Solicitud: idSolicitud } });
        if (!solicitudBase) throw new BadRequestException(`Solicitud con id ${idSolicitud} no encontrada`);

        if (solicitudBase.Id_Tipo_Solicitud !== 5) throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud de agregar medidor`);
        if (solicitudBase.Tipo_Entidad !== 1) throw new BadRequestException(`La solicitud con id ${idSolicitud} no es una solicitud física`);

        const solicitudAgregarMedidor = await this.solicitudAgregarMedidorFisicaRepository.findOne({
            where: { Id_Solicitud: idSolicitud },
            relations: ['Nuevo_Medidor', 'Nuevo_Medidor.Estado_Medidor']
        });
        if (!solicitudAgregarMedidor) throw new BadRequestException(`Solicitud de agregar medidor física con id ${idSolicitud} no encontrada`);

        const datosAnteriores = {
            Nombre: solicitudAgregarMedidor.Nombre,
            Apellido1: solicitudAgregarMedidor.Apellido1,
            Apellido2: solicitudAgregarMedidor.Apellido2,
            Numero_Telefono: solicitudAgregarMedidor.Numero_Telefono,
            Correo: solicitudAgregarMedidor.Correo,
            Direccion_Exacta: solicitudAgregarMedidor.Direccion_Exacta,
            Planos_Terreno: solicitudAgregarMedidor.Planos_Terreno,
            Escritura_Terreno: solicitudAgregarMedidor.Escritura_Terreno,
            Id_Nuevo_Medidor: solicitudAgregarMedidor.Id_Nuevo_Medidor
        };

        solicitudAgregarMedidor.Nombre = dto.Nombre ?? solicitudAgregarMedidor.Nombre;
        solicitudAgregarMedidor.Apellido1 = dto.Apellido1 ?? solicitudAgregarMedidor.Apellido1;
        solicitudAgregarMedidor.Apellido2 = dto.Apellido2 ?? solicitudAgregarMedidor.Apellido2;
        solicitudAgregarMedidor.Numero_Telefono = dto.Numero_Telefono ?? solicitudAgregarMedidor.Numero_Telefono;
        solicitudAgregarMedidor.Correo = dto.Correo ?? solicitudAgregarMedidor.Correo;
        solicitudAgregarMedidor.Direccion_Exacta = dto.Direccion_Exacta ?? solicitudAgregarMedidor.Direccion_Exacta;
        solicitudAgregarMedidor.Id_Nuevo_Medidor = dto.Id_Nuevo_Medidor ?? solicitudAgregarMedidor.Id_Nuevo_Medidor;

        await this.solicitudAgregarMedidorFisicaRepository.save(solicitudAgregarMedidor);

        // Recargar con relaciones frescas para devolver datos actualizados
        const resultado = await this.solicitudAgregarMedidorFisicaRepository.findOne({
            where: { Id_Solicitud: idSolicitud },
            relations: ['Estado', 'Nuevo_Medidor', 'Nuevo_Medidor.Estado_Medidor']
        });
        if (!resultado) throw new BadRequestException(`Solicitud de agregar medidor física con id ${idSolicitud} no encontrada tras guardar`);

        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Nombre: solicitudAgregarMedidor.Nombre,
                Apellido1: solicitudAgregarMedidor.Apellido1,
                Apellido2: solicitudAgregarMedidor.Apellido2,
                Numero_Telefono: solicitudAgregarMedidor.Numero_Telefono,
                Correo: solicitudAgregarMedidor.Correo,
                Direccion_Exacta: solicitudAgregarMedidor.Direccion_Exacta,
                Planos_Terreno: solicitudAgregarMedidor.Planos_Terreno,
                Escritura_Terreno: solicitudAgregarMedidor.Escritura_Terreno,
                Id_Nuevo_Medidor: solicitudAgregarMedidor.Id_Nuevo_Medidor
            });
        } catch (error) {
            console.error('Error al registrar actualización de solicitud de agregar medidor en auditoría:', error);
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

        const solicitudAgregarMedidor = await this.solicitudAgregarMedidorFisicaRepository.findOne({
            where: { Id_Solicitud: idSolicitud },
            relations: ['Estado', 'Nuevo_Medidor', 'Nuevo_Medidor.Estado_Medidor']
        });
        if (!solicitudAgregarMedidor) throw new BadRequestException(`Solicitud de agregar medidor con id ${idSolicitud} no encontrada`);

        const nuevoEstado = await this.estadoSolicitudRepository.findOne({ where: { Id_Estado_Solicitud: idNuevoEstado } });
        if (!nuevoEstado) throw new BadRequestException(`Estado con id ${idNuevoEstado} no encontrado`);

        const nombre = `${solicitudAgregarMedidor.Nombre} ${solicitudAgregarMedidor.Apellido1 ?? ''} ${solicitudAgregarMedidor.Apellido2 ?? ''}`.trim();

        const datosAnteriores = {
            Tipo_Identificacion: solicitudAgregarMedidor.Tipo_Identificacion,
            Identificacion: solicitudAgregarMedidor.Identificacion,
            Nombre_Solicitante: nombre,
            Estado_Anterior: solicitudAgregarMedidor.Estado
        };

        // Estado 2 = En revisión
        if (idNuevoEstado === 2) await this.emailService.enviarEmailActualizacionEstado(solicitudAgregarMedidor.Correo, 'Agregar Medidor', 'En revisión', nombre);

        // Estado 3 = Aprobada y en espera
        if (idNuevoEstado === 3) await this.emailService.enviarEmailActualizacionEstado(solicitudAgregarMedidor.Correo, 'Agregar Medidor', 'Aprobada y en espera', nombre);

        // Estado 4 = Completada — asignar el nuevo medidor al afiliado (acumulativo)
        if (idNuevoEstado === 4) {
            // Asignar medidor PRIMERO antes del email para evitar que un fallo de email interrumpa la lógica
            if (solicitudAgregarMedidor.Id_Nuevo_Medidor) {
                const nuevoMedidor = await this.medidorRepository.findOne({
                    where: { Id_Medidor: solicitudAgregarMedidor.Id_Nuevo_Medidor },
                    relations: ['Estado_Medidor']
                });
                if (nuevoMedidor) {
                    const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Identificacion: solicitudAgregarMedidor.Identificacion } });
                    if (afiliado) {
                        const estadoInstalado = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor: 2 } }); // 2 = Instalado
                        nuevoMedidor.Afiliado = afiliado;
                        if (estadoInstalado) nuevoMedidor.Estado_Medidor = estadoInstalado;
                        await this.medidorRepository.save(nuevoMedidor);
                        console.log(`Nuevo medidor ${nuevoMedidor.Numero_Medidor} agregado al afiliado ${afiliado.Identificacion} y marcado como 'Instalado'`);
                    } else {
                        console.warn(`Afiliado físico con identificación ${solicitudAgregarMedidor.Identificacion} no encontrado para asignar nuevo medidor.`);
                    }
                } else {
                    console.warn(`Nuevo medidor con id ${solicitudAgregarMedidor.Id_Nuevo_Medidor} no encontrado.`);
                }
            }

            try {
                await this.emailService.enviarEmailActualizacionEstado(solicitudAgregarMedidor.Correo, 'Agregar Medidor', 'Completada', nombre);
            } catch (error) {
                console.error('Error al enviar email de completada para agregar medidor:', error);
            }
        }

        // Estado 5 = Rechazada
        if (idNuevoEstado === 5) {
            await this.emailService.enviarEmailSolicitudRechazada(
                solicitudAgregarMedidor.Correo,
                nombre,
                'Agregar Medidor',
                idSolicitud.toString(),
                motivoRechazo!
            );
        }

        solicitudAgregarMedidor.Estado = nuevoEstado;
        const resultado = await this.solicitudAgregarMedidorFisicaRepository.save(solicitudAgregarMedidor);

        try {
            await this.auditoriaService.logActualizacion('Solicitudes', idUsuario, idSolicitud, datosAnteriores, {
                Tipo_Identificacion: solicitudAgregarMedidor.Tipo_Identificacion,
                Identificacion: solicitudAgregarMedidor.Identificacion,
                Nombre_Solicitante: nombre,
                Estado_Nuevo: nuevoEstado.Nombre_Estado,
                ...(motivoRechazo && { Motivo_Rechazo: motivoRechazo })
            });
        } catch (error) {
            console.error('Error al actualizar estado de solicitud de agregar medidor:', error);
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



