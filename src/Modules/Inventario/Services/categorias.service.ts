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
import { UsuariosService } from '../../Usuarios/Services/usuarios.service';

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

        private readonly auditoriaService: AuditoriaService,

        private readonly usuariosService: UsuariosService
    ) {}

    async getAllCategorias() {
        const categorias = await this.categoriaRepository.createQueryBuilder('categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estado')
            .leftJoinAndSelect('categoria.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .getMany();

        return Promise.all(categorias.map(async categoria => {
            return {
                ...categoria,
                Usuario: categoria.Usuario ? await this.usuariosService.FormatearUsuarioResponse(categoria.Usuario) : null
            };
        }));
    }

    async getCategoriasActivas() {
        const categorias = await this.categoriaRepository.createQueryBuilder('categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estado')
            .leftJoinAndSelect('categoria.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('categoria.Id_Estado_Categoria = :estadoId', { estadoId: 1 })
            .getMany();

        return Promise.all(categorias.map(async categoria => {
            return {
                ...categoria,
                Usuario: categoria.Usuario ? await this.usuariosService.FormatearUsuarioResponse(categoria.Usuario) : null
            };
        }));
    }

    async getCategoriasInactivas() {
        const categorias = await this.categoriaRepository.createQueryBuilder('categoria')
            .leftJoinAndSelect('categoria.Estado_Categoria', 'estado')
            .leftJoinAndSelect('categoria.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('estado.Id_Estado_Categoria = :estado', { estado: 2 }) // 2 = Inactiva
            .getMany();

        return Promise.all(categorias.map(async categoria => {
            return {
                ...categoria,
                Usuario: categoria.Usuario ? await this.usuariosService.FormatearUsuarioResponse(categoria.Usuario) : null
            };
        }));
    }

    async createCategoria(dto: CreateCategoriaDto, idUsuario: number) {
        if (!idUsuario) { throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción'); }

        const CategoriaNormalizada = dto.Nombre_Categoria[0].toUpperCase() + dto.Nombre_Categoria.slice(1).toLowerCase();

        const categoriaExistente = await this.categoriaRepository.findOne({ where: { Nombre_Categoria: CategoriaNormalizada } });
        if (categoriaExistente) { throw new BadRequestException(`La categoría "${CategoriaNormalizada}" ya se encuentra registrada`); }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario }, relations: ['Rol'] });
        if (!usuario) { throw new BadRequestException(`Usuario con ID ${idUsuario} no encontrado`); }

        const categoria = this.categoriaRepository.create({
            ...dto,
            Nombre_Categoria: CategoriaNormalizada,
            Usuario: usuario,
        });

        const categoriaGuardada = await this.categoriaRepository.save(categoria);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logCreacion(
                'Categoria',
                idUsuario,
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
            relations: ['Estado_Categoria', 'Usuario', 'Usuario.Rol']
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
            Usuario: await this.usuariosService.FormatearUsuarioResponse(categoriaCompleta.Usuario)
        };
    }

    async updateCategoria(Id_Categoria: number, dto: UpdateCategoriaDto, idUsuario: number) {
        if (!idUsuario) {
            throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');
        }

        const categoriaExistente = await this.categoriaRepository.findOne({ where: { Id_Categoria: Id_Categoria } });
        if (!categoriaExistente) { throw new NotFoundException(`Categoría con ID ${Id_Categoria} no encontrada`); }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario }, relations: ['Rol'] });
        if (!usuario) { throw new NotFoundException(`Usuario con ID ${idUsuario} no encontrado`); }

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
        if (idUsuario) {
            try {
                await this.auditoriaService.logActualizacion(
                    'Categoria',
                    idUsuario,
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
            .leftJoinAndSelect('categoria.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('categoria.Id_Categoria = :id', { id: Id_Categoria })
            .getOne();

        if (!categoriaCompleta) {
            throw new NotFoundException(`Error al recuperar la categoría actualizada con ID ${Id_Categoria}`);
        }

        // Formatear la respuesta para mostrar solo información básica del usuario
        return {
            ...categoriaCompleta,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(categoriaCompleta.Usuario)
        };
    }

    async updateEstadoCategoria(Id_Categoria: number, Id_Estado_Categoria: number, idUsuario: number) {
        if (!idUsuario) {
            throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');
        }

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
        if (idUsuario) {
            try {
                await this.auditoriaService.logActualizacion(
                    'Categoria',
                    idUsuario,
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
            .leftJoinAndSelect('categoria.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('categoria.Id_Categoria = :id', { id: Id_Categoria })
            .getOne();

        if (!categoriaCompleta) {
            throw new NotFoundException(`Error al recuperar la categoría actualizada con ID ${Id_Categoria}`);
        }

        // Formatear la respuesta para mostrar solo información básica del usuario
        return {
            ...categoriaCompleta,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(categoriaCompleta.Usuario)
        };
    }

    /**
     * Formatea la información de una categoría para responses públicos
     * Solo devuelve información básica y necesaria
     */
    async FormatearCategoriaParaResponse(categoria: Categoria): Promise<{
        Id_Categoria: number;
        Nombre_Categoria: string;
        Estado: {
            Id_Estado_Categoria: number;
            Nombre_Estado_Categoria: string;
        };
    }> {
        return {
            Id_Categoria: categoria.Id_Categoria,
            Nombre_Categoria: categoria.Nombre_Categoria,
            Estado: {
                Id_Estado_Categoria: categoria.Estado_Categoria?.Id_Estado_Categoria || 0,
                Nombre_Estado_Categoria: categoria.Estado_Categoria?.Nombre_Estado_Categoria || 'Sin estado'
            }
        };
    }
}
