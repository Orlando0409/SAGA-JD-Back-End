import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnidadMedicion } from '../InventarioEntities/UnidadMedicion.Entity';
import { EstadoUnidadMedicion } from '../InventarioEntities/EstadoUnidadMedicion.Entity';
import { Material } from '../InventarioEntities/Material.Entity';
import { CreateUnidadMedicionDto } from "../InventarioDTO's/CreateUnidadMedicion.dto";
import { UpdateUnidadMedicionDto } from "../InventarioDTO's/UpdateUnidadMedicion.dto";
import { getUnidadDeMedidaDTO } from "../InventarioDTO's/getUnidadDeMedida.dto";
import { Usuario } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';

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
    ) {}

    async getAllUnidadesMedicion() {
        const unidades = await this.unidadMedicionRepository.createQueryBuilder('unidad')
            .leftJoinAndSelect('unidad.Estado_Unidad_Medicion', 'estado')
            .leftJoinAndSelect('unidad.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .getMany();

        return unidades.map(unidad => {
            return {
                ...unidad,
                Usuario_Creador: {
                    Id_Usuario: unidad.Usuario_Creador.Id_Usuario,
                    Nombre_Usuario: unidad.Usuario_Creador.Nombre_Usuario,
                    Id_Rol: unidad.Usuario_Creador.Id_Rol,
                    Nombre_Rol: unidad.Usuario_Creador.Rol?.Nombre_Rol
                }
            };
        });
    }

    async getUnidadMedicionSimple(): Promise<getUnidadDeMedidaDTO[]> {
        const unidades = await this.unidadMedicionRepository.find({ select: ['Id_Unidad_Medicion', 'Nombre_Unidad'] });
        return unidades.map(unidad => {
            const dto = new getUnidadDeMedidaDTO();
            dto.Id_Unidad_Medicion = unidad.Id_Unidad_Medicion;
            dto.Nombre_Unidad_Medicion = unidad.Nombre_Unidad[0].toUpperCase() + unidad.Nombre_Unidad.slice(1).toLowerCase();
            return dto;
        });
    }

    async getUnidadesMedicionActivas() {
        const unidades = await this.unidadMedicionRepository.createQueryBuilder('unidad')
            .leftJoinAndSelect('unidad.Estado_Unidad_Medicion', 'estado')
            .leftJoinAndSelect('unidad.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Unidad_Medicion = :estadoId', { estadoId: 1 })
            .getMany();

        return unidades.map(unidad => {
            return {
                ...unidad,
                Usuario_Creador: {
                    Id_Usuario: unidad.Usuario_Creador.Id_Usuario,
                    Nombre_Usuario: unidad.Usuario_Creador.Nombre_Usuario,
                    Id_Rol: unidad.Usuario_Creador.Id_Rol,
                    Nombre_Rol: unidad.Usuario_Creador.Rol?.Nombre_Rol
                }
            };
        });
    }

    async getUnidadesMedicionInactivas() {
        const unidades = await this.unidadMedicionRepository.createQueryBuilder('unidad')
            .leftJoinAndSelect('unidad.Estado_Unidad_Medicion', 'estado')
            .leftJoinAndSelect('unidad.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Unidad_Medicion = :estadoId', { estadoId: 2 })
            .getMany();

        return unidades.map(unidad => {
            return {
                ...unidad,
                Usuario_Creador: {
                    Id_Usuario: unidad.Usuario_Creador.Id_Usuario,
                    Nombre_Usuario: unidad.Usuario_Creador.Nombre_Usuario,
                    Id_Rol: unidad.Usuario_Creador.Id_Rol,
                    Nombre_Rol: unidad.Usuario_Creador.Rol?.Nombre_Rol
                }
            };
        });
    }

    async createUnidadMedicion(dto: CreateUnidadMedicionDto, idUsuarioCreador: number) {
        const nombreNormalizado = dto.Nombre_Unidad_Medicion[0].toUpperCase() + dto.Nombre_Unidad_Medicion.slice(1).toLowerCase();
        const abreviaturaToLowerCase = dto.Abreviatura.toLowerCase();

        // Verificar que no exista una unidad con el mismo nombre
        const unidadExistentePorNombre = await this.unidadMedicionRepository.findOne({ where: { Nombre_Unidad: nombreNormalizado } });
        if (unidadExistentePorNombre) { throw new ConflictException(`Ya existe una unidad de medición con el nombre "${nombreNormalizado}"`); }

        // Verificar que no exista una unidad con la misma abreviatura
        const unidadExistentePorAbrev = await this.unidadMedicionRepository.findOne({ where: { Abreviatura: abreviaturaToLowerCase } });
        if (unidadExistentePorAbrev) { throw new ConflictException(`Ya existe una unidad de medición con la abreviatura "${abreviaturaToLowerCase}"`); }

        // Validar que el usuario existe
        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuarioCreador } });
        if (!usuario) { throw new NotFoundException(`Usuario con ID ${idUsuarioCreador} no encontrado`); }

        const unidad = this.unidadMedicionRepository.create({
            Nombre_Unidad: nombreNormalizado,
            Abreviatura: abreviaturaToLowerCase,
            Descripcion: dto.Descripcion,
            Usuario_Creador: usuario
        });

        const unidadGuardada = await this.unidadMedicionRepository.save(unidad);
        const unidadCompleta = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: unidadGuardada.Id_Unidad_Medicion }, relations: ['Estado_Unidad_Medicion', 'Usuario_Creador', 'Usuario_Creador.Rol'] });

        if (!unidadCompleta) {
            throw new BadRequestException('Error al recuperar la unidad de medición creada');
        }

        return {
            ...unidadCompleta,
            Usuario_Creador: {
                Id_Usuario: unidadCompleta.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: unidadCompleta.Usuario_Creador.Nombre_Usuario,
                Id_Rol: unidadCompleta.Usuario_Creador.Id_Rol,
            }
        }
    }

    async updateUnidadMedicion(Id_Unidad_Medicion: number, dto: UpdateUnidadMedicionDto) {
        const unidadExistente = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: Id_Unidad_Medicion } });
        if (!unidadExistente) { throw new NotFoundException(`Unidad de medición con ID ${Id_Unidad_Medicion} no encontrada`); }

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

        return this.unidadMedicionRepository.save(unidadActualizada);
    }

    async updateEstadoUnidadMedicion(Id_Unidad_Medicion: number, Id_Estado_Unidad_Medicion: number) {
        const unidadExistente = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: Id_Unidad_Medicion }, relations: ['Estado_Unidad_Medicion'] });
        if (!unidadExistente) { throw new NotFoundException(`Unidad de medición con ID ${Id_Unidad_Medicion} no encontrada`); }

        // Verificar que el nuevo estado existe
        const nuevoEstado = await this.estadoUnidadMedicionRepository.findOne({ where: { Id_Estado_Unidad_Medicion: Id_Estado_Unidad_Medicion } });
        if (!nuevoEstado) { throw new NotFoundException(`Estado con ID ${Id_Estado_Unidad_Medicion} no encontrado en la base de datos`); }

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
        return this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: Id_Unidad_Medicion }, relations: ['Estado_Unidad_Medicion'] });
    }
}