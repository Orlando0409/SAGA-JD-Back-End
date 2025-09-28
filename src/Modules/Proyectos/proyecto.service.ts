import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UpdateProyectoDto } from "./ProyectoDTO's/UpdateProyecto.dto";
import { CreateProyectoDto } from "./ProyectoDTO's/CreateProyecto.dto";
import { Proyecto } from "./ProyectoEntities/Proyecto.Entity";
import { ProyectoEstado } from "./ProyectoEntities/EstadoProyecto.Entity";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { Public } from "../auth/Decorator/Public.decorator";

@Injectable()
export class ProyectoService 
{
    constructor
    (
        @InjectRepository(Proyecto)
        private readonly proyectoRepository: Repository<Proyecto>,

        @InjectRepository(ProyectoEstado)
        private readonly proyectoEstadoRepository: Repository<ProyectoEstado>,

        private readonly dropboxFilesService: DropboxFilesService,
    ) {}

    @Public()
    async getProyectos()
    {
        return this.proyectoRepository.find({ relations: ['Estado'],});
    }

    async findProyectobyId(Id_Proyecto: number) {
        const proyecto = await this.proyectoRepository.findOne({ where: { Id_Proyecto } });
        if (!proyecto) { throw new NotFoundException(`Proyecto con id ${Id_Proyecto} no encontrado`); }
        return proyecto;
    }

    async CreateProyecto(dto: CreateProyectoDto, file?: Express.Multer.File)
    {
        if (!file) { throw new Error('Debe subir una imagen para el proyecto'); }

        // Normalizar datos antes de procesar
        dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase();
        dto.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase();
        
        const TituloToUpperCase = dto.Titulo.toUpperCase();
        // Subir archivo a Dropbox
        const Proyecto = await this.dropboxFilesService.uploadFileDownloadOnly(file, 'Proyectos', TituloToUpperCase);

        const now = new Date();
        now.setSeconds(0, 0);

        // Crear objeto entidad
        const proyecto = ({
            ...dto,
            Imagen_Url: Proyecto.url,
        });

        // Guardar en BD
        return await this.proyectoRepository.save(proyecto);
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
}