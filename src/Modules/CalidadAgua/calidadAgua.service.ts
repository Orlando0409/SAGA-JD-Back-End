import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CalidadAgua } from "./CalidadAguaEntities/CalidadAgua.Entity";
import { CreateCalidadAguaDto } from "./CalidadAguaDTO's/CreateCalidadAgua.dto";
import { UpdateCalidadAguaDto } from "./CalidadAguaDTO's/UpdateCalidadAgua.dto";
import { Public } from "../auth/Decorator/Public.decorator";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { EstadoCalidadAgua } from "./CalidadAguaEntities/EstadoCalidadAgua.Entity";

@Injectable()
export class CalidadAguaService
{
    constructor
    (
        @InjectRepository(CalidadAgua)
        private readonly calidadAguaRepository: Repository<CalidadAgua>,

        @InjectRepository(EstadoCalidadAgua)
        private readonly estadoCalidadAguaRepository: Repository<EstadoCalidadAgua>,

        private readonly dropboxFilesService: DropboxFilesService,
    ) {}

    @Public()
    async getCalidadAguaVisibles()
    {
        return this.calidadAguaRepository.find({ where: { Estado: { Id_Estado_Calidad_Agua: 1 } }, relations: ['Estado'] });
    }

    async getCalidadAgua()
    {
        return this.calidadAguaRepository.find({ relations: ['Estado'] });
    }

    async CreateCalidadAgua(dto: CreateCalidadAguaDto, file?: Express.Multer.File)
    {
        if (!file) { throw new BadRequestException('Debe subir un archivo para la calidad de agua'); }

        const estadoInicial = await this.estadoCalidadAguaRepository.findOne({ where: { Id_Estado_Calidad_Agua: 2 } });
        if (!estadoInicial) { throw new BadRequestException('Estado inicial no encontrado'); }

        // Normalizar título antes de procesar
        dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase();

        const calidadAguaTitulo = await this.calidadAguaRepository.findOne({ where: { Titulo: dto.Titulo } });
        if (calidadAguaTitulo) { throw new BadRequestException('El título ya existe'); }

        // Subir archivo a Dropbox
        const fileRes = await this.dropboxFilesService.uploadFile(file, 'Calidad-de-Agua', dto.Titulo);

        // Crear objeto entidad
        const calidadAgua = this.calidadAguaRepository.create({
            Titulo: dto.Titulo,
            Url_Archivo: fileRes.url,
            Estado: estadoInicial
        });

        return await this.calidadAguaRepository.save(calidadAgua);
    }

    async updateCalidadAgua(Id_Calidad_Agua: number, dto: UpdateCalidadAguaDto, file?: Express.Multer.File)
    {
        const CalidadAgua = await this.calidadAguaRepository.findOne({ where: { Id_Calidad_Agua } });
        if (!CalidadAgua) { throw new NotFoundException(`Registro con ID ${Id_Calidad_Agua} no encontrado`); }

        if( dto.Titulo ) {
            dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase();
        }

        // Si llega un archivo, subimos uno nuevo
        if (file) {
            const fileRes = await this.dropboxFilesService.uploadFile(file, 'Calidad-de-Agua', dto.Titulo);
            CalidadAgua.Url_Archivo = fileRes.url;
        }

        // Actualizar título si lo mandan
        if (dto.Titulo) {
            CalidadAgua.Titulo = dto.Titulo;
        }

        return this.calidadAguaRepository.save(CalidadAgua);
    }

    async updateEstadoCalidadAgua(Id_Calidad_Agua: number, Id_Estado_Calidad_Agua: number) {
        const calidadAgua = await this.calidadAguaRepository.findOne({ where: { Id_Calidad_Agua } });
        if (!calidadAgua) { throw new NotFoundException(`Registro con ID ${Id_Calidad_Agua} no encontrado`); }

        const estado = await this.estadoCalidadAguaRepository.findOne({ where: { Id_Estado_Calidad_Agua } });
        if (!estado) { throw new NotFoundException(`Estado con ID ${Id_Estado_Calidad_Agua} no encontrado`); }

        calidadAgua.Estado = estado;
        return this.calidadAguaRepository.save(calidadAgua);
    }
}