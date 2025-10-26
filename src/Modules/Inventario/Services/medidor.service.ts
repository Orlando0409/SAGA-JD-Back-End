import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { Medidor } from "../InventarioEntities/Medidor.Entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { EstadoMedidor } from "../InventarioEntities/EstadoMedidor.Entity";
import { CreateMedidorDTO } from "../InventarioDTO's/CreateMedidor.dto";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from "src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity";
import { AsignarMedidorDTO } from "../InventarioDTO's/AsignarMedidor.dto";
import { TipoEntidad } from "src/Common/Enums/TipoEntidad.enum";
import { AuditoriaService } from "src/Modules/Auditoria/auditoria.service";
import { UsuariosService } from "src/Modules/Usuarios/Services/usuarios.service";
import { AfiliadosService } from "src/Modules/Afiliados/afiliados.service";

@Injectable()
export class MedidorService {
    constructor(
        @InjectRepository(Medidor)
        private readonly medidorRepository: Repository<Medidor>,

        @InjectRepository(EstadoMedidor)
        private readonly estadoMedidorRepository: Repository<EstadoMedidor>,

        @InjectRepository(Afiliado)
        private readonly afiliadoRepository: Repository<Afiliado>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        @Inject(forwardRef(() => UsuariosService))
        private readonly usuariosService: UsuariosService,

        private readonly afiliadoService: AfiliadosService,

        private readonly auditoriaService: AuditoriaService,

        private readonly usuariosService: UsuariosService
    ) { }

    async getAllMedidores() {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .getMany();

        // Mapear cada medidor y obtener info completa del afiliado
        const medidoresConAfiliados = await Promise.all(
            medidores.map(async (medidor) => ({
                ...medidor,
                Afiliado: medidor.Afiliado ? await this.afiliadoService.FormatearAfiliadoParaResponseSimple(medidor.Afiliado) : null,
                Usuario: medidor.Usuario ? await this.usuariosService.FormatearUsuarioResponse(medidor.Usuario) : null
            }))
        );

        return medidoresConAfiliados;
    }

    async getMedidoresNoInstalados() {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Medidor = :estado', { estado: 1 }) // 1 = No Instalado
            .getMany();

        const medidoresConAfiliados = await Promise.all(
            medidores.map(async (medidor) => ({
                ...medidor,
                Afiliado: medidor.Afiliado ? await this.afiliadoService.FormatearAfiliadoParaResponseSimple(medidor.Afiliado) : null,
                Usuario: medidor.Usuario ? await this.usuariosService.FormatearUsuarioResponse(medidor.Usuario) : null
            }))
        );

        return medidoresConAfiliados;
    }

    async getMedidoresInstalados() {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Medidor = :estado', { estado: 2 }) // 2 = Instalado
            .getMany();

        const medidoresConAfiliados = await Promise.all(
            medidores.map(async (medidor) => ({
                ...medidor,
                Afiliado: medidor.Afiliado ? await this.afiliadoService.FormatearAfiliadoParaResponseSimple(medidor.Afiliado) : null,
                Usuario: medidor.Usuario ? await this.usuariosService.FormatearUsuarioResponse(medidor.Usuario) : null
            }))
        );

        return medidoresConAfiliados;
    }

    async getMedidoresAveriados() {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Medidor = :estado', { estado: 3 }) // 3 = Averiado
            .getMany();

        const medidoresConAfiliados = await Promise.all(
            medidores.map(async (medidor) => ({
                ...medidor,
                Afiliado: medidor.Afiliado ? await this.afiliadoService.FormatearAfiliadoParaResponseSimple(medidor.Afiliado) : null,
                Usuario: medidor.Usuario ? await this.usuariosService.FormatearUsuarioResponse(medidor.Usuario) : null
            }))
        );

        return medidoresConAfiliados;
    }

    async getMedidoresAfiliado(idAfiliado: number) {
        const medidores = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('medidor.Afiliado.Id_Afiliado = :idAfiliado', { idAfiliado })
            .getMany();

        const medidoresConAfiliados = await Promise.all(
            medidores.map(async (medidor) => ({
                ...medidor,
                Afiliado: medidor.Afiliado ? await this.afiliadoService.FormatearAfiliadoParaResponseSimple(medidor.Afiliado) : null,
                Usuario: medidor.Usuario ? await this.usuariosService.FormatearUsuarioResponse(medidor.Usuario) : null
            }))
        );

        return medidoresConAfiliados;
    }

