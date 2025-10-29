import { BadRequestException, ConflictException, Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnidadMedicion } from '../InventarioEntities/UnidadMedicion.Entity';
import { EstadoUnidadMedicion } from '../InventarioEntities/EstadoUnidadMedicion.Entity';
import { Material } from '../InventarioEntities/Material.Entity';
import { CreateUnidadMedicionDto } from "../InventarioDTO's/CreateUnidadMedicion.dto";
import { UpdateUnidadMedicionDto } from "../InventarioDTO's/UpdateUnidadMedicion.dto";
import { Usuario } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';
import { AuditoriaService } from 'src/Modules/Auditoria/auditoria.service';
import { UsuariosService } from 'src/Modules/Usuarios/Services/usuarios.service';
import { GetUnidadDeMedidaDTO } from '../InventarioDTO\'s/getUnidadDeMedida.dto';


@Injectable()
export class UnidadesDeMedicionService {
    constructor(
        @InjectRepository(UnidadMedicion)
        private readonly unidadMedicionRepository: Repository<UnidadMedicion>,

        @InjectRepository(EstadoUnidadMedicion)
        private readonly estadoUnidadMedicionRepository: Repository<EstadoUnidadMedicion>,

        @InjectRepository(Material)
        private readonly materialRepository: Repository<Material>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        @Inject(forwardRef(() => AuditoriaService))
        private readonly auditoriaService: AuditoriaService,

        @Inject(forwardRef(() => UsuariosService))
        private readonly usuariosService: UsuariosService
    ) { }

    async getAllUnidadesMedicion() {
        const unidades = await this.unidadMedicionRepository.createQueryBuilder('unidad')
            .leftJoinAndSelect('unidad.Estado_Unidad_Medicion', 'estado')
            .leftJoinAndSelect('unidad.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .getMany();

        return Promise.all(unidades.map(async (unidad) => {
            return {
                ...unidad,
                Usuario: await this.usuariosService.FormatearUsuarioResponse(unidad.Usuario)
            };
        }));
    }

    async getUnidadMedicionSimple(): Promise<GetUnidadDeMedidaDTO[]> {
        const unidades = await this.unidadMedicionRepository.find({ select: ['Id_Unidad_Medicion', 'Nombre_Unidad'] });
        return unidades.map(unidad => {
            const dto = new GetUnidadDeMedidaDTO();
            dto.Id_Unidad_Medicion = unidad.Id_Unidad_Medicion;
            dto.Nombre_Unidad_Medicion = unidad.Nombre_Unidad[0].toUpperCase() + unidad.Nombre_Unidad.slice(1).toLowerCase();
            return dto;
        });
    }

    async getUnidadesMedicionActivas() {
        const unidades = await this.unidadMedicionRepository.createQueryBuilder('unidad')
            .leftJoinAndSelect('unidad.Estado_Unidad_Medicion', 'estado')
            .leftJoinAndSelect('unidad.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Unidad_Medicion = :estadoId', { estadoId: 1 })
            .getMany();

        return Promise.all(unidades.map(async (unidad) => {
            return {
                ...unidad,
                Usuario: await this.usuariosService.FormatearUsuarioResponse(unidad.Usuario)
            };
        }));
    }

    async getUnidadesMedicionInactivas() {
        const unidades = await this.unidadMedicionRepository.createQueryBuilder('unidad')
            .leftJoinAndSelect('unidad.Estado_Unidad_Medicion', 'estado')
            .leftJoinAndSelect('unidad.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Unidad_Medicion = :estadoId', { estadoId: 2 })
            .getMany();

        return Promise.all(unidades.map(async (unidad) => {
            return {
                ...unidad,
                Usuario: await this.usuariosService.FormatearUsuarioResponse(unidad.Usuario)
            };
        }));
    }

    async createUnidadMedicion(dto: CreateUnidadMedicionDto, idUsuario: number) {
        const nombreNormalizado = dto.Nombre_Unidad_Medicion[0].toUpperCase() + dto.Nombre_Unidad_Medicion.slice(1).toLowerCase();
        const abreviaturaToLowerCase = dto.Abreviatura.toLowerCase();

        // Verificar que no exista una unidad con el mismo nombre
        const unidadExistentePorNombre = await this.unidadMedicionRepository.findOne({ where: { Nombre_Unidad: nombreNormalizado } });
        if (unidadExistentePorNombre) { throw new ConflictException(`Ya existe una unidad de medición con el nombre "${nombreNormalizado}"`); }

        // Verificar que no exista una unidad con la misma abreviatura
        const unidadExistentePorAbrev = await this.unidadMedicionRepository.findOne({ where: { Abreviatura: abreviaturaToLowerCase } });
        if (unidadExistentePorAbrev) { throw new ConflictException(`Ya existe una unidad de medición con la abreviatura "${abreviaturaToLowerCase}"`); }

        // Validar que el usuario existe
        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) { throw new NotFoundException(`Usuario con ID ${idUsuario} no encontrado`); }

        const unidad = this.unidadMedicionRepository.create({
            Nombre_Unidad: nombreNormalizado,
            Abreviatura: abreviaturaToLowerCase,
            Descripcion: dto.Descripcion,
            Usuario: usuario
        });

        const unidadGuardada = await this.unidadMedicionRepository.save(unidad);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logCreacion(
                'Unidad de Medicion',
                idUsuario,
                unidadGuardada.Id_Unidad_Medicion,
                {
                    Id_Unidad_Medicion: unidadGuardada.Id_Unidad_Medicion,
                    Nombre_Unidad: unidadGuardada.Nombre_Unidad,
                    Abreviatura: unidadGuardada.Abreviatura,
                    Descripcion: unidadGuardada.Descripcion,
                    Estado_Inicial: 'Activo'
                }
            );
        } catch (error) {
            console.error('Error al registrar auditoría de creación de unidad de medición:', error);
        }

