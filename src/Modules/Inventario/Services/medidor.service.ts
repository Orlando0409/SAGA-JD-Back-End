import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { Medidor } from "../InventarioEntities/Medidor.Entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { EstadoMedidor } from "../InventarioEntities/EstadoMedidor.Entity";
import { CreateMedidorDTO } from "../InventarioDTO's/CreateMedidor.dto";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from "src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity";
import { AsignarMedidorDTO } from "../InventarioDTO's/AsignarMedidor.dto";
import { AsignarMedidorExistenteAAfiliado } from "../InventarioDTO's/AsignarMedidorExistenteAAfiliado.dto";
import { TipoEntidad } from "src/Common/Enums/TipoEntidad.enum";
import { AuditoriaService } from "src/Modules/Auditoria/auditoria.service";
import { UsuariosService } from "src/Modules/Usuarios/Services/usuarios.service";
import { AfiliadosService } from "src/Modules/Afiliados/afiliados.service";
import { Solicitud } from "src/Modules/Solicitudes/SolicitudEntities/Solicitud.Entity";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { EstadoAfiliado } from "src/Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity";

@Injectable()
export class MedidorService {
    constructor(
        @InjectRepository(Medidor)
        private readonly medidorRepository: Repository<Medidor>,

        @InjectRepository(EstadoMedidor)
        private readonly estadoMedidorRepository: Repository<EstadoMedidor>,

        @InjectRepository(Afiliado)
        private readonly afiliadoRepository: Repository<Afiliado>,

        @InjectRepository(EstadoAfiliado)
        private readonly estadoAfiliadoRepository: Repository<EstadoAfiliado>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        @InjectRepository(AfiliadoFisico)
        private readonly afiliadoFisicoRepository: Repository<AfiliadoFisico>,

        @InjectRepository(AfiliadoJuridico)
        private readonly afiliadoJuridicoRepository: Repository<AfiliadoJuridico>,

        @InjectRepository(Solicitud)
        private readonly solicitudRepository: Repository<Solicitud>,

        private readonly afiliadoService: AfiliadosService,

        private readonly auditoriaService: AuditoriaService,

        private readonly usuariosService: UsuariosService,

        private readonly dropboxFilesService: DropboxFilesService,
    ) { }

    private async formatearMedidoresConRelaciones(medidores: Medidor[]) {
        return Promise.all(
            medidores.map(async (medidor) => ({
                ...medidor,
                Afiliado: medidor.Afiliado ? await this.afiliadoService.FormatearAfiliadoParaResponseSimple(medidor.Afiliado) : null,
                Usuario: medidor.Usuario ? await this.usuariosService.FormatearUsuarioResponse(medidor.Usuario) : null
            }))
        );
    }

    async getAllMedidores() {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .getMany();

        return this.formatearMedidoresConRelaciones(medidores);
    }

    async getMedidoresNoInstalados() {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Medidor = :estado', { estado: 1 }) // 1 = No Instalado
            .getMany();

        return this.formatearMedidoresConRelaciones(medidores);
    }

    async getMedidoresInstalados() {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Medidor = :estado', { estado: 2 }) // 2 = Instalado
            .getMany();

        return this.formatearMedidoresConRelaciones(medidores);
    }

    async getMedidoresAveriados() {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Medidor = :estado', { estado: 3 }) // 3 = Averiado
            .getMany();

        return this.formatearMedidoresConRelaciones(medidores);
    }

    async getMedidoresConAfiliado() {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .getMany();

        return this.formatearMedidoresConRelaciones(medidores);
    }

    async getMedidoresSinAfiliado() {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('medidor.Afiliado IS NULL')
            .getMany();

        return this.formatearMedidoresConRelaciones(medidores);
    }

    async getMedidoresByAfiliado(idAfiliado: number) {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('medidor.Afiliado.Id_Afiliado = :idAfiliado', { idAfiliado })
            .getMany();

        return this.formatearMedidoresConRelaciones(medidores);
    }