    async createMedidor(dto: CreateMedidorDTO, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const MedidorExistente = await this.medidorRepository.findOne({ where: { Numero_Medidor: dto.Numero_Medidor } });
        if (MedidorExistente) throw new BadRequestException('Ya existe un medidor con ese número.');

        const estadoInicial = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor: 1 } });
        if (!estadoInicial) throw new BadRequestException('Estado por defecto no encontrado');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario }, relations: ['Rol'] });
        if (!usuario) throw new BadRequestException(`Usuario con ID ${idUsuario} no encontrado`);

        const medidor = this.medidorRepository.create({
            ...dto,
            Estado_Medidor: estadoInicial,
            Usuario: usuario
        });

        const medidorGuardado = await this.medidorRepository.save(medidor);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logCreacion('Medidor', idUsuario, medidorGuardado.Id_Medidor, {
                Id_Medidor: medidorGuardado.Id_Medidor,
                Numero_Medidor: medidorGuardado.Numero_Medidor,
                Estado_Inicial: 'Disponible'
            }
            );
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
            Usuario: {
                Id_Usuario: medidorCompleto.Usuario.Id_Usuario,
                Nombre_Usuario: medidorCompleto.Usuario.Nombre_Usuario,
                Id_Rol: medidorCompleto.Usuario.Id_Rol,
                Nombre_Rol: medidorCompleto.Usuario.Rol?.Nombre_Rol
            }
        };
    }

    async asignarMedidorAAfiliado(dto: AsignarMedidorDTO, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const medidor = await this.medidorRepository.findOne({ where: { Id_Medidor: dto.Id_Medidor }, relations: ['Estado_Medidor'] });
        if (!medidor) throw new BadRequestException(`Medidor con ID ${dto.Id_Medidor} no encontrado`);

        if (medidor.Estado_Medidor.Id_Estado_Medidor === 2) throw new BadRequestException(`El medidor con ID ${dto.Id_Medidor} no está disponible, ya está asignado a un afiliado.`);
        if (medidor.Estado_Medidor.Id_Estado_Medidor === 3) throw new BadRequestException(`El medidor con ID ${dto.Id_Medidor} está dañado y no puede ser asignado.`);

        const TipoAfiliadoValido = [TipoEntidad.Física, TipoEntidad.Jurídica]; // Los IDs en TipoEntidad son 1 y 2
        if (!TipoAfiliadoValido.includes(dto.Id_Tipo_Entidad)) throw new BadRequestException(`Tipo de afiliado inválido. Los valores permitidos son: ${TipoAfiliadoValido.join(' y ')}`);

        // Buscar directamente en la tabla padre y validar el tipo
        const tipoEntidadEnum = dto.Id_Tipo_Entidad === 1 ? TipoEntidad.Física : TipoEntidad.Jurídica;
        const afiliado = await this.afiliadoRepository.findOne({ where: { Id_Afiliado: dto.Id_Afiliado, Tipo_Entidad: tipoEntidadEnum }, relations: ['Medidores'] });
        if (!afiliado) throw new BadRequestException(`Afiliado ${dto.Id_Tipo_Entidad === 1 ? 'Físico' : 'Jurídico'} con ID ${dto.Id_Afiliado} no encontrado`);

        const estadoInstalado = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor: 2 } });
        if (!estadoInstalado) throw new BadRequestException('Estado "Instalado" no encontrado');

        // Asignar el afiliado al medidor y cambiar el estado
        medidor.Afiliado = afiliado;
        medidor.Estado_Medidor = estadoInstalado;
        await this.medidorRepository.save(medidor);

        // Registrar en auditoría si se proporciona idUsuario
        if (idUsuario) {
            try {
                await this.auditoriaService.logActualizacion('Medidor', idUsuario, dto.Id_Medidor, {
                    Estado_Anterior: 'Disponible',
                    Afiliado_Anterior: null
                }, {
                    Estado_Nuevo: 'Instalado',
                    Afiliado_Asignado: {
                        Id: afiliado.Id_Afiliado,
                        Tipo: dto.Id_Tipo_Entidad === 1 ? 'Físico' : 'Jurídico'
                    }
                }
                );
            } catch (error) {
                console.error('Error al registrar auditoría de asignación de medidor:', error);
            }
        }

        // Obtener el medidor actualizado con todas sus relaciones
        const medidorActualizado = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .leftJoinAndSelect('medidor.Afiliado', 'afiliado') // Asegurar que Afiliado se carga
            .where('medidor.Id_Medidor = :id', { id: dto.Id_Medidor })
            .getOne();

        if (!medidorActualizado) throw new BadRequestException(`Error al recuperar el medidor actualizado con ID ${dto.Id_Medidor}`);

        return {
            ...medidorActualizado,
            Afiliado: await this.afiliadoService.FormatearAfiliadoParaResponseSimple(medidorActualizado.Afiliado),
            Usuario: medidorActualizado.Usuario ? await this.usuariosService.FormatearUsuarioResponse(medidorActualizado.Usuario) : null
        };
    }

    async updateEstadoMedidor(Id_Medidor: number, Id_Estado_Medidor: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const medidor = await this.medidorRepository.findOne({ where: { Id_Medidor }, relations: ['Estado_Medidor'] });
        const nuevoEstado = await this.estadoMedidorRepository.findOne({ where: { Id_Estado_Medidor } });

        if (!medidor) throw new BadRequestException(`Medidor con ID ${Id_Medidor} no encontrado`);

        if (!nuevoEstado) throw new BadRequestException(`Estado con ID ${Id_Estado_Medidor} no encontrado`);

        const estadoAnterior = medidor.Estado_Medidor;

        medidor.Estado_Medidor = nuevoEstado;
        await this.medidorRepository.save(medidor);

        // Registrar en auditoría si se proporciona idUsuario
        if (idUsuario) {
            try {
                await this.auditoriaService.logActualizacion('Medidor', idUsuario, Id_Medidor, {
                    Estado_Anterior: {
                        Id: estadoAnterior.Id_Estado_Medidor,
                        Nombre: estadoAnterior.Nombre_Estado_Medidor
                    }
                }, {
                    Estado_Nuevo: {
                        Id: nuevoEstado.Id_Estado_Medidor,
                        Nombre: nuevoEstado.Nombre_Estado_Medidor
                    }
                }
                );
            } catch (error) {
                console.error('Error al registrar auditoría de actualización de medidor:', error);
            }
        }

        const medidorActualizado = await this.medidorRepository.createQueryBuilder('medidor')
            .leftJoinAndSelect('medidor.Estado_Medidor', 'estado')
            .leftJoinAndSelect('medidor.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('medidor.Id_Medidor = :id', { id: Id_Medidor })
            .getOne();

        if (!medidorActualizado) throw new BadRequestException(`Error al recuperar el medidor actualizado con ID ${Id_Medidor}`);

        return {
            ...medidorActualizado,
            Usuario: medidorActualizado.Usuario ? await this.usuariosService.FormatearUsuarioResponse(medidorActualizado.Usuario) : null
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
}