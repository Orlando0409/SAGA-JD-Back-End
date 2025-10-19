import { BadRequestException, Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from "./AfiliadoEntities/Afiliado.Entity";
import { EstadoAfiliado } from "./AfiliadoEntities/EstadoAfiliado.Entity";
import { SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica } from "src/Modules/Solicitudes/SolicitudEntities/Solicitud.Entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UpdateAfiliadoFisicoDto, UpdateAfiliadoJuridicoDto } from "./AfiliadoDTO's/UpdateAfiliado.dto";
import { TipoAfiliado } from "./AfiliadoEntities/TipoAfiliado.Entity";
import { CreateAfiliadoFisicoDto } from "./AfiliadoDTO's/CreateAfiliado.dto";
import { CreateAfiliacionJuridicaDto } from "src/Modules/Solicitudes/SolicitudDTO's/CreateSolicitudJuridica.dto";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { TipoEntidad } from "src/Common/Enums/TipoEntidad.enum";
import { AuditoriaService } from "../Auditoria/auditoria.service";
import { UsuariosService } from "../Usuarios/Services/usuarios.service";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";

@Injectable()
export class AfiliadosService {
    constructor (
        @InjectRepository(Afiliado)
        private readonly afiliadoRepository: Repository<Afiliado>,

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

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly auditoriaService: AuditoriaService,

        private readonly usuariosService: UsuariosService,
    ) {}

    async getAfiliados() {
        const afiliados = await this.afiliadoRepository.createQueryBuilder('afiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Medidores', 'medidores')
            .leftJoinAndSelect('medidores.Estado_Medidor', 'estadoMedidor')
            .getMany();

        return afiliados.map(afiliado => ({
            ...afiliado,
            ResumenMedidores: {
                Total: afiliado.Medidores?.length || 0,
                Activos: afiliado.Medidores?.filter(m => m.Estado_Medidor?.Id_Estado_Medidor === 1).length || 0,
                Instalados: afiliado.Medidores?.filter(m => m.Estado_Medidor?.Id_Estado_Medidor === 2).length || 0,
                Lista: afiliado.Medidores?.map(m => `Medidor N°${m.Numero_Medidor}`).join(', ') || 'Sin medidores'
            }
        }));
    }

    async getAfiliadosFisicos() {
        const afiliados = await this.afiliadoFisicoRepository.createQueryBuilder('afiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Medidores', 'medidores')
            .leftJoinAndSelect('medidores.Estado_Medidor', 'estadoMedidor')
            .getMany();

        return afiliados.map(afiliado => ({
            ...afiliado,
            ResumenMedidores: {
                Total: afiliado.Medidores?.length || 0,
                Activos: afiliado.Medidores?.filter(m => m.Estado_Medidor?.Id_Estado_Medidor === 1).length || 0,
                Instalados: afiliado.Medidores?.filter(m => m.Estado_Medidor?.Id_Estado_Medidor === 2).length || 0,
                Lista: afiliado.Medidores?.map(m => `Medidor N°${m.Numero_Medidor}`).join(', ') || 'Sin medidores'
            }
        }));
    }

    async getAfiliadosJuridicos() {
        const afiliados = await this.afiliadoJuridicoRepository.createQueryBuilder('afiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Medidores', 'medidores')
            .leftJoinAndSelect('medidores.Estado_Medidor', 'estadoMedidor')
            .getMany();

        return afiliados.map(afiliado => ({
            ...afiliado,
            ResumenMedidores: {
                Total: afiliado.Medidores?.length || 0,
                Activos: afiliado.Medidores?.filter(m => m.Estado_Medidor?.Id_Estado_Medidor === 1).length || 0,
                Instalados: afiliado.Medidores?.filter(m => m.Estado_Medidor?.Id_Estado_Medidor === 2).length || 0,
                Lista: afiliado.Medidores?.map(m => `Medidor N°${m.Numero_Medidor}`).join(', ') || 'Sin medidores'
            }
        }));
    }

    async createAfiliadoFisicoFromSolicitud(solicitud: SolicitudAfiliacionFisica) {
        // Verificar que no existe ya un afiliado físico con esa cédula
        const afiliadoExistente = await this.afiliadoFisicoRepository.findOne({ where: { Identificacion: solicitud.Identificacion } });
        if (afiliadoExistente) throw new BadRequestException(`Ya existe un afiliado físico con la identificación ${solicitud.Identificacion}`);

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) throw new BadRequestException('Estado inicial de afiliado no configurado');

        const tipoAfiliado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 1 } });
        if (!tipoAfiliado) throw new BadRequestException(`Tipo de afiliado con ID ${1} no encontrado`);

        const afiliado = this.afiliadoFisicoRepository.create({
            ...solicitud,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado
        });

        return this.afiliadoFisicoRepository.save(afiliado);
    }

    async createAfiliadoFisico(dto: CreateAfiliadoFisicoDto, idUsuario: number, files: any) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        // Verificar que no existe ya un afiliado físico con esa identificación
        const afiliadoExistente = await this.afiliadoFisicoRepository.findOne({ where: { Identificacion: dto.Identificacion } });
        if (afiliadoExistente) throw new ConflictException(`Ya existe un afiliado físico con la identificación ${dto.Identificacion}`);

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) throw new NotFoundException('Estado inicial de afiliado no configurado');

        const tipoAfiliado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 1 } });
        if (!tipoAfiliado) throw new NotFoundException(`Tipo de afiliado con ID ${1} no encontrado`);

        const planoFile = files.Planos_Terreno?.[0];
        const escrituraFile = files.Escritura_Terreno?.[0];
        const nombre = `${dto.Nombre} ${dto.Apellido1 ?? ''} `.trim();

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Afiliacion', 'Fisicas', dto.Identificacion, nombre) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Afiliacion', 'Fisicas', dto.Identificacion, nombre) : null;

        const afiliado = this.afiliadoRepository.create({
            ...dto,
            Planos_Terreno: planoRes?.url,
            Escritura_Terreno: escrituraRes?.url,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado,
            Tipo_Entidad: TipoEntidad.Física
        });
        await this.afiliadoRepository.save(afiliado);

        const afiliadoFisico = this.afiliadoFisicoRepository.create({
            ...dto,
            Planos_Terreno: planoRes?.url,
            Escritura_Terreno: escrituraRes?.url,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado
        });

        const afiliadoGuardado = await this.afiliadoFisicoRepository.save(afiliadoFisico);

        // Formatear afiliado para auditoría (sin info sensible del usuario)
        const afiliadoParaAuditoria = await this.FormatearAfiliadoParaResponse(afiliadoGuardado);
        await this.auditoriaService.logCreacion('afiliados', idUsuario, afiliadoGuardado.Id_Afiliado, { afiliado: afiliadoParaAuditoria });

        return afiliadoGuardado;
    }

    async createAfiliadoJuridicoFromSolicitud(solicitud: SolicitudAfiliacionJuridica) {
        // Verificar que no existe ya un afiliado jurídico con esa cédula jurídica
        const afiliadoExistente = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: solicitud.Cedula_Juridica } });
        if (afiliadoExistente) throw new BadRequestException(`Ya existe un afiliado jurídico con la cédula jurídica ${solicitud.Cedula_Juridica}`);

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) throw new BadRequestException('Estado inicial de afiliado no configurado');

        const tipoAfiliado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 1 } });
        if (!tipoAfiliado) throw new BadRequestException(`Tipo de afiliado con ID ${1} no encontrado`);

        const afiliado = this.afiliadoJuridicoRepository.create({
            ...solicitud,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado
        });

        return this.afiliadoJuridicoRepository.save(afiliado);
    }

    async createAfiliadoJuridico(dto: CreateAfiliacionJuridicaDto, idUsuario: number, files: any) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        // Verificar que no existe ya un afiliado jurídico con esa cédula jurídica
        const afiliadoExistente = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: dto.Cedula_Juridica } });
        if (afiliadoExistente) throw new ConflictException(`Ya existe un afiliado jurídico con la cédula jurídica ${dto.Cedula_Juridica}`);

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) throw new NotFoundException('Estado inicial de afiliado no configurado');

        const tipoAfiliado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 1 } });
        if (!tipoAfiliado) throw new NotFoundException(`Tipo de afiliado con ID ${1} no encontrado`);

        const planoFile = files.Planos_Terreno?.[0];
        const escrituraFile = files.Escritura_Terreno?.[0];

        const planoRes = planoFile ? await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Afiliacion', 'Juridicas', dto.Cedula_Juridica, dto.Razon_Social) : null;
        const escrituraRes = escrituraFile ? await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Afiliacion', 'Juridicas', dto.Cedula_Juridica, dto.Razon_Social) : null;

        const afiliado = this.afiliadoRepository.create({
            ...dto,
            Planos_Terreno: planoRes?.url,
            Escritura_Terreno: escrituraRes?.url,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado,
            Tipo_Entidad: TipoEntidad.Jurídica
        });
        await this.afiliadoRepository.save(afiliado);

        const afiliadoJuridico = this.afiliadoJuridicoRepository.create({
            ...dto,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado,
            Planos_Terreno: planoRes?.url,
            Escritura_Terreno: escrituraRes?.url
        });

        const afiliadoGuardado = await this.afiliadoJuridicoRepository.save(afiliadoJuridico);

        // Formatear afiliado para auditoría (sin info sensible del usuario)
        const afiliadoParaAuditoria = await this.FormatearAfiliadoParaResponse(afiliadoGuardado);
        await this.auditoriaService.logCreacion('afiliados', idUsuario, afiliadoGuardado.Id_Afiliado, { afiliado: afiliadoParaAuditoria });

        return afiliadoGuardado;
    }

    async updateAfiliadoFisico(cedula: string, dto: UpdateAfiliadoFisicoDto, idUsuario: number, files?: any) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Identificacion: cedula }, relations: ['Estado', 'Tipo_Afiliado'] });
        if (!afiliado) throw new NotFoundException(`Afiliado físico con cédula ${cedula} no encontrado`);

        const datosAnteriores = { ...afiliado };

        if (files) {
            const planoFile = files.Planos_Terreno?.[0];
            const escrituraFile = files.Escritura_Terreno?.[0];

            if (planoFile) {
                const planoRes = await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Afiliacion', 'Fisicas', cedula);
                afiliado.Planos_Terreno = planoRes?.url;
            }

            if (escrituraFile) {
                const escrituraRes = await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Afiliacion', 'Fisicas', cedula);
                afiliado.Escritura_Terreno = escrituraRes?.url;
            }
        }

        Object.assign(afiliado, dto);
        const afiliadoActualizado = await this.afiliadoFisicoRepository.save(afiliado);

        // Formatear los datos para auditoría (sin info sensible del usuario)
        const datosAnterioresFormateados = await this.FormatearAfiliadoParaResponse(datosAnteriores as AfiliadoFisico);
        const afiliadoParaAuditoria = await this.FormatearAfiliadoParaResponse(afiliadoActualizado);
        await this.auditoriaService.logActualizacion('afiliados', idUsuario, afiliadoActualizado.Id_Afiliado, datosAnterioresFormateados, { afiliado: afiliadoParaAuditoria });

        return afiliadoActualizado;
    }

    async updateAfiliadoJuridico(cedulaJuridica: string, dto: UpdateAfiliadoJuridicoDto, idUsuario: number, files?: any) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica }, relations: ['Estado', 'Tipo_Afiliado'] });
        if (!afiliado) throw new NotFoundException(`Afiliado jurídico con cédula jurídica ${cedulaJuridica} no encontrado`);

        const datosAnteriores = { ...afiliado };

        if (files) {
            const planoFile = files.Planos_Terreno?.[0];
            const escrituraFile = files.Escritura_Terreno?.[0];

            if (planoFile) {
                const planoRes = await this.dropboxFilesService.uploadFile(planoFile, 'Solicitudes-Afiliacion', 'Juridicas', cedulaJuridica);
                afiliado.Planos_Terreno = planoRes?.url;
            }

            if (escrituraFile) {
                const escrituraRes = await this.dropboxFilesService.uploadFile(escrituraFile, 'Solicitudes-Afiliacion', 'Juridicas', cedulaJuridica);
                afiliado.Escritura_Terreno = escrituraRes?.url;
            }
        }

        Object.assign(afiliado, dto);
        const afiliadoActualizado = await this.afiliadoJuridicoRepository.save(afiliado);

        // Formatear los datos para auditoría (sin info sensible del usuario)
        const datosAnterioresFormateados = await this.FormatearAfiliadoParaResponse(datosAnteriores as AfiliadoJuridico);
        const afiliadoParaAuditoria = await this.FormatearAfiliadoParaResponse(afiliadoActualizado);
        await this.auditoriaService.logActualizacion('afiliados', idUsuario, afiliadoActualizado.Id_Afiliado, datosAnterioresFormateados, { afiliado: afiliadoParaAuditoria });

        return afiliadoActualizado;
    }

    async updateEstadoAfiliadoFisico(idafiliado: number, nuevoEstadoId: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Id_Afiliado: idafiliado }, relations: ['Estado', 'Tipo_Afiliado'] });
        if (!afiliado) throw new NotFoundException(`Afiliado físico con ID ${idafiliado} no encontrado`);

        const nuevoEstado = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: nuevoEstadoId } });
        if (!nuevoEstado) throw new NotFoundException(`Estado con ID ${nuevoEstadoId} no encontrado`);

        const datosAnteriores = { ...afiliado };

        afiliado.Estado = nuevoEstado;
        const afiliadoActualizado = await this.afiliadoFisicoRepository.save(afiliado);

        // Formatear los datos para auditoría (sin info sensible del usuario)
        const datosAnterioresFormateados = await this.FormatearAfiliadoParaResponse(datosAnteriores);
        const afiliadoParaAuditoria = await this.FormatearAfiliadoParaResponse(afiliadoActualizado);
        await this.auditoriaService.logActualizacion('afiliados', idUsuario, afiliadoActualizado.Id_Afiliado, datosAnterioresFormateados, { afiliado: afiliadoParaAuditoria });

        return afiliadoActualizado;
    }

    async updateEstadoAfiliadoJuridico(idafiliado: number, nuevoEstadoId: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Id_Afiliado: idafiliado }, relations: ['Estado', 'Tipo_Afiliado'] });
        if (!afiliado) throw new NotFoundException(`Afiliado jurídico con ID ${idafiliado} no encontrado`);

        const nuevoEstado = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: nuevoEstadoId } });
        if (!nuevoEstado) throw new NotFoundException(`Estado con ID ${nuevoEstadoId} no encontrado`);

        const datosAnteriores = { ...afiliado };

        afiliado.Estado = nuevoEstado;
        const afiliadoActualizado = await this.afiliadoJuridicoRepository.save(afiliado);

        // Formatear los datos para auditoría (sin info sensible del usuario)
        const datosAnterioresFormateados = await this.FormatearAfiliadoParaResponse(datosAnteriores);
        const afiliadoParaAuditoria = await this.FormatearAfiliadoParaResponse(afiliadoActualizado);
        await this.auditoriaService.logActualizacion('afiliados', idUsuario, afiliadoActualizado.Id_Afiliado, datosAnterioresFormateados, { afiliado: afiliadoParaAuditoria });

        return afiliadoActualizado;
    }

    async updateTipoAfiliadoFisico(idAfiliado: number, nuevoTipoId: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Id_Afiliado: idAfiliado }, relations: ['Estado', 'Tipo_Afiliado'] });
        if (!afiliado) throw new NotFoundException(`Afiliado físico con ID ${idAfiliado} no encontrado`);

        // Validar que el nuevo tipo sea diferente al actual
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado === nuevoTipoId) {
            throw new BadRequestException(`El afiliado ya tiene el tipo con ID ${nuevoTipoId}`);
        }

        // Validar que el tipo de destino exista
        const nuevoTipo = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: nuevoTipoId } });
        if (!nuevoTipo) throw new NotFoundException(`Tipo de afiliado con ID ${nuevoTipoId} no encontrado`);

        // Validar transiciones válidas (solo de Abonado a Asociado por ahora)
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado === 1 && nuevoTipoId !== 2) {
            throw new BadRequestException(`Solo se puede cambiar de Abonado (ID=1) a Asociado (ID=2)`);
        }

        const datosAnteriores = { ...afiliado };

        afiliado.Tipo_Afiliado = nuevoTipo;
        const afiliadoActualizado = await this.afiliadoFisicoRepository.save(afiliado);

        // Formatear los datos para auditoría (sin info sensible del usuario)
        const datosAnterioresFormateados = await this.FormatearAfiliadoParaResponse(datosAnteriores);
        const afiliadoParaAuditoria = await this.FormatearAfiliadoParaResponse(afiliadoActualizado);
        await this.auditoriaService.logActualizacion('afiliados', idUsuario, afiliadoActualizado.Id_Afiliado, datosAnterioresFormateados, { afiliado: afiliadoParaAuditoria });

        return afiliadoActualizado;
    }

    async updateTipoAfiliadoJuridico(idAfiliado: number, nuevoTipoId: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Id_Afiliado: idAfiliado }, relations: ['Estado', 'Tipo_Afiliado'] });
        if (!afiliado) throw new NotFoundException(`Afiliado jurídico con ID ${idAfiliado} no encontrado`);

        // Validar que el nuevo tipo sea diferente al actual
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado === nuevoTipoId) {
            throw new BadRequestException(`El afiliado ya tiene el tipo con ID ${nuevoTipoId}`);
        }

        // Validar que el tipo de destino exista
        const nuevoTipo = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: nuevoTipoId } });
        if (!nuevoTipo) throw new NotFoundException(`Tipo de afiliado con ID ${nuevoTipoId} no encontrado`);

        // Validar transiciones válidas (solo de Abonado a Asociado por ahora)
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado === 1 && nuevoTipoId !== 2) {
            throw new BadRequestException(`Solo se puede cambiar de Abonado (ID=1) a Asociado (ID=2)`);
        }

        const datosAnteriores = { ...afiliado };

        afiliado.Tipo_Afiliado = nuevoTipo;
        const afiliadoActualizado = await this.afiliadoJuridicoRepository.save(afiliado);

        // Formatear los datos para auditoría (sin info sensible del usuario)
        const datosAnterioresFormateados = await this.FormatearAfiliadoParaResponse(datosAnteriores);
        const afiliadoParaAuditoria = await this.FormatearAfiliadoParaResponse(afiliadoActualizado);
        await this.auditoriaService.logActualizacion('afiliados', idUsuario, afiliadoActualizado.Id_Afiliado, datosAnterioresFormateados, { afiliado: afiliadoParaAuditoria });

        return afiliadoActualizado;
    }

    // Métodos para cambiar afiliado a asociado basado en solicitud de asociado aprobada
    async cambiarAbonadoAAsociadoFisico(identificacion: string, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Identificacion: identificacion }, relations: ['Estado', 'Tipo_Afiliado'] });
        if (!afiliado) throw new NotFoundException(`No existe un afiliado físico con la identificación ${identificacion}`);

        // Verificar que es abonado (ID 1) antes de cambiar a asociado (ID 2)
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado !== 1) throw new BadRequestException(`El afiliado con identificación ${identificacion} ya es asociado o tiene otro tipo`);

        const tipoAsociado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 2 } });
        if (!tipoAsociado) throw new NotFoundException('Tipo "Asociado" no configurado');

        afiliado.Tipo_Afiliado = tipoAsociado;
        return this.afiliadoFisicoRepository.save(afiliado);
    }

    async cambiarAbonadoAAsociadoJuridico(cedulaJuridica: string, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica }, relations: ['Estado', 'Tipo_Afiliado'] });
        if (!afiliado) throw new NotFoundException(`No existe un afiliado jurídico con la cédula ${cedulaJuridica}`);

        // Verificar que es abonado (ID 1) antes de cambiar a asociado (ID 2)
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado !== 1) throw new BadRequestException(`El afiliado con cédula jurídica ${cedulaJuridica} ya es asociado o tiene otro tipo`);

        const tipoAsociado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 2 } });
        if (!tipoAsociado) throw new NotFoundException('Tipo "Asociado" no configurado');

        afiliado.Tipo_Afiliado = tipoAsociado;
        return this.afiliadoJuridicoRepository.save(afiliado);
    }

    // Método para formatear datos de afiliado antes de auditoría (excluir información sensible)
    private async FormatearAfiliadoParaResponse(afiliado: any): Promise<any> {
        if (!afiliado) return null;

        // Crear copia del afiliado sin las URLs de archivos sensibles
        const afiliadoFormateado = {
            Id_Afiliado: afiliado.Id_Afiliado,
            Tipo_Entidad: afiliado.Tipo_Entidad,
            Correo: afiliado.Correo,
            Numero_Telefono: afiliado.Numero_Telefono,
            Direccion_Exacta: afiliado.Direccion_Exacta,
            Fecha_Creacion: afiliado.Fecha_Creacion,
            Fecha_Actualizacion: afiliado.Fecha_Actualizacion,
            // No incluir Planos_Terreno ni Escritura_Terreno por seguridad
            Estado: afiliado.Estado ? {
                Id_Estado_Afiliado: afiliado.Estado.Id_Estado_Afiliado,
                Nombre_Estado: afiliado.Estado.Nombre_Estado
            } : null,
            Tipo_Afiliado: afiliado.Tipo_Afiliado ? {
                Id_Tipo_Afiliado: afiliado.Tipo_Afiliado.Id_Tipo_Afiliado,
                Nombre_Tipo_Afiliado: afiliado.Tipo_Afiliado.Nombre_Tipo_Afiliado
            } : null
        };

        // Agregar campos específicos según el tipo
        if (afiliado.Identificacion) {
            // AfiliadoFisico
            (afiliadoFormateado as any).Tipo_Identificacion = afiliado.Tipo_Identificacion;
            (afiliadoFormateado as any).Identificacion = afiliado.Identificacion;
            (afiliadoFormateado as any).Nombre = afiliado.Nombre;
            (afiliadoFormateado as any).Apellido1 = afiliado.Apellido1;
            (afiliadoFormateado as any).Apellido2 = afiliado.Apellido2;
            (afiliadoFormateado as any).Edad = afiliado.Edad;
        } else if (afiliado.Cedula_Juridica) {
            // AfiliadoJuridico
            (afiliadoFormateado as any).Cedula_Juridica = afiliado.Cedula_Juridica;
            (afiliadoFormateado as any).Razon_Social = afiliado.Razon_Social;
            // No incluir Personalidad_Juridica por seguridad
        }

        return afiliadoFormateado;
    }
}