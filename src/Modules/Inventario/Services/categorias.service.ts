import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../InventarioEntities/Categoria.Entity';
import { CreateCategoriaDto } from "../InventarioDTO's/CreateCategoria.dto";
import { UpdateCategoriaDto } from "../InventarioDTO's/UpdateCategoria.dto";
import { EstadoCategoria } from '../InventarioEntities/EstadoCategoria.Entity';
import { Usuario } from '../../Usuarios/UsuarioEntities/Usuario.Entity';
import { MaterialCategoria } from '../InventarioEntities/MaterialCategoria.Entity';
import { AuditoriaService } from '../../Auditoria/auditoria.service';

@Injectable()
export class CategoriasService {
    constructor(
        @InjectRepository(Categoria)
        private readonly categoriaRepository: Repository<Categoria>,

        @InjectRepository(EstadoCategoria)
        private readonly estadoCategoriaRepository: Repository<EstadoCategoria>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        @InjectRepository(MaterialCategoria)
        private readonly materialCategoriaRepository: Repository<MaterialCategoria>,

        private readonly auditoriaService: AuditoriaService
    ) {}

    async getAllCategorias() {
        const categorias = await this.categoriaRepository.createQueryBuilder('categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estado')
            .leftJoinAndSelect('categoria.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .getMany();

        return categorias.map(categoria => {
            return {
                ...categoria,
                Usuario_Creador: {
                    Id_Usuario: categoria.Usuario_Creador.Id_Usuario,
                    Nombre_Usuario: categoria.Usuario_Creador.Nombre_Usuario,
                    Id_Rol: categoria.Usuario_Creador.Id_Rol,
                    Nombre_Rol: categoria.Usuario_Creador.Rol?.Nombre_Rol
                }
            };
        });
    }

    async getCategoriasActivas() {
        const categorias = await this.categoriaRepository.createQueryBuilder('categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estado')
            .leftJoinAndSelect('categoria.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Categoria = :estado', { estado: 1 }) // 1 = Activa
            .getMany();

        return categorias.map(categoria => {
            return {
                ...categoria,
                Usuario_Creador: {
                    Id_Usuario: categoria.Usuario_Creador.Id_Usuario,
                    Nombre_Usuario: categoria.Usuario_Creador.Nombre_Usuario,
                    Id_Rol: categoria.Usuario_Creador.Id_Rol,
                    Nombre_Rol: categoria.Usuario_Creador.Rol?.Nombre_Rol
                }
            };
        });
    }

    async getCategoriasInactivas() {
        const categorias = await this.categoriaRepository.createQueryBuilder('categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estado')
            .leftJoinAndSelect('categoria.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Categoria = :estado', { estado: 2 }) // 2 = Inactiva
            .getMany();

        return categorias.map(categoria => {
            return {
                ...categoria,
                Usuario_Creador: {
                    Id_Usuario: categoria.Usuario_Creador.Id_Usuario,
                    Nombre_Usuario: categoria.Usuario_Creador.Nombre_Usuario,
                    Id_Rol: categoria.Usuario_Creador.Id_Rol,
                    Nombre_Rol: categoria.Usuario_Creador.Rol?.Nombre_Rol
                }
            };
        });
    }

    async createCategoria(dto: CreateCategoriaDto, idUsuarioCreador: number) {
        const CategoriaNormalizada = dto.Nombre_Categoria[0].toUpperCase() + dto.Nombre_Categoria.slice(1).toLowerCase();

        const categoriaExistente = await this.categoriaRepository.findOne({ where: { Nombre_Categoria: CategoriaNormalizada } });
        if (categoriaExistente) { throw new BadRequestException(`La categoría "${CategoriaNormalizada}" ya se encuentra registrada`); }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuarioCreador }, relations: ['Rol'] });
        if (!usuario) { throw new BadRequestException(`Usuario con ID ${idUsuarioCreador} no encontrado`); }

        const categoria = this.categoriaRepository.create({
            ...dto,
            Nombre_Categoria: CategoriaNormalizada,
            Usuario_Creador: usuario,
        });

        const categoriaGuardada = await this.categoriaRepository.save(categoria);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logCreacion(
                'Categoria',
                idUsuarioCreador,
                categoriaGuardada.Id_Categoria,
                {
                    Id_Categoria: categoriaGuardada.Id_Categoria,
                    Nombre_Categoria: categoriaGuardada.Nombre_Categoria,
                    Descripcion_Categoria: categoriaGuardada.Descripcion_Categoria,
                    Estado_Inicial: 'Activa'
                }
            );
        } catch (error) {
            console.error('Error al registrar auditoría de creación de categoría:', error);
        }

        const categoriaCompleta = await this.categoriaRepository.findOne({ 
            where: { Id_Categoria: categoriaGuardada.Id_Categoria }, 
            relations: ['Estado_Categoria', 'Usuario_Creador', 'Usuario_Creador.Rol']
        });

        if (!categoriaCompleta) {
            throw new BadRequestException('Error al recuperar la categoría creada');
        }

        // Mapear a DTO personalizado
        return {
            Id_Categoria: categoriaCompleta.Id_Categoria,
            Nombre_Categoria: categoriaCompleta.Nombre_Categoria,
            Descripcion_Categoria: categoriaCompleta.Descripcion_Categoria,
            Estado_Categoria: categoriaCompleta.Estado_Categoria,
            Usuario_Creador: {
                Id_Usuario: usuario.Id_Usuario,
                Nombre_Usuario: usuario.Nombre_Usuario,
                Id_Rol: usuario.Id_Rol,
                Nombre_Rol: usuario.Rol?.Nombre_Rol
            }
        };
    }

    async updateCategoria(Id_Categoria: number, dto: UpdateCategoriaDto, usuarioId: number) {
        const categoriaExistente = await this.categoriaRepository.findOne({ where: { Id_Categoria: Id_Categoria } });
        if (!categoriaExistente) { throw new NotFoundException(`Categoría con ID ${Id_Categoria} no encontrada`); }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: usuarioId }, relations: ['Rol'] });
        if (!usuario) { throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`); }

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Nombre_Categoria: categoriaExistente.Nombre_Categoria,
            Descripcion_Categoria: categoriaExistente.Descripcion_Categoria,
            Estado_Categoria: categoriaExistente.Estado_Categoria,
        };

        // Validar nombre único si se está actualizando
        if (dto.Nombre_Categoria && (dto.Nombre_Categoria[0].toUpperCase() + dto.Nombre_Categoria.slice(1).toLowerCase()) !== categoriaExistente.Nombre_Categoria) {
            const nombreNormalizado = dto.Nombre_Categoria[0].toUpperCase() + dto.Nombre_Categoria.slice(1).toLowerCase();
            const categoriaConNombre = await this.categoriaRepository.findOne({ where: { Nombre_Categoria: nombreNormalizado } });
            if (categoriaConNombre) { throw new ConflictException(`Ya existe una categoría con el nombre "${nombreNormalizado}"`); }
        }

        // Actualizar la categoría con normalización
        const datosActualizados = { ...dto };
        if (dto.Nombre_Categoria) {
            datosActualizados.Nombre_Categoria = dto.Nombre_Categoria[0].toUpperCase() + dto.Nombre_Categoria.slice(1).toLowerCase();
        }
        Object.assign(categoriaExistente, datosActualizados);
        const categoriaActualizada = await this.categoriaRepository.save(categoriaExistente);

        // Registrar en auditoría si se proporciona usuarioId
        if (usuarioId) {
            try {
                await this.auditoriaService.logActualizacion(
                    'Categoria',
                    usuarioId,
                    Id_Categoria,
                    datosAnteriores,
                    {
                        Nombre_Categoria: categoriaActualizada.Nombre_Categoria,
                        Descripcion_Categoria: categoriaActualizada.Descripcion_Categoria,
                        Estado_Categoria: categoriaActualizada.Estado_Categoria
                    }
                );
            } catch (error) {
                console.error('Error al registrar auditoría de actualización de categoría:', error);
            }
        }

        // Recargar la categoría con las relaciones necesarias pero con formato controlado
        const categoriaCompleta = await this.categoriaRepository.createQueryBuilder('categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estado')
            .leftJoinAndSelect('categoria.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('categoria.Id_Categoria = :id', { id: Id_Categoria })
            .getOne();

        if (!categoriaCompleta) {
            throw new NotFoundException(`Error al recuperar la categoría actualizada con ID ${Id_Categoria}`);
        }

        // Formatear la respuesta para mostrar solo información básica del usuario
        return {
            ...categoriaCompleta,
            Usuario_Creador: {
                Id_Usuario: categoriaCompleta.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: categoriaCompleta.Usuario_Creador.Nombre_Usuario,
                Id_Rol: categoriaCompleta.Usuario_Creador.Id_Rol,
                Nombre_Rol: categoriaCompleta.Usuario_Creador.Rol?.Nombre_Rol
            }
        };
    }

    async updateEstadoCategoria(Id_Categoria: number, Id_Estado_Categoria: number, usuarioId: number) {
        const categoriaExistente = await this.categoriaRepository.findOne({ where: { Id_Categoria: Id_Categoria }, relations: ['Estado_Categoria'] });
        if (!categoriaExistente) { throw new NotFoundException(`Categoría con ID ${Id_Categoria} no encontrada`); }

        // Verificar que el nuevo estado existe
        const nuevoEstado = await this.estadoCategoriaRepository.findOne({ where: { Id_Estado_Categoria: Id_Estado_Categoria } });
        if (!nuevoEstado) { throw new NotFoundException(`Estado con ID ${Id_Estado_Categoria} no encontrado en la base de datos`); }

        // Guardar estado anterior para auditoría
        const estadoAnterior = categoriaExistente.Estado_Categoria;

        // VALIDACIÓN DE NEGOCIO: No permitir desactivar si hay materiales usándola
        if (nuevoEstado.Nombre_Estado_Categoria === 'Inactiva') {
            const materialesUsandoCategoria = await this.materialCategoriaRepository.count({
                where: { 
                    Categoria: { Id_Categoria: Id_Categoria }
                }
            });

            if (materialesUsandoCategoria > 0) {
                throw new BadRequestException(
                    `No se puede desactivar la categoría "${categoriaExistente.Nombre_Categoria}" porque ${materialesUsandoCategoria} material(es) la están usando actualmente. ` +
                    `Primero debe cambiar la categoría de estos materiales o eliminarla de ellos.`
                );
            }
        }

        categoriaExistente.Estado_Categoria = nuevoEstado;
        await this.categoriaRepository.save(categoriaExistente);

        // Registrar en auditoría si se proporciona usuarioId
        if (usuarioId) {
            try {
                await this.auditoriaService.logActualizacion(
                    'Categoria',
                    usuarioId,
                    Id_Categoria,
                    {
                        Estado_Anterior: {
                            Id: estadoAnterior.Id_Estado_Categoria,
                            Nombre: estadoAnterior.Nombre_Estado_Categoria
                        }
                    },
                    {
                        Estado_Nuevo: {
                            Id: nuevoEstado.Id_Estado_Categoria,
                            Nombre: nuevoEstado.Nombre_Estado_Categoria
                        }
                    }
                );
            } catch (error) {
                console.error('Error al registrar auditoría de cambio de estado de categoría:', error);
            }
        }

        // Recargar la categoría con las relaciones necesarias pero con formato controlado
        const categoriaCompleta = await this.categoriaRepository.createQueryBuilder('categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estado')
            .leftJoinAndSelect('categoria.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('categoria.Id_Categoria = :id', { id: Id_Categoria })
            .getOne();

        if (!categoriaCompleta) {
            throw new NotFoundException(`Error al recuperar la categoría actualizada con ID ${Id_Categoria}`);
        }

        // Formatear la respuesta para mostrar solo información básica del usuario
        return {
            ...categoriaCompleta,
            Usuario_Actualizador: {
                Id_Usuario: categoriaCompleta.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: categoriaCompleta.Usuario_Creador.Nombre_Usuario,
                Id_Rol: categoriaCompleta.Usuario_Creador.Id_Rol,
                Nombre_Rol: categoriaCompleta.Usuario_Creador.Rol?.Nombre_Rol
            }
        };
    }
}
