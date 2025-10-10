import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../InventarioEntities/Categoria.Entity';
import { CreateCategoriaDto } from "../InventarioDTO's/CreateCategoria.dto";
import { UpdateCategoriaDto } from "../InventarioDTO's/UpdateCategoria.dto";
import { EstadoCategoria } from '../InventarioEntities/EstadoCategoria.Entity';
import { Usuario } from '../../Usuarios/UsuarioEntities/Usuario.Entity';
import { plainToClass } from "class-transformer";
import { GetUsuarioCreadorDto } from '../InventarioDTO\'s/getUsuarioCreador.dto';
import { MaterialCategoria } from '../InventarioEntities/MaterialCategoria.Entity';

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
    ) {}

    async getAllCategorias() {
        const categorias = await this.categoriaRepository.find({ relations: ['Estado_Categoria', 'Usuario_Creador', 'Usuario_Creador.Rol'] });
        return categorias.map(categoria => {
            return {
                ...categoria,
                Usuario_Creador: categoria.Usuario_Creador ? plainToClass(GetUsuarioCreadorDto, categoria.Usuario_Creador, { excludeExtraneousValues: true }) : null
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

    async updateCategoria(Id_Categoria: number, dto: UpdateCategoriaDto) {
        const categoriaExistente = await this.categoriaRepository.findOne({ where: { Id_Categoria: Id_Categoria } });
        if (!categoriaExistente) { throw new NotFoundException(`Categoría con ID ${Id_Categoria} no encontrada`); }

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
        return this.categoriaRepository.save(categoriaExistente);
    }

    async updateEstadoCategoria(Id_Categoria: number, Id_Estado_Categoria: number) {
        const categoriaExistente = await this.categoriaRepository.findOne({ where: { Id_Categoria: Id_Categoria }, relations: ['Estado_Categoria'] });
        if (!categoriaExistente) { throw new NotFoundException(`Categoría con ID ${Id_Categoria} no encontrada`); }

        // Verificar que el nuevo estado existe
        const nuevoEstado = await this.estadoCategoriaRepository.findOne({ where: { Id_Estado_Categoria: Id_Estado_Categoria } });
        if (!nuevoEstado) { throw new NotFoundException(`Estado con ID ${Id_Estado_Categoria} no encontrado en la base de datos`); }

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
        return this.categoriaRepository.findOne({ where: { Id_Categoria: Id_Categoria }, relations: ['Estado_Categoria'] });
    }
}
