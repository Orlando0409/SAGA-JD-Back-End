import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UpdateProyectoDto } from "./ProyectoDTO's/UpdateProyecto.dto";
import { CreateProyectoDto } from "./ProyectoDTO's/CreateProyecto.dto";
import { Proyecto } from "./ProyectoEntities/Proyecto.Entity";
import { EstadoProyecto } from "./ProyectoEntities/EstadoProyecto.Entity";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { Public } from "../auth/Decorator/Public.decorator";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";

@Injectable()
export class ProyectoService {
    constructor(
        @InjectRepository(Proyecto)
        private readonly proyectoRepository: Repository<Proyecto>,

        @InjectRepository(EstadoProyecto)
        private readonly proyectoEstadoRepository: Repository<EstadoProyecto>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly usuariosService: UsuariosService,

        private readonly auditoriaService: AuditoriaService,
    ) { }

    @Public()
    async getProyectosVisibles() {
        const proyectos = await this.proyectoRepository.createQueryBuilder('proyecto')
            .leftJoinAndSelect('proyecto.Estado', 'estado')
            .leftJoinAndSelect('proyecto.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('proyecto.Visible = :visible', { visible: true })
            .getMany();

        return proyectos.map(proyecto => ({
            ...proyecto,
            Usuario: proyecto.Usuario ?
                await this.usuariosService.FormatearUsuarioResponse(proyecto.Usuario) : null
        })));
    }

    async getProyectosInvisibles() {
        const proyectos = await this.proyectoRepository.createQueryBuilder('proyecto')
            .leftJoinAndSelect('proyecto.Estado', 'estado')
            .leftJoinAndSelect('proyecto.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('proyecto.Visible = :visible', { visible: false })
            .getMany();

        return proyectos.map(proyecto => ({
            ...proyecto,
            Usuario: proyecto.Usuario ?
                await this.usuariosService.FormatearUsuarioResponse(proyecto.Usuario) : null
        })));
    }

    async getAllProyectos() {
        const proyectos = await this.proyectoRepository.createQueryBuilder('proyecto')
            .leftJoinAndSelect('proyecto.Estado', 'estado')
            .leftJoinAndSelect('proyecto.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .getMany();

        return proyectos.map(proyecto => ({
            ...proyecto,
            Usuario: proyecto.Usuario ?
                await this.usuariosService.FormatearUsuarioResponse(proyecto.Usuario) : null
        })));
    }