        const unidadCompleta = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: unidadGuardada.Id_Unidad_Medicion }, relations: ['Estado_Unidad_Medicion', 'Usuario', 'Usuario.Rol'] });

        if (!unidadCompleta) {
            throw new BadRequestException('Error al recuperar la unidad de medición creada');
        }

        return {
            ...unidadCompleta,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(unidadCompleta.Usuario)
        }
    }

    async updateUnidadMedicion(Id_Unidad_Medicion: number, dto: UpdateUnidadMedicionDto, usuarioId?: number) {
        const unidadExistente = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: Id_Unidad_Medicion } });
        if (!unidadExistente) { throw new NotFoundException(`Unidad de medición con ID ${Id_Unidad_Medicion} no encontrada`); }

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Nombre_Unidad: unidadExistente.Nombre_Unidad,
            Abreviatura: unidadExistente.Abreviatura,
            Descripcion: unidadExistente.Descripcion
        };

        // Validar nombre único si se está actualizando
        if (dto.Nombre_Unidad_Medicion && (dto.Nombre_Unidad_Medicion[0].toUpperCase() + dto.Nombre_Unidad_Medicion.slice(1).toLowerCase()) !== unidadExistente.Nombre_Unidad) {
            const nombreNormalizado = dto.Nombre_Unidad_Medicion[0].toUpperCase() + dto.Nombre_Unidad_Medicion.slice(1).toLowerCase();

            const unidadConNombre = await this.unidadMedicionRepository.findOne({ where: { Nombre_Unidad: nombreNormalizado } });
            if (unidadConNombre) { throw new ConflictException(`Ya existe una unidad de medición con el nombre "${nombreNormalizado}"`); }
        }

        // Validar abreviatura única si se está actualizando
        if (dto.Abreviatura && dto.Abreviatura.toLowerCase() !== unidadExistente.Abreviatura) {
            const abreviaturaToLowerCase = dto.Abreviatura.toLowerCase();

            const unidadConAbrev = await this.unidadMedicionRepository.findOne({ where: { Abreviatura: abreviaturaToLowerCase } });
            if (unidadConAbrev) { throw new ConflictException(`Ya existe una unidad de medición con la abreviatura "${abreviaturaToLowerCase}"`); }
        }

        const unidadActualizada = {
            ...unidadExistente,
            ...dto,
        };

        if (dto.Nombre_Unidad_Medicion) {
            unidadActualizada.Nombre_Unidad = dto.Nombre_Unidad_Medicion[0].toUpperCase() + dto.Nombre_Unidad_Medicion.slice(1).toLowerCase();
        }
        if (dto.Abreviatura) {
            unidadActualizada.Abreviatura = dto.Abreviatura.toLowerCase();
        }

        const unidadGuardada = await this.unidadMedicionRepository.save(unidadActualizada);

        // Registrar en auditoría si se proporciona usuarioId
        if (usuarioId) {
            try {
                await this.auditoriaService.logActualizacion(
                    'Unidad de Medicion',
                    usuarioId,
                    Id_Unidad_Medicion,
                    datosAnteriores,
                    {
                        Nombre_Unidad: unidadGuardada.Nombre_Unidad,
                        Abreviatura: unidadGuardada.Abreviatura,
                        Descripcion: unidadGuardada.Descripcion
                    }
                );
            } catch (error) {
                console.error('Error al registrar auditoría de actualización de unidad de medición:', error);
            }
        }

        // Recargar con las relaciones necesarias y formato controlado
        const unidadCompleta = await this.unidadMedicionRepository.createQueryBuilder('unidad')
            .leftJoinAndSelect('unidad.Estado_Unidad_Medicion', 'estado')
            .leftJoinAndSelect('unidad.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('unidad.Id_Unidad_Medicion = :id', { id: Id_Unidad_Medicion })
            .getOne();

        if (!unidadCompleta) {
            throw new NotFoundException(`Error al recuperar la unidad de medición actualizada con ID ${Id_Unidad_Medicion}`);
        }

        return {
            ...unidadCompleta,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(unidadCompleta.Usuario)
        };
    }

    async updateEstadoUnidadMedicion(Id_Unidad_Medicion: number, Id_Estado_Unidad_Medicion: number, usuarioId?: number) {
        const unidadExistente = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: Id_Unidad_Medicion }, relations: ['Estado_Unidad_Medicion'] });
        if (!unidadExistente) { throw new NotFoundException(`Unidad de medición con ID ${Id_Unidad_Medicion} no encontrada`); }

        // Verificar que el nuevo estado existe
        const nuevoEstado = await this.estadoUnidadMedicionRepository.findOne({ where: { Id_Estado_Unidad_Medicion: Id_Estado_Unidad_Medicion } });
        if (!nuevoEstado) { throw new NotFoundException(`Estado con ID ${Id_Estado_Unidad_Medicion} no encontrado en la base de datos`); }

        // Guardar estado anterior para auditoría
        const estadoAnterior = unidadExistente.Estado_Unidad_Medicion;

        // VALIDACIÓN DE NEGOCIO: No permitir desactivar si hay materiales usándola
        if (nuevoEstado.Nombre_Estado_Unidad_Medicion === 'Inactivo') {
            const materialesUsandoUnidad = await this.materialRepository.count({
                where: {
                    Unidad_Medicion: { Id_Unidad_Medicion: Id_Unidad_Medicion }
                    // Los materiales con Fecha_Baja null son activos (soft delete)
                }
            });

            if (materialesUsandoUnidad > 0) {
                throw new BadRequestException(
                    `No se puede desactivar la unidad de medición "${unidadExistente.Nombre_Unidad}" porque ${materialesUsandoUnidad} material(es) la están usando actualmente. ` +
                    `Primero debe cambiar la unidad de medición de estos materiales o darlos de baja.`
                );
            }
        }

        // Actualizar el estado de la unidad
        unidadExistente.Estado_Unidad_Medicion = nuevoEstado;
        await this.unidadMedicionRepository.save(unidadExistente);

        // Registrar en auditoría si se proporciona usuarioId
        if (usuarioId) {
            try {
                await this.auditoriaService.logActualizacion(
                    'Unidad de Medicion',
                    usuarioId,
                    Id_Unidad_Medicion,
                    {
                        Estado_Anterior: {
                            Id: estadoAnterior.Id_Estado_Unidad_Medicion,
                            Nombre: estadoAnterior.Nombre_Estado_Unidad_Medicion
                        }
                    },
                    {
                        Estado_Nuevo: {
                            Id: nuevoEstado.Id_Estado_Unidad_Medicion,
                            Nombre: nuevoEstado.Nombre_Estado_Unidad_Medicion
                        }
                    }
                );
            } catch (error) {
                console.error('Error al registrar auditoría de cambio de estado de unidad de medición:', error);
            }
        }

        // Recargar con las relaciones necesarias y formato controlado
        const unidadCompleta = await this.unidadMedicionRepository.createQueryBuilder('unidad')
            .leftJoinAndSelect('unidad.Estado_Unidad_Medicion', 'estado')
            .leftJoinAndSelect('unidad.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('unidad.Id_Unidad_Medicion = :id', { id: Id_Unidad_Medicion })
            .getOne();

        if (!unidadCompleta) {
            throw new NotFoundException(`Error al recuperar la unidad de medición actualizada con ID ${Id_Unidad_Medicion}`);
        }

        return {
            ...unidadCompleta,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(unidadCompleta.Usuario)
        };
    }

    /**
     * Formatea la información de una unidad de medición para responses públicos
     * Solo devuelve información básica y necesaria
     */
    async FormatearUnidadMedicionParaResponse(unidad: UnidadMedicion): Promise<{
        Id_Unidad_Medicion: number;
        Nombre_Unidad_Medicion: string;
        Abreviatura: string;
        Estado: {
            Id_Estado_Unidad_Medicion: number;
            Nombre_Estado_Unidad_Medicion: string;
        };
    }> {
        return {
            Id_Unidad_Medicion: unidad.Id_Unidad_Medicion,
            Nombre_Unidad_Medicion: unidad.Nombre_Unidad,
            Abreviatura: unidad.Abreviatura,
            Estado: {
                Id_Estado_Unidad_Medicion: unidad.Estado_Unidad_Medicion?.Id_Estado_Unidad_Medicion || 0,
                Nombre_Estado_Unidad_Medicion: unidad.Estado_Unidad_Medicion?.Nombre_Estado_Unidad_Medicion || 'Sin estado'
            }
        };
    }
}