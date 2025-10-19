import { BadRequestException, Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UpdateProyectoDto } from "./ProyectoDTO's/UpdateProyecto.dto";
import { CreateProyectoDto } from "./ProyectoDTO's/CreateProyecto.dto";
import { Proyecto } from "./ProyectoEntities/Proyecto.Entity";
import { EstadoProyecto } from "./ProyectoEntities/EstadoProyecto.Entity";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { Public } from "../auth/Decorator/Public.decorator";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { UsuariosService } from "../Usuarios/Services/usuarios.service";
import { AuditoriaService } from "../Auditoria/auditoria.service";

@Injectable()
export class ProyectoService 
{
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
    ) {}

    @Public()
    async getProyectosVisibles()
    {
        const proyectos = await this.proyectoRepository.createQueryBuilder('proyecto')
            .leftJoinAndSelect('proyecto.Estado', 'estado')
            .leftJoinAndSelect('proyecto.Usuario', 'usuario')
            .where('proyecto.Visible = :visible', { visible: true })
            .getMany();

        return Promise.all(proyectos.map(async proyecto => ({
            ...proyecto,
            Usuario: proyecto.Usuario ? 
                await this.usuariosService.FormatearUsuarioResponse(proyecto.Usuario) : null
        })));
    }

    async getProyectosInvisibles()
    {
        const proyectos = await this.proyectoRepository.createQueryBuilder('proyecto')
            .leftJoinAndSelect('proyecto.Estado', 'estado')
            .leftJoinAndSelect('proyecto.Usuario', 'usuario')
            .where('proyecto.Visible = :visible', { visible: false })
            .getMany();

        return Promise.all(proyectos.map(async proyecto => ({
            ...proyecto,
            Usuario: proyecto.Usuario ? 
                await this.usuariosService.FormatearUsuarioResponse(proyecto.Usuario) : null
        })));
    }

    async getAllProyectos()
    {
        const proyectos = await this.proyectoRepository.createQueryBuilder('proyecto')
            .leftJoinAndSelect('proyecto.Estado', 'estado')
            .leftJoinAndSelect('proyecto.Usuario', 'usuario')
            .getMany();

        return Promise.all(proyectos.map(async proyecto => ({
            ...proyecto,
            Usuario: proyecto.Usuario ? 
                await this.usuariosService.FormatearUsuarioResponse(proyecto.Usuario) : null
        })));
    }

    async CreateProyecto(dto: CreateProyectoDto, idUsuario: number, file?: Express.Multer.File)
    {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');
        if (!file) throw new BadRequestException('Debe subir una imagen para el proyecto');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario }, relations: ['Rol'] });
        if (!usuario) throw new NotFoundException(`Usuario con ID ${idUsuario} no encontrado`);

        // Obtener estado por defecto "En Planeamiento"
        const estadoInicial = await this.proyectoEstadoRepository.findOne({ where: { Id_Estado_Proyecto: 1 } });
        if (!estadoInicial) throw new NotFoundException('Estado por defecto no encontrado');

        dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase();
        dto.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase();

        const Proyecto = await this.dropboxFilesService.uploadFileDownloadOnly(file, 'Proyectos', dto.Titulo);

        // Crear objeto entidad
        const proyecto = this.proyectoRepository.create({
            ...dto,
            Imagen_Url: Proyecto.url,
            Estado: estadoInicial,
            Visible: false,
            Usuario: usuario
        });

        // Guardar en BD
        const proyectoGuardado = await this.proyectoRepository.save(proyecto);

        // Formatear proyecto para auditoría (sin info sensible del usuario)
        const proyectoParaAuditoria = await this.FormatearProyectoParaResponse(proyectoGuardado);
        await this.auditoriaService.logCreacion('proyectos', idUsuario, proyectoGuardado.Id_Proyecto, { proyecto: proyectoParaAuditoria });

        return {
            ...proyectoGuardado,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
        }
    }

    async UpdateProyecto(idProyecto: number, dto: UpdateProyectoDto, idUsuario: number) 
    {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const proyecto = await this.proyectoRepository.findOne({ 
            where: { Id_Proyecto: idProyecto },
            relations: ['Estado', 'Usuario', 'Usuario.Rol']
        });
        if (!proyecto) throw new NotFoundException(`Proyecto con id ${idProyecto} no encontrado`);

        const datosAnteriores = { ...proyecto };

        if (dto.Titulo) { 
            dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase(); 
        }

        if (dto.Descripcion) { 
            dto.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase(); 
        }

        Object.assign(proyecto, dto);
        const proyectoActualizado = await this.proyectoRepository.save(proyecto);

        // Formatear los datos para auditoría (sin info sensible del usuario)
        const datosAnterioresFormateados = await this.FormatearProyectoParaResponse(datosAnteriores as Proyecto);
        const proyectoParaAuditoria = await this.FormatearProyectoParaResponse(proyectoActualizado);
        await this.auditoriaService.logActualizacion('proyectos', idUsuario, idProyecto, datosAnterioresFormateados, { proyecto: proyectoParaAuditoria });

        return {
            ...proyectoActualizado,
            Usuario: proyectoActualizado.Usuario ? 
                await this.usuariosService.FormatearUsuarioResponse(proyectoActualizado.Usuario) : null
        };
    }

    async updateEstadoProyecto(idProyecto: number, idEstadoProyecto: number, idUsuario: number)
    {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const proyecto = await this.proyectoRepository.findOne({ 
            where: { Id_Proyecto: idProyecto },
            relations: ['Estado', 'Usuario', 'Usuario.Rol']
        });
        if (!proyecto) throw new NotFoundException(`Proyecto con id ${idProyecto} no encontrado`);

        const nuevoEstado = await this.proyectoEstadoRepository.findOne({ where: { Id_Estado_Proyecto: idEstadoProyecto } });
        if (!nuevoEstado) throw new NotFoundException(`Estado con id ${idEstadoProyecto} no encontrado`);

        const datosAnteriores = { ...proyecto };

        proyecto.Estado = nuevoEstado;
        const proyectoActualizado = await this.proyectoRepository.save(proyecto);

        // Formatear los datos para auditoría (sin info sensible del usuario)
        const datosAnterioresFormateados = await this.FormatearProyectoParaResponse(datosAnteriores as Proyecto);
        const proyectoParaAuditoria = await this.FormatearProyectoParaResponse(proyectoActualizado);
        await this.auditoriaService.logActualizacion('proyectos', idUsuario, idProyecto, datosAnterioresFormateados, { proyecto: proyectoParaAuditoria });

        return {
            ...proyectoActualizado,
            Usuario: proyectoActualizado.Usuario ? 
                await this.usuariosService.FormatearUsuarioResponse(proyectoActualizado.Usuario) : null
        };
    }

    async updateVisibilidadProyecto(idProyecto: number, idUsuario: number)
    {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const proyecto = await this.proyectoRepository.findOne({ 
            where: { Id_Proyecto: idProyecto },
            relations: ['Estado', 'Usuario', 'Usuario.Rol']
        });
        if (!proyecto) throw new NotFoundException(`Proyecto con id ${idProyecto} no encontrado`);

        const datosAnteriores = { ...proyecto };

        // Toggle: alterna entre true y false
        proyecto.Visible = !proyecto.Visible;
        const proyectoActualizado = await this.proyectoRepository.save(proyecto);

        // Formatear los datos para auditoría (sin info sensible del usuario)
        const datosAnterioresFormateados = await this.FormatearProyectoParaResponse(datosAnteriores as Proyecto);
        const proyectoParaAuditoria = await this.FormatearProyectoParaResponse(proyectoActualizado);
        await this.auditoriaService.logActualizacion('proyectos', idUsuario, idProyecto, datosAnterioresFormateados, { proyecto: proyectoParaAuditoria });

        return {
            ...proyectoActualizado,
            Usuario: proyectoActualizado.Usuario ? 
                await this.usuariosService.FormatearUsuarioResponse(proyectoActualizado.Usuario) : null
        };
    }

    /**
     * Formatea la información de un proyecto para responses públicos
     * Solo devuelve información básica y necesaria
     */
    async FormatearProyectoParaResponse(proyecto: Proyecto): Promise<{
        Id_Proyecto: number;
        Titulo: string;
        Descripcion: string;
        Imagen_Url: string;
        Visible: boolean;
        Fecha_Creacion: Date;
        Fecha_Actualizacion: Date;
        Estado: {
            Id_Estado_Proyecto: number;
            Nombre_Estado: string;
        };
    }> {
        return {
            Id_Proyecto: proyecto.Id_Proyecto,
            Titulo: proyecto.Titulo,
            Descripcion: proyecto.Descripcion,
            Imagen_Url: proyecto.Imagen_Url,
            Visible: proyecto.Visible,
            Fecha_Creacion: proyecto.Fecha_Creacion,
            Fecha_Actualizacion: proyecto.Fecha_Actualizacion,
            Estado: {
                Id_Estado_Proyecto: proyecto.Estado?.Id_Estado_Proyecto || 0,
                Nombre_Estado: proyecto.Estado?.Nombre_Estado || 'Sin estado'
            }
        };
    }
}