    async CreateProyecto(dto: CreateProyectoDto, idUsuario: number, file?: Express.Multer.File) {
        if (!idUsuario) { throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción'); }
        if (!file) throw new BadRequestException('Debe subir una imagen para el proyecto');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario no existe.');

        // Obtener estado por defecto "En Planeamiento"
        const estadoInicial = await this.proyectoEstadoRepository.findOne({ where: { Id_Estado_Proyecto: 1 } });
        if (!estadoInicial) { throw new BadRequestException('Estado por defecto no encontrado'); }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuarioCreador }, relations: ['Rol'] });
        if (!usuario) { throw new BadRequestException(`Usuario con ID ${idUsuarioCreador} no encontrado`); }

        dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase();
        dto.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase();

        const Proyecto = await this.dropboxFilesService.uploadFileDownloadOnly(file, 'Proyectos', dto.Titulo);

        // Crear objeto entidad
        const proyecto = this.proyectoRepository.create({
            ...dto,
            Imagen_Url: Proyecto.url,
            Estado: estadoInicial,
            Visible: false,
            Usuario_Creador: usuario
        });

        // Guardar en BD
        const proyectoGuardado = await this.proyectoRepository.save(proyecto);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logCreacion('Proyecto', idUsuario, proyectoGuardado.Id_Proyecto, {
                Id_Proyecto: proyectoGuardado.Id_Proyecto,
                Titulo: proyectoGuardado.Titulo,
                Descripcion: proyectoGuardado.Descripcion,
                Estado_Inicial: estadoInicial.Nombre_Estado,
                Visible: proyectoGuardado.Visible,
                Tiene_Imagen: !!proyectoGuardado.Imagen_Url
            });
        } catch (error) {
            console.error('Error al registrar auditoría de creación de proyecto:', error);
        }

        return {
            ...proyectoGuardado,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
        }
    }

    async UpdateProyecto(Id_Proyecto: number, dto: UpdateProyectoDto, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario no existe.');

        const proyecto = await this.proyectoRepository.findOne({
            where: { Id_Proyecto },
            relations: ['Estado', 'Usuario', 'Usuario.Rol']
        });
        if (!proyecto) { throw new NotFoundException(`Proyecto con id ${Id_Proyecto} no encontrado`); }

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Titulo: proyecto.Titulo,
            Descripcion: proyecto.Descripcion,
            Estado: proyecto.Estado?.Nombre_Estado,
            Visible: proyecto.Visible
        };

        if (dto.Titulo) {
            dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase();
        }

        if (dto.Descripcion) {
            dto.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase();
        }

        Object.assign(proyecto, dto);
        const proyectoActualizado = await this.proyectoRepository.save(proyecto);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Proyecto', idUsuario, Id_Proyecto, datosAnteriores, {
                Titulo: proyectoActualizado.Titulo,
                Descripcion: proyectoActualizado.Descripcion,
                Estado: proyectoActualizado.Estado?.Nombre_Estado,
                Visible: proyectoActualizado.Visible
            });
        } catch (error) {
            console.error('Error al registrar auditoría de actualización de proyecto:', error);
        }

        return {
            ...proyectoActualizado,
            Usuario: proyectoActualizado.Usuario ?
                await this.usuariosService.FormatearUsuarioResponse(proyectoActualizado.Usuario) : null
        };
    }

    async updateEstadoProyecto(idProyecto: number, idEstadoProyecto: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario no existe.');

        const proyecto = await this.proyectoRepository.findOne({
            where: { Id_Proyecto: idProyecto },
            relations: ['Estado', 'Usuario', 'Usuario.Rol']
        });
        if (!proyecto) throw new NotFoundException(`Proyecto con id ${idProyecto} no encontrado`);

        const nuevoEstado = await this.proyectoEstadoRepository.findOne({ where: { Id_Estado_Proyecto: idEstadoProyecto } });
        if (!nuevoEstado) { throw new Error(`Estado con id ${idEstadoProyecto} no encontrado`); }

        // Guardar estado anterior para auditoría
        const estadoAnterior = proyecto.Estado;

        proyecto.Estado = nuevoEstado;
        const proyectoActualizado = await this.proyectoRepository.save(proyecto);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Proyecto', idUsuario, idProyecto, {
                Titulo: proyecto.Titulo,
                Estado_Anterior: {
                    Id: estadoAnterior.Id_Estado_Proyecto,
                    Nombre: estadoAnterior.Nombre_Estado
                }
            }, {
                Estado_Nuevo: {
                    Id: nuevoEstado.Id_Estado_Proyecto,
                    Nombre: nuevoEstado.Nombre_Estado
                }
            });
        } catch (error) {
            console.error('Error al registrar auditoría de cambio de estado de proyecto:', error);
        }

        return {
            ...proyectoActualizado,
            Usuario: proyectoActualizado.Usuario ?
                await this.usuariosService.FormatearUsuarioResponse(proyectoActualizado.Usuario) : null
        };
    }

    async updateVisibilidadProyecto(Id_Proyecto: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario no existe.');

        const proyecto = await this.proyectoRepository.findOne({
            where: { Id_Proyecto },
            relations: ['Estado', 'Usuario', 'Usuario.Rol']
        });
        if (!proyecto) { throw new Error(`Proyecto con id ${Id_Proyecto} no encontrado`); }

        // Guardar visibilidad anterior para auditoría
        const visibilidadAnterior = proyecto.Visible;

        // Toggle: alterna entre true y false
        proyecto.Visible = !proyecto.Visible;
        const proyectoActualizado = await this.proyectoRepository.save(proyecto);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Proyecto', idUsuario, Id_Proyecto, {
                Titulo: proyecto.Titulo,
                Visibilidad_Anterior: visibilidadAnterior ? 'Público' : 'Privado'
            }, {
                Visibilidad_Nueva: proyectoActualizado.Visible ? 'Público' : 'Privado'
            });
        } catch (error) {
            console.error('Error al registrar auditoría de cambio de visibilidad de proyecto:', error);
        }

        return {
            ...proyectoActualizado,
            Usuario: proyectoActualizado.Usuario ? await this.usuariosService.FormatearUsuarioResponse(proyectoActualizado.Usuario) : null
        };
    }
}