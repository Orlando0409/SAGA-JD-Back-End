import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common";
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
import { Medidor } from "../Inventario/InventarioEntities/Medidor.Entity";

@Injectable()
export class AfiliadosService {
    constructor(
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

        @InjectRepository(Medidor)
        private readonly medidorRepository: Repository<Medidor>,

        @Inject(forwardRef(() => AuditoriaService))
        private readonly auditoriaService: AuditoriaService,

        @Inject(forwardRef(() => UsuariosService))
        private readonly usuariosService: UsuariosService,

        private readonly dropboxFilesService: DropboxFilesService,
    ) { }

    async getAfiliados() {
        const afiliados = await this.afiliadoRepository.createQueryBuilder('afiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Medidores', 'medidores')
            .leftJoinAndSelect('medidores.Estado_Medidor', 'estadoMedidor')
            .getMany();

        // Formatear cada afiliado según su tipo de entidad
        const afiliadosFormateados = await Promise.all(
            afiliados.map(async (afiliado) => {
                const afiliadoBase = {
                    ...afiliado,
                    ResumenMedidores: {
                        Total: afiliado.Medidores?.length || 0,
                        Activos: afiliado.Medidores?.filter(m => m.Estado_Medidor?.Id_Estado_Medidor === 1).length || 0,
                        Instalados: afiliado.Medidores?.filter(m => m.Estado_Medidor?.Id_Estado_Medidor === 2).length || 0,
                        Lista: afiliado.Medidores?.map(m => `Medidor N°${m.Numero_Medidor}`).join(', ') || 'Sin medidores'
                    }
                };

                // Agregar información específica según el tipo de entidad
                return await this.formatearAfiliadoSegunTipo(afiliadoBase);
            })
        );

        return afiliadosFormateados;
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
        if (!estadoInicial) { throw new BadRequestException('Estado inicial de afiliado no configurado'); }

        const tipoAfiliado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 1 } });
        if (!tipoAfiliado) { throw new BadRequestException(`Tipo de afiliado con ID ${1} no encontrado`); }

        // 1. Crear registro en tabla padre Afiliado
        const afiliado = this.afiliadoRepository.create({
            Correo: solicitud.Correo,
            Numero_Telefono: solicitud.Numero_Telefono,
            Direccion_Exacta: solicitud.Direccion_Exacta,
            Planos_Terreno: solicitud.Planos_Terreno,
            Escritura_Terreno: solicitud.Escritura_Terreno,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado,
            Tipo_Entidad: TipoEntidad.Física
        });
        const afiliadoGuardado = await this.afiliadoRepository.save(afiliado);

        // 2. Crear registro en tabla específica AfiliadoFisico
        const afiliadoFisico = this.afiliadoFisicoRepository.create({
            Id_Afiliado: afiliadoGuardado.Id_Afiliado,
            Correo: solicitud.Correo,
            Numero_Telefono: solicitud.Numero_Telefono,
            Direccion_Exacta: solicitud.Direccion_Exacta,
            Planos_Terreno: solicitud.Planos_Terreno,
            Escritura_Terreno: solicitud.Escritura_Terreno,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado,
            Tipo_Identificacion: solicitud.Tipo_Identificacion,
            Identificacion: solicitud.Identificacion,
            Nombre: solicitud.Nombre,
            Apellido1: solicitud.Apellido1,
            Apellido2: solicitud.Apellido2,
            Edad: solicitud.Edad
        });

        const afiliadoFisicoGuardado = await this.afiliadoFisicoRepository.save(afiliadoFisico);

        // 3. Buscar y vincular el medidor que estaba asignado a esta solicitud
        const medidor = await this.medidorRepository.findOne({
            where: { Id_Solicitud: solicitud.Id_Solicitud },
            relations: ['Estado_Medidor']
        });

        if (medidor) {
            // Asignar el medidor al nuevo afiliado
            medidor.Afiliado = afiliadoGuardado;
            await this.medidorRepository.save(medidor);

            console.log(`Medidor ${medidor.Numero_Medidor} vinculado exitosamente al afiliado físico ${solicitud.Identificacion}`);
        } else {
            console.warn(`No se encontró medidor asignado a la solicitud ${solicitud.Id_Solicitud} para vincular con el afiliado`);
        }

        return afiliadoFisicoGuardado;
    }

    async createAfiliadoFisico(dto: CreateAfiliadoFisicoDto, idUsuario: number, files: any) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario creador no existe.');

        // Verificar que no existe ya un afiliado físico con esa identificación
        const afiliadoExistente = await this.afiliadoFisicoRepository.findOne({ where: { Identificacion: dto.Identificacion } });
        if (afiliadoExistente) { throw new BadRequestException(`Ya existe un afiliado físico con la identificación ${dto.Identificacion}`); }

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) { throw new BadRequestException('Estado inicial de afiliado no configurado'); }

        const tipoAfiliado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 1 } });
        if (!tipoAfiliado) { throw new BadRequestException(`Tipo de afiliado con ID ${1} no encontrado`); }

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
        const afiliadoGuardado = await this.afiliadoRepository.save(afiliado);

        const afiliadoFisico = this.afiliadoFisicoRepository.create({
            Id_Afiliado: afiliadoGuardado.Id_Afiliado,
            ...dto,
            Planos_Terreno: planoRes?.url,
            Escritura_Terreno: escrituraRes?.url,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado
        });

        return this.afiliadoFisicoRepository.save(afiliadoFisico);
    }

    async createAfiliadoJuridicoFromSolicitud(solicitud: SolicitudAfiliacionJuridica) {
        // Verificar que no existe ya un afiliado jurídico con esa cédula jurídica
        const afiliadoExistente = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: solicitud.Cedula_Juridica } });
        if (afiliadoExistente) throw new BadRequestException(`Ya existe un afiliado jurídico con la cédula jurídica ${solicitud.Cedula_Juridica}`);

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) throw new BadRequestException('Estado inicial de afiliado no configurado');

        const tipoAfiliado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 1 } });
        if (!tipoAfiliado) throw new BadRequestException(`Tipo de afiliado con ID ${1} no encontrado`);

        // 1. Crear registro en tabla padre Afiliado
        const afiliado = this.afiliadoRepository.create({
            Correo: solicitud.Correo,
            Numero_Telefono: solicitud.Numero_Telefono,
            Direccion_Exacta: solicitud.Direccion_Exacta,
            Planos_Terreno: solicitud.Planos_Terreno,
            Escritura_Terreno: solicitud.Escritura_Terreno,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado,
            Tipo_Entidad: TipoEntidad.Jurídica
        });
        const afiliadoGuardado = await this.afiliadoRepository.save(afiliado);

        // 2. Crear registro en tabla específica AfiliadoJuridico
        const afiliadoJuridico = this.afiliadoJuridicoRepository.create({
            Id_Afiliado: afiliadoGuardado.Id_Afiliado,
            Correo: solicitud.Correo,
            Numero_Telefono: solicitud.Numero_Telefono,
            Direccion_Exacta: solicitud.Direccion_Exacta,
            Planos_Terreno: solicitud.Planos_Terreno,
            Escritura_Terreno: solicitud.Escritura_Terreno,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado,
            Cedula_Juridica: solicitud.Cedula_Juridica,
            Razon_Social: solicitud.Razon_Social
        });

        const afiliadoJuridicoGuardado = await this.afiliadoJuridicoRepository.save(afiliadoJuridico);

        // 3. Buscar y vincular el medidor que estaba asignado a esta solicitud
        const medidor = await this.medidorRepository.findOne({
            where: { Id_Solicitud: solicitud.Id_Solicitud },
            relations: ['Estado_Medidor']
        });

        if (medidor) {
            // Asignar el medidor al nuevo afiliado
            medidor.Afiliado = afiliadoGuardado;
            await this.medidorRepository.save(medidor);

            console.log(`Medidor ${medidor.Numero_Medidor} vinculado exitosamente al afiliado jurídico ${solicitud.Cedula_Juridica}`);
        } else {
            console.warn(`No se encontró medidor asignado a la solicitud ${solicitud.Id_Solicitud} para vincular con el afiliado`);
        }

        return afiliadoJuridicoGuardado;
    }

    async createAfiliadoJuridico(dto: CreateAfiliacionJuridicaDto, idUsuario: number, files: any) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario creador no existe.');

        // Verificar que no existe ya un afiliado jurídico con esa cédula jurídica
        const afiliadoExistente = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: dto.Cedula_Juridica } });
        if (afiliadoExistente) throw new BadRequestException(`Ya existe un afiliado jurídico con la cédula jurídica ${dto.Cedula_Juridica}`);

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) throw new BadRequestException('Estado inicial de afiliado no configurado');

        const tipoAfiliado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 1 } });
        if (!tipoAfiliado) throw new BadRequestException(`Tipo de afiliado con ID ${1} no encontrado`);

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
        const afiliadoGuardado = await this.afiliadoRepository.save(afiliado);

        const afiliadoJuridico = this.afiliadoJuridicoRepository.create({
            Id_Afiliado: afiliadoGuardado.Id_Afiliado,
            ...dto,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado,
            Planos_Terreno: planoRes?.url,
            Escritura_Terreno: escrituraRes?.url
        });

        return this.afiliadoJuridicoRepository.save(afiliadoJuridico);
    }

    async updateAfiliadoFisico(cedula: string, dto: UpdateAfiliadoFisicoDto, idUsuario: number, files?: any) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario creador no existe.');
        const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Identificacion: cedula } });
        if (!afiliado) { throw new BadRequestException(`Afiliado físico con cédula ${cedula} no encontrado`); }

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
        return this.afiliadoFisicoRepository.save(afiliado);
    }

    async updateAfiliadoJuridico(cedulaJuridica: string, dto: UpdateAfiliadoJuridicoDto, idUsuario: number, files?: any) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario creador no existe.');

        const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica } });
        if (!afiliado) { throw new BadRequestException(`Afiliado jurídico con cédula jurídica ${cedulaJuridica} no encontrado`); }

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
        return this.afiliadoJuridicoRepository.save(afiliado);
    }

    async updateEstadoAfiliadoFisico(idafiliado: number, nuevoEstadoId: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario creador no existe.');

        const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Id_Afiliado: idafiliado }, relations: ['Estado'] });
        if (!afiliado) { throw new BadRequestException(`Afiliado físico con ID ${idafiliado} no encontrado`); }

        const nuevoEstado = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: nuevoEstadoId } });
        if (!nuevoEstado) throw new BadRequestException(`Estado con ID ${nuevoEstadoId} no encontrado`);

        afiliado.Estado = nuevoEstado;
        return this.afiliadoFisicoRepository.save(afiliado);
    }

    async updateEstadoAfiliadoJuridico(idafiliado: number, nuevoEstadoId: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario creador no existe.');

        const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Id_Afiliado: idafiliado }, relations: ['Estado'] });
        if (!afiliado) { throw new BadRequestException(`Afiliado jurídico con ID ${idafiliado} no encontrado`); }

        const nuevoEstado = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: nuevoEstadoId } });
        if (!nuevoEstado) throw new BadRequestException(`Estado con ID ${nuevoEstadoId} no encontrado`);

        afiliado.Estado = nuevoEstado;
        return this.afiliadoJuridicoRepository.save(afiliado);
    }

    async updateTipoAfiliadoFisico(idAfiliado: number, nuevoTipoId: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario creador no existe.');

        const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Id_Afiliado: idAfiliado }, relations: ['Tipo_Afiliado'] });
        if (!afiliado) { throw new BadRequestException(`Afiliado físico con ID ${idAfiliado} no encontrado`); }

        // Validar que el nuevo tipo sea diferente al actual
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado === nuevoTipoId) {
            throw new BadRequestException(`El afiliado ya tiene el tipo con ID ${nuevoTipoId}`);
        }

        // Validar que el tipo de destino exista
        const nuevoTipo = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: nuevoTipoId } });
        if (!nuevoTipo) throw new BadRequestException(`Tipo de afiliado con ID ${nuevoTipoId} no encontrado`);

        // Validar transiciones válidas (solo de Abonado a Asociado por ahora)
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado === 1 && nuevoTipoId !== 2) throw new BadRequestException(`Solo se puede cambiar de Abonado (ID=1) a Asociado (ID=2)`);

        afiliado.Tipo_Afiliado = nuevoTipo;
        return this.afiliadoFisicoRepository.save(afiliado);
    }

    async updateTipoAfiliadoJuridico(idAfiliado: number, nuevoTipoId: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario creador no existe.');

        const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Id_Afiliado: idAfiliado }, relations: ['Tipo_Afiliado'] });
        if (!afiliado) { throw new BadRequestException(`Afiliado jurídico con ID ${idAfiliado} no encontrado`); }

        // Validar que el nuevo tipo sea diferente al actual
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado === nuevoTipoId) throw new BadRequestException(`El afiliado ya tiene el tipo con ID ${nuevoTipoId}`);

        // Validar que el tipo de destino exista
        const nuevoTipo = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: nuevoTipoId } });
        if (!nuevoTipo) throw new BadRequestException(`Tipo de afiliado con ID ${nuevoTipoId} no encontrado`);

        // Validar transiciones válidas (solo de Abonado a Asociado por ahora)
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado === 1 && nuevoTipoId !== 2) throw new BadRequestException(`Solo se puede cambiar de Abonado (ID=1) a Asociado (ID=2)`);

        afiliado.Tipo_Afiliado = nuevoTipo;
        return this.afiliadoJuridicoRepository.save(afiliado);
    }

    // Métodos para cambiar afiliado a asociado basado en solicitud de asociado aprobada
    async cambiarAbonadoAAsociadoFisico(identificacion: string, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario creador no existe.');

        const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Identificacion: identificacion }, relations: ['Tipo_Afiliado'] });
        if (!afiliado) {
            throw new BadRequestException(`No existe un afiliado físico con la identificación ${identificacion}`);
        }

        // Verificar que es abonado (ID 1) antes de cambiar a asociado (ID 2)
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado !== 1) throw new BadRequestException(`El afiliado con identificación ${identificacion} ya es asociado o tiene otro tipo`);

        const tipoAsociado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 2 } });
        if (!tipoAsociado) throw new BadRequestException('Tipo "Asociado" no configurado');

        afiliado.Tipo_Afiliado = tipoAsociado;
        return this.afiliadoFisicoRepository.save(afiliado);
    }

    async cambiarAbonadoAAsociadoJuridico(cedulaJuridica: string, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario creador no existe.');

        const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica }, relations: ['Tipo_Afiliado'] });
        if (!afiliado) { throw new BadRequestException(`No existe un afiliado jurídico con la cédula ${cedulaJuridica}`); }

        // Verificar que es abonado (ID 1) antes de cambiar a asociado (ID 2)
        if (afiliado.Tipo_Afiliado.Id_Tipo_Afiliado !== 1) throw new BadRequestException(`El afiliado con cédula jurídica ${cedulaJuridica} ya es asociado o tiene otro tipo`);

        const tipoAsociado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 2 } });
        if (!tipoAsociado) throw new BadRequestException('Tipo "Asociado" no configurado');

        afiliado.Tipo_Afiliado = tipoAsociado;
        return this.afiliadoJuridicoRepository.save(afiliado);
    }

    // MÉTODOS DE FORMATEO POR TIPO DE ENTIDAD
    private async formatearAfiliadoSegunTipo(afiliadoBase: any) {
        switch (afiliadoBase.Tipo_Entidad) {
            case TipoEntidad.Física:
                return await this.formatearAfiliadoFisico(afiliadoBase);
            case TipoEntidad.Jurídica:
                return await this.formatearAfiliadoJuridico(afiliadoBase);
            default:
                return {
                    ...afiliadoBase,
                    DetallesEspecificos: 'Tipo de entidad no especificado',
                    TipoFormateado: 'Desconocido'
                };
        }
    }

    private async formatearAfiliadoFisico(afiliadoBase: any) {
        // Buscar información específica del afiliado físico
        const afiliadoFisico = await this.afiliadoFisicoRepository.findOne({
            where: { Id_Afiliado: afiliadoBase.Id_Afiliado }
        });

        if (!afiliadoFisico) {
            return {
                ...afiliadoBase,
                TipoFormateado: 'Persona Física',
                DetallesEspecificos: 'Información específica no encontrada',
                InformacionPersonal: null
            };
        }

        return {
            ...afiliadoBase,
            Tipo_Identificacion: afiliadoFisico.Tipo_Identificacion,
            Identificacion: afiliadoFisico.Identificacion,
            Nombre: afiliadoFisico.Nombre,
            Primer_Apellido: afiliadoFisico.Apellido1,
            Segundo_Apellido: afiliadoFisico.Apellido2 === 'No Proporcionado' ? null : afiliadoFisico.Apellido2,
            Edad: afiliadoFisico.Edad,
        };
    }

    private async formatearAfiliadoJuridico(afiliadoBase: any) {
        // Buscar información específica del afiliado jurídico
        const afiliadoJuridico = await this.afiliadoJuridicoRepository.findOne({
            where: { Id_Afiliado: afiliadoBase.Id_Afiliado }
        });

        if (!afiliadoJuridico) {
            return {
                ...afiliadoBase,
                TipoFormateado: 'Persona Jurídica',
                DetallesEspecificos: 'Información específica no encontrada',
                InformacionEmpresarial: null
            };
        }

        return {
            ...afiliadoBase,
            Cedula_Juridica: afiliadoJuridico.Cedula_Juridica,
            Razon_Social: afiliadoJuridico.Razon_Social,
        };
    }
      async FormatearAfiliadoParaResponseSimple(afiliado: any) {
        if (!afiliado) return null;

        const afiliadoFormateado = {
            Id_Afiliado: afiliado.Id_Afiliado,
            Tipo_Entidad: afiliado.Tipo_Entidad,
            Correo: afiliado.Correo,
            Numero: afiliado.Numero_Telefono
        };

        if (afiliado.Tipo_Entidad === 1) {
            // Afiliado Físico - buscar en tabla específica
            const afiliadoFisico = await this.afiliadoFisicoRepository.findOne({
                where: { Id_Afiliado: afiliado.Id_Afiliado }
            });

            if (afiliadoFisico) {
                (afiliadoFormateado as any).Tipo_Identificacion = afiliadoFisico.Tipo_Identificacion;
                (afiliadoFormateado as any).Identificacion = afiliadoFisico.Identificacion;
                (afiliadoFormateado as any).Nombre = afiliadoFisico.Nombre;
                (afiliadoFormateado as any).Primer_Apellido = afiliadoFisico.Apellido1;
                (afiliadoFormateado as any).Segundo_Apellido = afiliadoFisico.Apellido2;
            }
        } else if (afiliado.Tipo_Entidad === 2) {
            // Afiliado Jurídico - buscar en tabla específica
            const afiliadoJuridico = await this.afiliadoJuridicoRepository.findOne({
                where: { Id_Afiliado: afiliado.Id_Afiliado }
            });

            if (afiliadoJuridico) {
                (afiliadoFormateado as any).Cedula_Juridica = afiliadoJuridico.Cedula_Juridica;
                (afiliadoFormateado as any).Razon_Social = afiliadoJuridico.Razon_Social;
            }
        }

        return afiliadoFormateado;
      }
}