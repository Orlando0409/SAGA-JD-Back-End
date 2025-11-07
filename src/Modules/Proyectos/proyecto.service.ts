import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UpdateProyectoDto } from "./ProyectoDTO's/UpdateProyecto.dto";
import { CreateProyectoDto } from "./ProyectoDTO's/CreateProyecto.dto";
import { Proyecto } from "./ProyectoEntities/Proyecto.Entity";
import { EstadoProyecto } from "./ProyectoEntities/EstadoProyecto.Entity";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { UsuariosService } from "../Usuarios/Services/usuarios.service";
import { AuditoriaService } from "../Auditoria/auditoria.service";
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

    async getProyectos() {
        const proyectos = await this.proyectoRepository.createQueryBuilder('proyecto')
            .leftJoinAndSelect('proyecto.Estado', 'estado')
            .leftJoinAndSelect('proyecto.Usuario', 'usuario')
            .getMany();

        return Promise.all(proyectos.map(async proyecto => ({
                ...proyecto,
                Usuario: await this.usuariosService.FormatearUsuarioResponse(proyecto.Usuario)
            })));
    }

    async getProyectosVisibles() {
        const proyectos = await this.proyectoRepository.createQueryBuilder('proyecto')
            .leftJoinAndSelect('proyecto.Estado', 'estado')
            .where('proyecto.Visible = :visible', { visible: true })
            .getMany();

        return Promise.all(proyectos.map(async proyecto => ({
                ...proyecto
            })));
    }

    async findProyectobyId(Id_Proyecto: number) {
        const proyecto = await this.proyectoRepository.findOne({ where: { Id_Proyecto }, relations: ['Estado'] });
        if (!proyecto) { throw new NotFoundException(`Proyecto con id ${Id_Proyecto} no encontrado`); }
        return proyecto;
    }

    async CreateProyecto(dto: CreateProyectoDto, idUsuario: number, file?: Express.Multer.File) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario no existe.');

        if (!file) { throw new Error('Debe subir una imagen para el proyecto'); }

        // Obtener estado por defecto "En Planeamiento"
        const estadoInicial = await this.proyectoEstadoRepository.findOne({ where: { Id_Estado_Proyecto: 1 } });
        if (!estadoInicial) { throw new Error('Estado por defecto no encontrado'); }

        // Normalizar datos antes de procesar
        dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase();
        dto.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase();

        const Proyecto = await this.dropboxFilesService.uploadFileDownloadOnly(file, 'Proyectos', dto.Titulo);

        // Crear objeto entidad
        const proyecto = this.proyectoRepository.create({
            ...dto,
            Imagen_Url: Proyecto.url,
            Estado: estadoInicial,
            Usuario: usuario
        });

        // Guardar en BD
        const proyectoGuardado = await this.proyectoRepository.save(proyecto);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logCreacion('Proyectos', idUsuario, proyectoGuardado.Id_Proyecto, {
                Id_Proyecto: proyectoGuardado.Id_Proyecto,
                Titulo: proyectoGuardado.Titulo,
                Descripcion: proyectoGuardado.Descripcion,
                Estado: estadoInicial.Nombre_Estado,
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

    async UpdateProyecto(idProyecto: number, dto: UpdateProyectoDto, idUsuario: number, file?: Express.Multer.File) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario no existe.');

        const proyectoExistente = await this.proyectoRepository.findOne({ where: { Id_Proyecto: idProyecto }, relations: ['Estado', 'Usuario'] });
        if (!proyectoExistente) throw new NotFoundException(`Proyecto con id ${idProyecto} no encontrado`);

        if (dto.Titulo) proyectoExistente.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase();
        if (dto.Descripcion) proyectoExistente.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase();

        if (file) {
            try {
                const fileRes = await this.dropboxFilesService.uploadFile(file, 'Proyectos', dto.Titulo || proyectoExistente.Titulo);
                proyectoExistente.Imagen_Url = fileRes.url;
            } catch (err) {
                console.error('Error al subir el archivo a Dropbox:', err);
            }
        }

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Titulo: proyectoExistente.Titulo,
            Descripcion: proyectoExistente.Descripcion,
            Imagen_Url: proyectoExistente.Imagen_Url,
            Estado: proyectoExistente.Estado.Nombre_Estado,
            Visible: proyectoExistente.Visible
        };

        const proyectoGuardado = await this.proyectoRepository.save(proyectoExistente);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Proyectos', idUsuario, idProyecto, datosAnteriores, {
                Titulo: proyectoGuardado.Titulo,
                Descripcion: proyectoGuardado.Descripcion,
                Estado: proyectoGuardado.Estado.Nombre_Estado,
                Visible: proyectoGuardado.Visible
            });
        } catch (error) {
            console.error('Error al registrar auditoría de actualización de proyecto:', error);
        }

        return {
            ...proyectoGuardado,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(proyectoGuardado.Usuario)
        };
    }

    async updateEstadoProyecto(idProyecto: number, idEstadoProyecto: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario no existe.');

        const proyecto = await this.proyectoRepository.findOne({
            where: { Id_Proyecto: idProyecto },
            relations: ['Estado', 'Usuario']
        });
        if (!proyecto) throw new NotFoundException(`Proyecto con id ${idProyecto} no encontrado`);

        const nuevoEstado = await this.proyectoEstadoRepository.findOne({ where: { Id_Estado_Proyecto: idEstadoProyecto } });
        if (!nuevoEstado) throw new Error(`Estado con id ${idEstadoProyecto} no encontrado`);

        // Guardar estado anterior para auditoría
        const datosAnteriores = {
            Titulo: proyecto.Titulo,
            Estado_Anterior: {
                Id_Estado: proyecto.Estado.Id_Estado_Proyecto,
                Nombre: proyecto.Estado.Nombre_Estado
            }
        };

        proyecto.Estado = nuevoEstado;
        const proyectoActualizado = await this.proyectoRepository.save(proyecto);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Proyectos', idUsuario, idProyecto, datosAnteriores, {
                Estado_Nuevo: {
                    Id_Estado: nuevoEstado.Id_Estado_Proyecto,
                    Nombre: nuevoEstado.Nombre_Estado
                }
            });
        } catch (error) {
            console.error('Error al registrar auditoría de cambio de estado de proyecto:', error);
        }

        return {
            ...proyectoActualizado,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(proyectoActualizado.Usuario)
        };
    }

    async updateVisibilidadProyecto(IdProyecto: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario no existe.');

        const proyecto = await this.proyectoRepository.findOne({
            where: { Id_Proyecto: IdProyecto },
            relations: ['Estado', 'Usuario', 'Usuario.Rol']
        });
        if (!proyecto) throw new Error(`Proyecto con id ${IdProyecto} no encontrado`);

        // Guardar visibilidad anterior para auditoría
        const datosAnteriores = {
            Titulo: proyecto.Titulo,
            Visibilidad_Anterior: proyecto.Visible
        };

        // Toggle: alterna entre true y false
        proyecto.Visible = !proyecto.Visible;
        const proyectoActualizado = await this.proyectoRepository.save(proyecto);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Proyectos', idUsuario, IdProyecto, datosAnteriores, {
                Titulo: proyectoActualizado.Titulo,
                Visibilidad_Nueva: proyectoActualizado.Visible
            });
        } catch (error) {
            console.error('Error al registrar auditoría de cambio de visibilidad de proyecto:', error);
        }

        return {
            ...proyectoActualizado,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(proyectoActualizado.Usuario)
        };
    }
}