    async getMedidoresDisponibles() {

        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Medidor = :estado', { estado: 1 })
            .andWhere('medidor.Id_Afiliado IS NULL')
            .getMany();

        return this.formatearMedidoresConRelaciones(medidores);
    }

    async asignarMedidorExistenteAAfiliado(
        dto: AsignarMedidorExistenteAAfiliado,
        idUsuario: number,
        files: { Planos_Terreno?: Express.Multer.File[]; Escritura_Terreno?: Express.Multer.File[] }
    ) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        if (!files?.Planos_Terreno?.[0]) throw new BadRequestException('El archivo Planos_Terreno es obligatorio para asignar un medidor a un afiliado');
        if (!files?.Escritura_Terreno?.[0]) throw new BadRequestException('El archivo Escritura_Terreno es obligatorio para asignar un medidor a un afiliado');

        const medidor = await this.medidorRepository.findOne({
            where: { Id_Medidor: dto.Id_Medidor },
            relations: ['Estado_Medidor', 'Afiliado']
        });

        if (!medidor) throw new BadRequestException(`Medidor con ID ${dto.Id_Medidor} no encontrado`);
        if (medidor.Estado_Medidor.Id_Estado_Medidor === 3) throw new BadRequestException(`El medidor con ID ${dto.Id_Medidor} está averiado y no puede ser asignado`);
        if (medidor.Afiliado) throw new BadRequestException(`El medidor con ID ${dto.Id_Medidor} ya está asignado al afiliado con ID ${medidor.Afiliado.Id_Afiliado}`);

        const afiliado = await this.afiliadoRepository.findOne({
            where: { Id_Afiliado: dto.Id_Afiliado },
            relations: ['Estado', 'Tipo_Afiliado']
        });
        if (!afiliado) throw new BadRequestException(`Afiliado con ID ${dto.Id_Afiliado} no encontrado`);

