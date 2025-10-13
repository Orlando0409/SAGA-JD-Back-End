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
    ) {}

    @Public()
    async getProyectosVisibles()
    {
        const proyectos = await this.proyectoRepository.createQueryBuilder('proyecto')
            .leftJoinAndSelect('proyecto.Estado', 'estado')
            .leftJoinAndSelect('proyecto.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('proyecto.Visible = :visible', { visible: true })
            .getMany();

        return proyectos.map(proyecto => ({
            ...proyecto,
            Usuario_Creador: proyecto.Usuario_Creador ? {
                Id_Usuario: proyecto.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: proyecto.Usuario_Creador.Nombre_Usuario,
                Id_Rol: proyecto.Usuario_Creador.Id_Rol,
                Nombre_Rol: proyecto.Usuario_Creador.Rol.Nombre_Rol
            } : null
        }));
    }

    async getProyectosInvisibles()
    {
        const proyectos = await this.proyectoRepository.createQueryBuilder('proyecto')
            .leftJoinAndSelect('proyecto.Estado', 'estado')
            .leftJoinAndSelect('proyecto.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('proyecto.Visible = :visible', { visible: false })
            .getMany();

        return proyectos.map(proyecto => ({
            ...proyecto,
            Usuario_Creador: proyecto.Usuario_Creador ? {
                Id_Usuario: proyecto.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: proyecto.Usuario_Creador.Nombre_Usuario,
                Id_Rol: proyecto.Usuario_Creador.Id_Rol,
                Nombre_Rol: proyecto.Usuario_Creador.Rol.Nombre_Rol
            } : null
        }));
    }

    async getAllProyectos()
    {
        const proyectos = await this.proyectoRepository.createQueryBuilder('proyecto')
            .leftJoinAndSelect('proyecto.Estado', 'estado')
            .leftJoinAndSelect('proyecto.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .getMany();

        return proyectos.map(proyecto => ({
            ...proyecto,
            Usuario_Creador: proyecto.Usuario_Creador ? {
                Id_Usuario: proyecto.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: proyecto.Usuario_Creador.Nombre_Usuario,
                Id_Rol: proyecto.Usuario_Creador.Id_Rol,
                Nombre_Rol: proyecto.Usuario_Creador.Rol.Nombre_Rol
            } : null
        }));
    }

    async CreateProyecto(dto: CreateProyectoDto, idUsuarioCreador: number, file?: Express.Multer.File)
    {
        if (!file) { throw new BadRequestException('Debe subir una imagen para el proyecto'); }

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
        return {
            ...(await this.proyectoRepository.save(proyecto)),
            Usuario_Creador: {
                Id_Usuario: usuario.Id_Usuario,
                Nombre_Usuario: usuario.Nombre_Usuario,
                Id_Rol: usuario.Id_Rol,
                Nombre_Rol: usuario.Rol.Nombre_Rol
            }
        }
    }

    async UpdateProyecto(Id_Proyecto: number, dto: UpdateProyectoDto) 
    {
        const proyecto = await this.proyectoRepository.findOne({ where: { Id_Proyecto } });
        if (!proyecto) { throw new NotFoundException(`Proyecto con id ${Id_Proyecto} no encontrado`); }

        if (dto.Titulo) { 
            dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase(); 
        }

        if (dto.Descripcion) { 
            dto.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase(); 
        }

        Object.assign(proyecto, dto);
        return this.proyectoRepository.save(proyecto);
    }

    async updateEstadoProyecto(Id_Proyecto: number, Id_Estado_Proyecto: number)
    {
        const proyecto = await this.proyectoRepository.findOne({ where: { Id_Proyecto } });
        if (!proyecto) { throw new Error(`Proyecto con id ${Id_Proyecto} no encontrado`); }

        const nuevoEstado = await this.proyectoEstadoRepository.findOne({ where: { Id_Estado_Proyecto } });
        if (!nuevoEstado) { throw new Error(`Estado con id ${Id_Estado_Proyecto} no encontrado`); }

        proyecto.Estado = nuevoEstado;
        return this.proyectoRepository.save(proyecto);
    }

    async updateVisibilidadProyecto(Id_Proyecto: number)
    {
        const proyecto = await this.proyectoRepository.findOne({ where: { Id_Proyecto } });
        if (!proyecto) { throw new Error(`Proyecto con id ${Id_Proyecto} no encontrado`); }

        // Toggle: alterna entre true y false
        proyecto.Visible = !proyecto.Visible;
        return this.proyectoRepository.save(proyecto);
    }
}