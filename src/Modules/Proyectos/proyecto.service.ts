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
import { UsuariosService } from "../Usuarios/Services/usuarios.service";

@Injectable()
export class ProyectoService 
{
    constructor
    (
        @InjectRepository(Proyecto)
        private readonly proyectoRepository: Repository<Proyecto>,

        @InjectRepository(EstadoProyecto)
        private readonly proyectoEstadoRepository: Repository<EstadoProyecto>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly usuariosService: UsuariosService,
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
        if (!idUsuario) { throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción'); }
        if (!file) { throw new BadRequestException('Debe subir una imagen para el proyecto'); }

        // Obtener estado por defecto "En Planeamiento"
        const estadoInicial = await this.proyectoEstadoRepository.findOne({ where: { Id_Estado_Proyecto: 1 } });
        if (!estadoInicial) { throw new BadRequestException('Estado por defecto no encontrado'); }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario }, relations: ['Rol'] });
        if (!usuario) { throw new BadRequestException(`Usuario con ID ${idUsuario} no encontrado`); }

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
        return {
            ...(await this.proyectoRepository.save(proyecto)),
            Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
        }
    }

    async UpdateProyecto(Id_Proyecto: number, dto: UpdateProyectoDto, idUsuario: number) 
    {
        if (!idUsuario) { throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción'); }

        const proyecto = await this.proyectoRepository.findOne({ 
            where: { Id_Proyecto },
            relations: ['Estado', 'Usuario', 'Usuario.Rol']
        });
        if (!proyecto) { throw new NotFoundException(`Proyecto con id ${Id_Proyecto} no encontrado`); }

        if (dto.Titulo) { 
            dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase(); 
        }

        if (dto.Descripcion) { 
            dto.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase(); 
        }

        Object.assign(proyecto, dto);
        const proyectoActualizado = await this.proyectoRepository.save(proyecto);

        return {
            ...proyectoActualizado,
            Usuario: proyectoActualizado.Usuario ? 
                await this.usuariosService.FormatearUsuarioResponse(proyectoActualizado.Usuario) : null
        };
    }

    async updateEstadoProyecto(Id_Proyecto: number, Id_Estado_Proyecto: number, idUsuario: number)
    {
        if (!idUsuario) { throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción'); }

        const proyecto = await this.proyectoRepository.findOne({ 
            where: { Id_Proyecto },
            relations: ['Estado', 'Usuario', 'Usuario.Rol']
        });
        if (!proyecto) { throw new Error(`Proyecto con id ${Id_Proyecto} no encontrado`); }

        const nuevoEstado = await this.proyectoEstadoRepository.findOne({ where: { Id_Estado_Proyecto } });
        if (!nuevoEstado) { throw new Error(`Estado con id ${Id_Estado_Proyecto} no encontrado`); }

        proyecto.Estado = nuevoEstado;
        const proyectoActualizado = await this.proyectoRepository.save(proyecto);

        return {
            ...proyectoActualizado,
            Usuario: proyectoActualizado.Usuario ? 
                await this.usuariosService.FormatearUsuarioResponse(proyectoActualizado.Usuario) : null
        };
    }

    async updateVisibilidadProyecto(Id_Proyecto: number, idUsuario: number)
    {
        if (!idUsuario) { throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción'); }

        const proyecto = await this.proyectoRepository.findOne({ 
            where: { Id_Proyecto },
            relations: ['Estado', 'Usuario', 'Usuario.Rol']
        });
        if (!proyecto) { throw new Error(`Proyecto con id ${Id_Proyecto} no encontrado`); }

        // Toggle: alterna entre true y false
        proyecto.Visible = !proyecto.Visible;
        const proyectoActualizado = await this.proyectoRepository.save(proyecto);

        return {
            ...proyectoActualizado,
            Usuario: proyectoActualizado.Usuario ? 
                await this.usuariosService.FormatearUsuarioResponse(proyectoActualizado.Usuario) : null
        };
    }
}