        const estadoInstalado = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor: 2 } });
        if (!estadoInstalado) throw new BadRequestException('Estado "Instalado" no encontrado en la base de datos');

        const estadoActivo = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
        if (!estadoActivo) throw new BadRequestException('Estado "Activo" no encontrado en la base de datos');

        const estadoEnEspera = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 3 } });
        if (!estadoEnEspera) throw new BadRequestException('Estado "En espera" no encontrado en la base de datos');

        // Cambiar estado del afiliado de "En Espera" a "Activo" cuando se le asigna un medidor
        if (afiliado.Tipo_Entidad === TipoEntidad.Física) {
            const afiliadoFisico = await this.afiliadoFisicoRepository.findOne({
                where: { Id_Afiliado: dto.Id_Afiliado },
                relations: ['Estado']
            });
            
            if (afiliadoFisico && afiliadoFisico.Estado?.Id_Estado_Afiliado === 3) {
                afiliadoFisico.Estado = estadoActivo;
                await this.afiliadoFisicoRepository.save(afiliadoFisico);
            }
        } else if (afiliado.Tipo_Entidad === TipoEntidad.Jurídica) {
            const afiliadoJuridico = await this.afiliadoJuridicoRepository.findOne({
                where: { Id_Afiliado: dto.Id_Afiliado },
                relations: ['Estado']
            });
            
            if (afiliadoJuridico && afiliadoJuridico.Estado?.Id_Estado_Afiliado === 3) {
                afiliadoJuridico.Estado = estadoActivo;
                await this.afiliadoJuridicoRepository.save(afiliadoJuridico);
            }
        }

        const datosAnteriores = {
            Numero_Medidor: medidor.Numero_Medidor,
            Estado_Anterior: medidor.Estado_Medidor.Nombre_Estado_Medidor,
            Afiliado_Anterior: null
        };

        const planoRes = await this.dropboxFilesService.uploadFile(
            files.Planos_Terreno[0], 'Medidores', 'Archivos', String(dto.Id_Medidor), String(dto.Id_Afiliado)
        );
        const escrituraRes = await this.dropboxFilesService.uploadFile(
            files.Escritura_Terreno[0], 'Medidores', 'Archivos', String(dto.Id_Medidor), String(dto.Id_Afiliado)
        );

        medidor.Planos_Terreno = planoRes.url;
        medidor.Escritura_Terreno = escrituraRes.url;
        medidor.Afiliado = afiliado;
        medidor.Estado_Medidor = estadoInstalado;
        await this.medidorRepository.save(medidor);

        try {
            await this.auditoriaService.logActualizacion('Medidores', idUsuario, dto.Id_Medidor, datosAnteriores, {
                'Número de Medidor': medidor.Numero_Medidor,
                'Estado del Medidor': 'Instalado',
                'Afiliado Asignado': dto.Id_Afiliado
            });
        } catch (error) {
            console.error('Error al registrar auditoría de asignación de medidor a afiliado:', error);
        }

        const medidorActualizado = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('medidor.Id_Medidor = :id', { id: dto.Id_Medidor })
            .getOne();

        if (!medidorActualizado) throw new BadRequestException('Error al recuperar el medidor actualizado');

        return {
            ...medidorActualizado,
            Afiliado: await this.afiliadoService.FormatearAfiliadoParaResponseSimple(medidorActualizado.Afiliado),
            Usuario: medidorActualizado.Usuario ? await this.usuariosService.FormatearUsuarioResponse(medidorActualizado.Usuario) : null
        };
    }

    async createMedidor(dto: CreateMedidorDTO, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario }, relations: ['Rol'] });
        if (!usuario) throw new BadRequestException(`Usuario con ID ${idUsuario} no encontrado`);

        const MedidorExistente = await this.medidorRepository.findOne({ where: { Numero_Medidor: dto.Numero_Medidor } });
        if (MedidorExistente) throw new BadRequestException('Ya existe un medidor con ese número.');

        const estadoInicial = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor: 1 } });
        if (!estadoInicial) throw new BadRequestException('Estado por defecto no encontrado');

        const medidor = this.medidorRepository.create({
            ...dto,
            Estado_Medidor: estadoInicial,
            Usuario: usuario
        });

        const medidorGuardado = await this.medidorRepository.save(medidor);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logCreacion('Medidores', idUsuario, medidorGuardado.Id_Medidor, {
                'Número de Medidor': medidorGuardado.Numero_Medidor,
                'Estado del Medidor': 'Disponible',
                'Afiliado Asignado': null
            });
        } catch (error) {
            console.error('Error al registrar auditoría de creación de medidor:', error);
        }

        const medidorCompleto = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('medidor.Id_Medidor = :id', { id: medidorGuardado.Id_Medidor })
            .getOne();

        if (!medidorCompleto) throw new BadRequestException('Error al recuperar el medidor creado');

        return {
            ...medidorCompleto,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(medidorCompleto.Usuario)
        };
    }

    async asignarMedidorAAfiliado(dto: AsignarMedidorDTO, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const medidor = await this.medidorRepository.findOne({ where: { Id_Medidor: dto.Id_Medidor }, relations: ['Estado_Medidor'] });
        if (!medidor) throw new BadRequestException(`Medidor con ID ${dto.Id_Medidor} no encontrado`);

        // Validar estado del medidor
        if (medidor.Estado_Medidor.Id_Estado_Medidor === 2) throw new BadRequestException(`El medidor con ID ${dto.Id_Medidor} no está disponible, ya está asignado a un afiliado.`);
        if (medidor.Estado_Medidor.Id_Estado_Medidor === 3) throw new BadRequestException(`El medidor con ID ${dto.Id_Medidor} está dañado y no puede ser asignado.`);

        // Validar tipo de entidad
        const TipoAfiliadoValido = [TipoEntidad.Física, TipoEntidad.Jurídica];
        if (!TipoAfiliadoValido.includes(dto.Id_Tipo_Entidad)) throw new BadRequestException(`Tipo de entidad inválido. Los valores permitidos son: ${TipoAfiliadoValido.join(' y ')}`);

        // Buscar la solicitud en la tabla padre (Solicitud) y validar que coincida el tipo de entidad
        const solicitud = await this.solicitudRepository.findOne({ where: { Id_Solicitud: dto.Id_Solicitud, Tipo_Entidad: dto.Id_Tipo_Entidad } });
        if (!solicitud) throw new BadRequestException(`Solicitud ${dto.Id_Tipo_Entidad === TipoEntidad.Física ? 'Física' : 'Jurídica'} con ID ${dto.Id_Solicitud} no encontrada`);

        // Obtener estado "Instalado"
        const estadoInstalado = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor: 2 } });
        if (!estadoInstalado) throw new BadRequestException('Estado "Instalado" no encontrado');

        const datosAnteriores = {
            Numero_Medidor: medidor.Numero_Medidor,
            Estado_Anterior: medidor.Estado_Medidor.Nombre_Estado_Medidor,
            Solicitud_Anterior: medidor.Id_Solicitud || null,
            Afiliado_Anterior: medidor.Afiliado ? {
                Id_Afiliado: medidor.Afiliado.Id_Afiliado,
                Tipo_Entidad: medidor.Afiliado.Tipo_Entidad
            } : null
        };

        // Asignar la solicitud al medidor (NO el afiliado, porque aún no existe)
        medidor.Id_Solicitud = dto.Id_Solicitud;
        medidor.Estado_Medidor = estadoInstalado;
        await this.medidorRepository.save(medidor);

        // Registrar en auditoría si se proporciona idUsuario
        try {
            await this.auditoriaService.logActualizacion('Medidores', idUsuario, dto.Id_Medidor, datosAnteriores, {
                Numero_Medidor: medidor.Numero_Medidor,
                Estado_Nuevo: 'Instalado',
                Solicitud_Asignada: {
                    Id_Solicitud: dto.Id_Solicitud,
                    Tipo_Entidad: dto.Id_Tipo_Entidad === TipoEntidad.Física ? 'Físico' : 'Jurídico'
                }
            });
        } catch (error) {
            console.error('Error al registrar auditoría de asignación de medidor:', error);
        }

        // Obtener el medidor actualizado con todas sus relaciones
        const medidorActualizado = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .where('medidor.Id_Medidor = :id', { id: dto.Id_Medidor })
            .getOne();

        if (!medidorActualizado) throw new BadRequestException(`Error al recuperar el medidor actualizado con ID ${dto.Id_Medidor}`);

        return {
            ...medidorActualizado,
            Id_Solicitud: medidorActualizado.Id_Solicitud,
            Solicitud: {
                Id_Solicitud: dto.Id_Solicitud,
                Tipo_Entidad: dto.Id_Tipo_Entidad === TipoEntidad.Física ? 'Física' : 'Jurídica'
            },
            Afiliado: medidorActualizado.Afiliado
                ? await this.afiliadoService.FormatearAfiliadoParaResponseSimple(medidorActualizado.Afiliado) : null,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(medidorActualizado.Usuario)
        };
    }

    async updateEstadoMedidor(idMedidor: number, idEstadoMedidor: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const medidor = await this.medidorRepository.findOne({ where: { Id_Medidor: idMedidor }, relations: ['Estado_Medidor'] });
        const nuevoEstado = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor: idEstadoMedidor } });

        if (!medidor) throw new BadRequestException(`Medidor con ID ${idMedidor} no encontrado`);
        if (!nuevoEstado) throw new BadRequestException(`Estado con ID ${idEstadoMedidor} no encontrado`);

        if (medidor.Afiliado === null && nuevoEstado.Id_Estado_Medidor === 2) throw new BadRequestException(`No se puede cambiar el estado del medidor con ID ${idMedidor} a ${nuevoEstado.Nombre_Estado_Medidor} porque no está asignado a ningún afiliado.`);

        const datosAnteriores = {
            Numero_Medidor: medidor.Numero_Medidor,
            Id_Estado_Medidor: medidor.Estado_Medidor.Id_Estado_Medidor,
            Estado_Anterior: medidor.Estado_Medidor.Nombre_Estado_Medidor
        };

        medidor.Estado_Medidor = nuevoEstado;
        await this.medidorRepository.save(medidor);

        // Registrar en auditoría si se proporciona idUsuario
        try {
            await this.auditoriaService.logActualizacion('Medidores', idUsuario, idMedidor, datosAnteriores, {
                Numero_Medidor: medidor.Numero_Medidor,
                Estado_Nuevo: {
                    Id_Estado_Medidor: nuevoEstado.Id_Estado_Medidor,
                    Estado_Anterior: nuevoEstado.Nombre_Estado_Medidor
                }
            });
        } catch (error) {
            console.error('Error al registrar auditoría de actualización de medidor:', error);
        }

        const medidorActualizado = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('medidor.Id_Medidor = :id', { id: idMedidor })
            .getOne();

        if (!medidorActualizado) throw new BadRequestException(`Error al recuperar el medidor actualizado con ID ${idMedidor}`);

        return {
            ...medidorActualizado,
            Afiliado: await this.afiliadoService.FormatearAfiliadoParaResponseSimple(medidorActualizado.Afiliado),
            Usuario: await this.usuariosService.FormatearUsuarioResponse(medidorActualizado.Usuario)
        };
    }

    formatearMedidorResponse(medidor: any) {
        if (!medidor) return null;

        return {
            Id_Medidor: medidor.Id_Medidor,
            Numero_Medidor: medidor.Numero_Medidor,
            Estado: {
                Id_Estado: medidor.Estado_Medidor?.Id_Estado_Medidor || null,
                Nombre_Estado: medidor.Estado_Medidor?.Nombre_Estado_Medidor || 'Sin estado'
            }
        };
    }

    async updateMedidorFiles(idMedidor: number, idUsuario: number, files: { Planos_Terreno?: Express.Multer.File[]; Escritura_Terreno?: Express.Multer.File[] }) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const medidor = await this.medidorRepository.findOne({
            where: { Id_Medidor: idMedidor },
            relations: ['Estado_Medidor', 'Afiliado']
        });
        if (!medidor) throw new BadRequestException(`Medidor con ID ${idMedidor} no encontrado`);

        const planoFile = files?.Planos_Terreno?.[0];
        const escrituraFile = files?.Escritura_Terreno?.[0];

        if (!planoFile && !escrituraFile) {
            throw new BadRequestException('Debe proporcionar al menos un archivo (Planos_Terreno o Escritura_Terreno)');
        }

        if (planoFile) {
            const planoRes = await this.dropboxFilesService.uploadFile(planoFile, 'Medidores', 'Archivos', String(idMedidor));
            medidor.Planos_Terreno = planoRes?.url ?? null;
        }

        if (escrituraFile) {
            const escrituraRes = await this.dropboxFilesService.uploadFile(escrituraFile, 'Medidores', 'Archivos', String(idMedidor));
            medidor.Escritura_Terreno = escrituraRes?.url ?? null;
        }

        const medidorActualizado = await this.medidorRepository.save(medidor);

        try {
            await this.auditoriaService.logActualizacion('Medidores', idUsuario, idMedidor,
                { Planos_Terreno: medidor.Planos_Terreno, Escritura_Terreno: medidor.Escritura_Terreno },
                { Planos_Terreno: medidorActualizado.Planos_Terreno, Escritura_Terreno: medidorActualizado.Escritura_Terreno }
            );
        } catch (error) {
            console.error('Error al registrar auditoría de actualización de archivos del medidor:', error);
        }

        return {
            Id_Medidor: medidorActualizado.Id_Medidor,
            Numero_Medidor: medidorActualizado.Numero_Medidor,
            Planos_Terreno: medidorActualizado.Planos_Terreno,
            Escritura_Terreno: medidorActualizado.Escritura_Terreno
        };
    }
}