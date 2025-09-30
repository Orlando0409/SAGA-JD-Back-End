import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../InventarioEntities/Categoria.Entity';
import { CreateCategoriaDto } from "../InventarioDTO's/CreateCategoria.dto";
import { UpdateCategoriaDto } from "../InventarioDTO's/UpdateCategoria.dto";
import { EstadoCategoria } from '../InventarioEntities/EstadoCategoria.Entity';
import { UserEntity } from '../../Usuarios/UsuarioEntities/Usuario.Entity';
import { GetUsuarioCreadorDto } from '../InventarioDTO\'s/getUsuarioCreador.dto';

@Injectable()
export class CategoriasService {
    constructor(
        @InjectRepository(Categoria)
        private readonly categoriaRepository: Repository<Categoria>,

        @InjectRepository(EstadoCategoria)
        private readonly estadoCategoriaRepository: Repository<EstadoCategoria>,

        @InjectRepository(UserEntity)
        private readonly usuarioRepository: Repository<UserEntity>,
    ) {}

    async getAllCategorias() {
        return this.categoriaRepository.find({ relations: ['Estado_Categoria', 'Usuario_Creador', 'Usuario_Creador.Rol'] });
    }

    async createCategoria(dto: CreateCategoriaDto, idUsuarioCreador: number) {
        const CategoriaNormalizada = dto.Nombre_Categoria[0].toUpperCase() + dto.Nombre_Categoria.slice(1).toLowerCase();

        const categoriaExistente = await this.categoriaRepository.findOne({ where: { Nombre_Categoria: CategoriaNormalizada } });
        if (categoriaExistente) { throw new BadRequestException(`La categoría "${CategoriaNormalizada}" ya se encuentra registrada`); }

        // Validar que el usuario existe
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
                Id_Usuario: categoriaCompleta.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: categoriaCompleta.Usuario_Creador.Nombre_Usuario,
                Id_Rol: categoriaCompleta.Usuario_Creador.Rol?.Id_Rol || null
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
        const categoriaExistente = await this.categoriaRepository.findOne({ where: { Id_Categoria: Id_Categoria } });
        if (!categoriaExistente) { throw new NotFoundException(`Categoría con ID ${Id_Categoria} no encontrada`); }

        // Verificar que el nuevo estado existe
        const nuevoEstado = await this.estadoCategoriaRepository.findOne({ where: { Id_Estado_Categoria: Id_Estado_Categoria } });
        if (!nuevoEstado) { throw new NotFoundException(`Estado con ID ${Id_Estado_Categoria} no encontrado en la base de datos`); }

        categoriaExistente.Estado_Categoria = nuevoEstado;
        await this.categoriaRepository.save(categoriaExistente);
        return this.categoriaRepository.findOne({ where: { Id_Categoria: Id_Categoria }, relations: ['Estado_Categoria'] });
    }
}
