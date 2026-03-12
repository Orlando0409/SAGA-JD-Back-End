import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from "./AfiliadoEntities/Afiliado.Entity";
import { EstadoAfiliado } from "./AfiliadoEntities/EstadoAfiliado.Entity";
import { SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica } from "src/Modules/Solicitudes/SolicitudEntities/Solicitud.Entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UpdateAfiliadoFisicoDto, UpdateAfiliadoJuridicoDto } from "./AfiliadoDTO's/UpdateAfiliado.dto";
import { TipoAfiliado } from "./AfiliadoEntities/TipoAfiliado.Entity";
import { CreateAfiliadoFisicoDto, CreateAfiliadoJuridicoDto } from "./AfiliadoDTO's/CreateAfiliado.dto";
import { CreateAfiliacionJuridicaDto } from "src/Modules/Solicitudes/SolicitudDTO's/CreateSolicitudJuridica.dto";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { TipoEntidad } from "src/Common/Enums/TipoEntidad.enum";
import { AuditoriaService } from "../Auditoria/auditoria.service";
import { UsuariosService } from "../Usuarios/Services/usuarios.service";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { Medidor } from "../Inventario/InventarioEntities/Medidor.Entity";
import { EstadoMedidor } from "../Inventario/InventarioEntities/EstadoMedidor.Entity";
import { OpcionMedidor } from "src/Common/Enums/OpcionMedidor.enum";

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

        @InjectRepository(EstadoMedidor)
        private readonly estadoMedidorRepository: Repository<EstadoMedidor>,

        @Inject(forwardRef(() => AuditoriaService))
        private readonly auditoriaService: AuditoriaService,

        @Inject(forwardRef(() => UsuariosService))
        private readonly usuariosService: UsuariosService,

        private readonly dropboxFilesService: DropboxFilesService,
    ) { }



    //METODOS PUBLICOS PARA LOS MEDIDORES EN SOLICITUDES 

    //FISICOS
    async getMedidoresbyIdentificacion(identificacion: string) {
        const afiliado = await this.afiliadoFisicoRepository.findOne({
            where: { Identificacion: identificacion },
            relations: ['Medidores', 'Medidores.Estado_Medidor']
        });

        if (!afiliado) throw new BadRequestException(`Afiliado físico con identificación ${identificacion} no encontrado`);

        return {
            Nombre: `${afiliado.Nombre} ${afiliado.Apellido1} ${afiliado.Apellido2}`.trim(),
            Identificación: afiliado.Identificacion,
            Medidores: afiliado.Medidores?.map(m => ({
                Id_Medidor: m.Id_Medidor,
                Numero_Medidor: m.Numero_Medidor,
                Estado: m.Estado_Medidor?.Nombre_Estado_Medidor ?? 'Sin estado'
            })) ?? []
        }
    }

    //JURIDICOS
    async getMedidoresbyCedulaJuridica(cedulaJuridica: string) {
        const afiliado = await this.afiliadoJuridicoRepository.findOne({
            where: { Cedula_Juridica: cedulaJuridica },
            relations: ['Medidores', 'Medidores.Estado_Medidor']
        });

        if (!afiliado) throw new BadRequestException(`Afiliado jurídico con cédula ${cedulaJuridica} no encontrado`);

        return {
            Razon_Social: afiliado.Razon_Social,
            Cédula_Jurídica: afiliado.Cedula_Juridica,
            Medidores: afiliado.Medidores?.map(m => ({
                Id_Medidor: m.Id_Medidor,
                Numero_Medidor: m.Numero_Medidor,
                Estado: m.Estado_Medidor?.Nombre_Estado_Medidor ?? 'Sin estado'
            })) ?? []
        }
    }



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
            Medidores: afiliado.Medidores?.map(m => ({
                Id_Medidor: m.Id_Medidor,
                Numero_Medidor: m.Numero_Medidor,
                Planos_Terreno: m.Planos_Terreno ?? null,
                Escritura_Terreno: m.Escritura_Terreno ?? null,
                Estado: {
                    Id_Estado: m.Estado_Medidor?.Id_Estado_Medidor ?? null,
                    Nombre_Estado: m.Estado_Medidor?.Nombre_Estado_Medidor ?? 'Sin estado'
                }
            })) ?? [],
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
            Medidores: afiliado.Medidores?.map(m => ({
                Id_Medidor: m.Id_Medidor,
                Numero_Medidor: m.Numero_Medidor,
                Planos_Terreno: m.Planos_Terreno ?? null,
                Escritura_Terreno: m.Escritura_Terreno ?? null,
                Estado: {
                    Id_Estado: m.Estado_Medidor?.Id_Estado_Medidor ?? null,
                    Nombre_Estado: m.Estado_Medidor?.Nombre_Estado_Medidor ?? 'Sin estado'
                }
            })) ?? [],
            ResumenMedidores: {
                Total: afiliado.Medidores?.length || 0,
                Activos: afiliado.Medidores?.filter(m => m.Estado_Medidor?.Id_Estado_Medidor === 1).length || 0,
                Instalados: afiliado.Medidores?.filter(m => m.Estado_Medidor?.Id_Estado_Medidor === 2).length || 0,
                Lista: afiliado.Medidores?.map(m => `Medidor N°${m.Numero_Medidor}`).join(', ') || 'Sin medidores'
            }
        }));
    }

    async getDetalleAfiliadoFisico(idAfiliado: number) {
        const afiliado = await this.afiliadoFisicoRepository.createQueryBuilder('afiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Medidores', 'medidores')
            .leftJoinAndSelect('medidores.Estado_Medidor', 'estadoMedidor')
            .where('afiliado.Id_Afiliado = :idAfiliado', { idAfiliado })
            .getOne();

        if (!afiliado) throw new BadRequestException(`Afiliado físico con ID ${idAfiliado} no encontrado`);

        return {
            ...afiliado,
            Medidores: afiliado.Medidores?.map(m => ({
                Id_Medidor: m.Id_Medidor,
                Numero_Medidor: m.Numero_Medidor,
                Planos_Terreno: m.Planos_Terreno ?? null,
                Escritura_Terreno: m.Escritura_Terreno ?? null,
                Estado: {
                    Id_Estado: m.Estado_Medidor?.Id_Estado_Medidor ?? null,
                    Nombre_Estado: m.Estado_Medidor?.Nombre_Estado_Medidor ?? 'Sin estado'
                }
            })) ?? [],
            ResumenMedidores: {
                Total: afiliado.Medidores?.length || 0,
                Disponibles: afiliado.Medidores?.filter(m => m.Estado_Medidor?.Id_Estado_Medidor === 1).length || 0,
                Instalados: afiliado.Medidores?.filter(m => m.Estado_Medidor?.Id_Estado_Medidor === 2).length || 0,
                Averiados: afiliado.Medidores?.filter(m => m.Estado_Medidor?.Id_Estado_Medidor === 3).length || 0
            }
        };
    }

    async getDetalleAfiliadoJuridico(idAfiliado: number) {
        const afiliado = await this.afiliadoJuridicoRepository.createQueryBuilder('afiliado')
            .leftJoinAndSelect('afiliado.Estado', 'estado')
            .leftJoinAndSelect('afiliado.Tipo_Afiliado', 'tipoAfiliado')
            .leftJoinAndSelect('afiliado.Medidores', 'medidores')
            .leftJoinAndSelect('medidores.Estado_Medidor', 'estadoMedidor')
            .where('afiliado.Id_Afiliado = :idAfiliado', { idAfiliado })
            .getOne();

        if (!afiliado) throw new BadRequestException(`Afiliado jurídico con ID ${idAfiliado} no encontrado`);

        return {
            ...afiliado,
            Medidores: afiliado.Medidores?.map(m => ({
                Id_Medidor: m.Id_Medidor,
                Numero_Medidor: m.Numero_Medidor,
                Planos_Terreno: m.Planos_Terreno ?? null,
                Escritura_Terreno: m.Escritura_Terreno ?? null,
                Estado: {
                    Id_Estado: m.Estado_Medidor?.Id_Estado_Medidor ?? null,
                    Nombre_Estado: m.Estado_Medidor?.Nombre_Estado_Medidor ?? 'Sin estado'
                }
            })) ?? [],
            ResumenMedidores: {
                Total: afiliado.Medidores?.length || 0,
                Disponibles: afiliado.Medidores?.filter(m => m.Estado_Medidor?.Id_Estado_Medidor === 1).length || 0,
                Instalados: afiliado.Medidores?.filter(m => m.Estado_Medidor?.Id_Estado_Medidor === 2).length || 0,
                Averiados: afiliado.Medidores?.filter(m => m.Estado_Medidor?.Id_Estado_Medidor === 3).length || 0
            }
        };
    }

    async createAfiliadoFisicoFromSolicitud(solicitud: SolicitudAfiliacionFisica) {
        // Verificar que no existe ya un afiliado físico con esa cédula
        const afiliadoExistente = await this.afiliadoFisicoRepository.findOne({ where: { Identificacion: solicitud.Identificacion } });
        if (afiliadoExistente) throw new BadRequestException(`Ya existe un afiliado físico con la identificación ${solicitud.Identificacion}`);

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) { throw new BadRequestException('Estado inicial de afiliado no configurado'); }

        const tipoAfiliado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 1 } });
        if (!tipoAfiliado) { throw new BadRequestException(`Tipo de afiliado con ID ${1} no encontrado`); }

        // 1. Crear registro en tabla padre Afiliado (sin archivos, pertenecen al Medidor)
        const afiliado = this.afiliadoRepository.create({
            Correo: solicitud.Correo,
            Numero_Telefono: solicitud.Numero_Telefono,
            Direccion_Exacta: solicitud.Direccion_Exacta,
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

        // 3. Buscar y vincular el medidor; los archivos de la solicitud se migran al Medidor
        const medidor = await this.medidorRepository.findOne({
            where: { Id_Solicitud: solicitud.Id_Solicitud },
            relations: ['Estado_Medidor']
        });

        if (medidor) {
            medidor.Afiliado = afiliadoGuardado;
            medidor.Planos_Terreno = solicitud.Planos_Terreno ?? null;
            medidor.Escritura_Terreno = solicitud.Escritura_Terreno ?? null;
            await this.medidorRepository.save(medidor);

            console.log(`Medidor ${medidor.Numero_Medidor} vinculado exitosamente al afiliado físico ${solicitud.Identificacion}`);
        } else {
            console.warn(`No se encontró medidor asignado a la solicitud ${solicitud.Id_Solicitud} para vincular con el afiliado`);
        }

        return afiliadoFisicoGuardado;
    }

    async createAfiliadoFisico(dto: CreateAfiliadoFisicoDto, idUsuario: number, files: any) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario }, relations: ['Rol'] });
        if (!usuario) throw new BadRequestException('El usuario creador no existe.');

        // Verificar que no existe ya un afiliado físico con esa identificación
        const afiliadoExistente = await this.afiliadoFisicoRepository.findOne({ where: { Identificacion: dto.Identificacion } });
        if (afiliadoExistente) { throw new BadRequestException(`Ya existe un afiliado físico con la identificación ${dto.Identificacion}`); }

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) { throw new BadRequestException('Estado inicial de afiliado no configurado'); }

        const tipoAfiliado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 1 } });
        if (!tipoAfiliado) { throw new BadRequestException(`Tipo de afiliado con ID ${1} no encontrado`); }

        // MEDIDOR------------------------------------------
        const opcion = dto.Opcion_Medidor ?? OpcionMedidor.SinMedidor;

        let medidorExistente: Medidor | null = null;

        if (opcion === OpcionMedidor.Asignar) {
            if (!dto.Id_Medidor) throw new BadRequestException('Debe proporcionar un Id de Medidor cuando la opción es "asignar"');
            medidorExistente = await this.medidorRepository.findOne({ where: { Id_Medidor: dto.Id_Medidor }, relations: ['Estado_Medidor', 'Afiliado'] });

            if (!medidorExistente) throw new BadRequestException(`Medidor con ID ${dto.Id_Medidor} no encontrado`);
            if (medidorExistente.Estado_Medidor.Id_Estado_Medidor === 3) throw new BadRequestException(`El medidor con ID ${dto.Id_Medidor} está averiado y no puede asignarse`);
            if (medidorExistente.Afiliado) throw new BadRequestException(`El medidor con ID ${dto.Id_Medidor} ya está asignado a otro afiliado`);
        }

        if (opcion === OpcionMedidor.Agregar) {
            if (!dto.Numero_Medidor) throw new BadRequestException('Debe proporcionar un Número de Medidor cuando la opción es "agregar"');

            const medidorDuplicado = await this.medidorRepository.findOne({ where: { Numero_Medidor: dto.Numero_Medidor } });
            if (medidorDuplicado) throw new BadRequestException(`Ya existe un medidor con el número ${dto.Numero_Medidor}`);
        }

        // Validación temprana de archivos: obligatorios cuando se vincula un medidor
        if (opcion === OpcionMedidor.Asignar || opcion === OpcionMedidor.Agregar) {
            if (!files?.Planos_Terreno?.[0]) throw new BadRequestException('Los planos de terreno son obligatorios cuando se asigna o agrega un medidor');
            if (!files?.Escritura_Terreno?.[0]) throw new BadRequestException('La escritura del terreno es obligatoria cuando se asigna o agrega un medidor');
        }

        const nombre = `${dto.Nombre} ${dto.Apellido1 ?? ''} `.trim();

        // Crear el Afiliado sin archivos (los archivos pertenecen al Medidor)
        const afiliado = this.afiliadoRepository.create({
            ...dto,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado,
            Tipo_Entidad: TipoEntidad.Física
        });
        const afiliadoGuardado = await this.afiliadoRepository.save(afiliado);

        const afiliadoFisico = this.afiliadoFisicoRepository.create({
            Id_Afiliado: afiliadoGuardado.Id_Afiliado,
            ...dto,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado
        });

        try {
            await this.auditoriaService.logCreacion('Afiliado físico', idUsuario, afiliadoFisico.Id_Afiliado, {
                'Tipo de Identificación': afiliadoFisico.Tipo_Identificacion,
                'Identificación': afiliadoFisico.Identificacion,
                'Nombre Completo': `${afiliadoFisico.Nombre} ${afiliadoFisico.Apellido1} ${afiliadoFisico.Apellido2}`.trim(),
                'Correo': afiliadoFisico.Correo,
            });
        } catch (error) {
            console.error('Error al registrar auditoría para creación de afiliado físico:', error);
        }

        const afiliadoFisicoGuardado = await this.afiliadoFisicoRepository.save(afiliadoFisico);

        // ─── MEDIDOR CON ARCHIVOS ─────────────────────────────────────────
        let medidorAsignado: Medidor | null = null;

        if (opcion === OpcionMedidor.Asignar && medidorExistente) {
            const estadoInstalado = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor: 2 } });
            if (!estadoInstalado) throw new BadRequestException('Estado "Instalado" no encontrado');

            const datosAnteriores = {
                'Número de Medidor': medidorExistente.Numero_Medidor,
                'Estado del Medidor': medidorExistente.Estado_Medidor?.Nombre_Estado_Medidor,
                'Afiliado Asignado': medidorExistente.Afiliado
            };

            const planoFile = files.Planos_Terreno[0];
            const escrituraFile = files.Escritura_Terreno[0];

            const planoRes = await this.dropboxFilesService.uploadFile(planoFile, 'Medidores', 'Fisicos', dto.Identificacion, nombre);
            const escrituraRes = await this.dropboxFilesService.uploadFile(escrituraFile, 'Medidores', 'Fisicos', dto.Identificacion, nombre);

            medidorExistente.Planos_Terreno = planoRes.url;
            medidorExistente.Escritura_Terreno = escrituraRes.url;
            medidorExistente.Afiliado = afiliadoGuardado;
            medidorExistente.Estado_Medidor = estadoInstalado;

            medidorAsignado = await this.medidorRepository.save(medidorExistente);

            try {
                if (medidorAsignado) {
                    await this.auditoriaService.logActualizacion('Medidores', idUsuario, medidorAsignado.Id_Medidor, datosAnteriores, {
                        'Número de Medidor': medidorAsignado.Numero_Medidor,
                        'Estado del Medidor': medidorAsignado.Estado_Medidor?.Nombre_Estado_Medidor,
                        'Afiliado Asignado': `${afiliadoFisico.Nombre} ${afiliadoFisico.Apellido1} ${afiliadoFisico.Apellido2}`.trim(),
                    });
                }
            } catch (error) {
                console.error('Error al registrar auditoría para creación de medidor:', error);
            }
        }

        else if (opcion === OpcionMedidor.Agregar) {
            const estadoInstalado = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor: 2 } });
            if (!estadoInstalado) throw new BadRequestException('Estado "Instalado" no encontrado');

            const planoFile = files.Planos_Terreno[0];
            const escrituraFile = files.Escritura_Terreno[0];
            const planoRes = await this.dropboxFilesService.uploadFile(planoFile, 'Medidores', 'Fisicos', dto.Identificacion, nombre);
            const escrituraRes = await this.dropboxFilesService.uploadFile(escrituraFile, 'Medidores', 'Fisicos', dto.Identificacion, nombre);

            const nuevoMedidor = this.medidorRepository.create({
                Numero_Medidor: dto.Numero_Medidor!,
                Afiliado: afiliadoGuardado,
                Estado_Medidor: estadoInstalado,
                Usuario: usuario,
                Planos_Terreno: planoRes.url,
                Escritura_Terreno: escrituraRes.url
            });

                medidorAsignado = await this.medidorRepository.save(nuevoMedidor);

                try {
                if (medidorAsignado) {
                    await this.auditoriaService.logCreacion('Medidores', idUsuario, medidorAsignado.Id_Medidor, {
                        'Número de Medidor': medidorAsignado.Numero_Medidor,
                        'Estado del Medidor': medidorAsignado.Estado_Medidor?.Nombre_Estado_Medidor,
                        'Afiliado Asignado': `${afiliadoFisico.Nombre} ${afiliadoFisico.Apellido1} ${afiliadoFisico.Apellido2}`.trim(),
                    });
                }
            } catch (error) {
                console.error('Error al registrar auditoría para creación de medidor:', error);
            }
        }

        return {
            ...afiliadoFisicoGuardado,
            Medidor_Asignado: medidorAsignado
                ? { Id_Medidor: medidorAsignado.Id_Medidor, Numero_Medidor: medidorAsignado.Numero_Medidor }
                : null
        };
    }

    async createAfiliadoJuridicoFromSolicitud(solicitud: SolicitudAfiliacionJuridica) {
        // Verificar que no existe ya un afiliado jurídico con esa cédula jurídica
        const afiliadoExistente = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: solicitud.Cedula_Juridica } });
        if (afiliadoExistente) throw new BadRequestException(`Ya existe un afiliado jurídico con la cédula jurídica ${solicitud.Cedula_Juridica}`);

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) throw new BadRequestException('Estado inicial de afiliado no configurado');

        const tipoAfiliado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 1 } });
        if (!tipoAfiliado) throw new BadRequestException(`Tipo de afiliado con ID ${1} no encontrado`);

        // 1. Crear registro en tabla padre Afiliado (sin archivos, pertenecen al Medidor)
        const afiliado = this.afiliadoRepository.create({
            Correo: solicitud.Correo,
            Numero_Telefono: solicitud.Numero_Telefono,
            Direccion_Exacta: solicitud.Direccion_Exacta,
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
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado,
            Cedula_Juridica: solicitud.Cedula_Juridica,
            Razon_Social: solicitud.Razon_Social
        });

        const afiliadoJuridicoGuardado = await this.afiliadoJuridicoRepository.save(afiliadoJuridico);

        // 3. Buscar y vincular el medidor; los archivos de la solicitud se migran al Medidor
        const medidor = await this.medidorRepository.findOne({
            where: { Id_Solicitud: solicitud.Id_Solicitud },
            relations: ['Estado_Medidor']
        });

        if (medidor) {
            medidor.Afiliado = afiliadoGuardado;
            medidor.Planos_Terreno = solicitud.Planos_Terreno ?? null;
            medidor.Escritura_Terreno = solicitud.Escritura_Terreno ?? null;
            await this.medidorRepository.save(medidor);

            console.log(`Medidor ${medidor.Numero_Medidor} vinculado exitosamente al afiliado jurídico ${solicitud.Cedula_Juridica}`);
        } else {
            console.warn(`No se encontró medidor asignado a la solicitud ${solicitud.Id_Solicitud} para vincular con el afiliado`);
        }

        return afiliadoJuridicoGuardado;
    }

    async createAfiliadoJuridico(dto: CreateAfiliadoJuridicoDto, idUsuario: number, files: any) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario }, relations: ['Rol'] });
        if (!usuario) throw new BadRequestException('El usuario creador no existe.');

        // Verificar que no existe ya un afiliado jurídico con esa cédula jurídica
        const afiliadoExistente = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: dto.Cedula_Juridica } });
        if (afiliadoExistente) throw new BadRequestException(`Ya existe un afiliado jurídico con la cédula jurídica ${dto.Cedula_Juridica}`);

        const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoInicial) throw new BadRequestException('Estado inicial de afiliado no configurado');

        const tipoAfiliado = await this.tipoAfiliadoRepository.findOne({ where: { Id_Tipo_Afiliado: 1 } });
        if (!tipoAfiliado) throw new BadRequestException(`Tipo de afiliado con ID ${1} no encontrado`);

        // ─── Validación previa de medidor antes de crear el afiliado ─────────────────
        const opcion = dto.Opcion_Medidor ?? OpcionMedidor.SinMedidor;

        let medidorExistente: Medidor | null = null;
        if (opcion === OpcionMedidor.Asignar) {
            if (!dto.Id_Medidor) throw new BadRequestException('Debe proporcionar Id_Medidor cuando Opcion_Medidor es "asignar"');
            medidorExistente = await this.medidorRepository.findOne({ where: { Id_Medidor: dto.Id_Medidor }, relations: ['Estado_Medidor', 'Afiliado'] });
            if (!medidorExistente) throw new BadRequestException(`Medidor con ID ${dto.Id_Medidor} no encontrado`);
            if (medidorExistente.Estado_Medidor.Id_Estado_Medidor === 3) throw new BadRequestException(`El medidor con ID ${dto.Id_Medidor} está averiado y no puede asignarse`);
            if (medidorExistente.Afiliado) throw new BadRequestException(`El medidor con ID ${dto.Id_Medidor} ya está asignado a otro afiliado`);
        }

        if (opcion === OpcionMedidor.Agregar) {
            if (!dto.Numero_Medidor) throw new BadRequestException('Debe proporcionar Numero_Medidor cuando Opcion_Medidor es "agregar"');
            const medidorDuplicado = await this.medidorRepository.findOne({ where: { Numero_Medidor: dto.Numero_Medidor } });
            if (medidorDuplicado) throw new BadRequestException(`Ya existe un medidor con el número ${dto.Numero_Medidor}`);
        }

        // Validación temprana de archivos: obligatorios cuando se vincula un medidor
        if (opcion === OpcionMedidor.Asignar || opcion === OpcionMedidor.Agregar) {
            if (!files?.Planos_Terreno?.[0]) throw new BadRequestException('El archivo Planos_Terreno es obligatorio cuando se asigna o agrega un medidor');
            if (!files?.Escritura_Terreno?.[0]) throw new BadRequestException('El archivo Escritura_Terreno es obligatorio cuando se asigna o agrega un medidor');
        }

        // Crear el Afiliado sin archivos (los archivos pertenecen al Medidor)
        const afiliado = this.afiliadoRepository.create({
            ...dto,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado,
            Tipo_Entidad: TipoEntidad.Jurídica
        });
        const afiliadoGuardado = await this.afiliadoRepository.save(afiliado);

        const afiliadoJuridico = this.afiliadoJuridicoRepository.create({
            Id_Afiliado: afiliadoGuardado.Id_Afiliado,
            ...dto,
            Estado: estadoInicial,
            Tipo_Afiliado: tipoAfiliado
        });

        const afiliadoJuridicoGuardado = await this.afiliadoJuridicoRepository.save(afiliadoJuridico);

        // ─── Gestión del medidor con archivos ────────────────────────────────────────
        let medidorAsignado: Medidor | null = null;

        if (opcion === OpcionMedidor.Asignar && medidorExistente) {
            const estadoInstalado = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor: 2 } });
            if (!estadoInstalado) throw new BadRequestException('Estado "Instalado" no encontrado');

            const planoFile = files.Planos_Terreno[0];
            const escrituraFile = files.Escritura_Terreno[0];
            const planoRes = await this.dropboxFilesService.uploadFile(planoFile, 'Medidores', 'Juridicos', dto.Cedula_Juridica, dto.Razon_Social);
            const escrituraRes = await this.dropboxFilesService.uploadFile(escrituraFile, 'Medidores', 'Juridicos', dto.Cedula_Juridica, dto.Razon_Social);

            medidorExistente.Planos_Terreno = planoRes.url;
            medidorExistente.Escritura_Terreno = escrituraRes.url;
            medidorExistente.Afiliado = afiliadoGuardado;
            medidorExistente.Estado_Medidor = estadoInstalado;
            medidorAsignado = await this.medidorRepository.save(medidorExistente);
        } else if (opcion === OpcionMedidor.Agregar) {
            const estadoInstalado = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor: 2 } });
            if (!estadoInstalado) throw new BadRequestException('Estado "Instalado" no encontrado');

            const planoFile = files.Planos_Terreno[0];
            const escrituraFile = files.Escritura_Terreno[0];
            const planoRes = await this.dropboxFilesService.uploadFile(planoFile, 'Medidores', 'Juridicos', dto.Cedula_Juridica, dto.Razon_Social);
            const escrituraRes = await this.dropboxFilesService.uploadFile(escrituraFile, 'Medidores', 'Juridicos', dto.Cedula_Juridica, dto.Razon_Social);

            const nuevoMedidor = this.medidorRepository.create({
                Numero_Medidor: dto.Numero_Medidor!,
                Afiliado: afiliadoGuardado,
                Estado_Medidor: estadoInstalado,
                Usuario: usuario,
                Planos_Terreno: planoRes.url,
                Escritura_Terreno: escrituraRes.url
            });
            medidorAsignado = await this.medidorRepository.save(nuevoMedidor);
        }

        return {
            ...afiliadoJuridicoGuardado,
            Medidor_Asignado: medidorAsignado
                ? { Id_Medidor: medidorAsignado.Id_Medidor, Numero_Medidor: medidorAsignado.Numero_Medidor }
                : null
        };
    }

    async updateAfiliadoFisico(cedula: string, dto: UpdateAfiliadoFisicoDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario creador no existe.');

        const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Identificacion: cedula } });
        if (!afiliado) { throw new BadRequestException(`Afiliado físico con cédula ${cedula} no encontrado`); }

        Object.assign(afiliado, dto);
        return this.afiliadoFisicoRepository.save(afiliado);
    }

    async updateAfiliadoJuridico(cedulaJuridica: string, dto: UpdateAfiliadoJuridicoDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario creador no existe.');

        const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica } });
        if (!afiliado) { throw new BadRequestException(`Afiliado jurídico con cédula jurídica ${cedulaJuridica} no encontrado`); }

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