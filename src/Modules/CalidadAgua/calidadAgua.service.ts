import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CalidadAgua } from "./CalidadAguaEntities/CalidadAgua.Entity";
import { CreateCalidadAguaDto } from "./CalidadAguaDTO's/CreateCalidadAgua.dto";
import { UpdateCalidadAguaDto } from "./CalidadAguaDTO's/UpdateCalidadAgua.dto";
import { Public } from "../auth/Decorator/Public.decorator";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";

@Injectable()
export class CalidadAguaService
{
    constructor
    (
        @InjectRepository(CalidadAgua)
        private readonly calidadAguaRepository: Repository<CalidadAgua>,

        private readonly dropboxFilesService: DropboxFilesService,
    ) {}

    @Public()
    async getCalidadAgua()
    {
        return this.calidadAguaRepository.find()
    }

    async getCalidadAguaById(Id_Calidad_Agua: number)
    {
        const CalidadAgua = await this.calidadAguaRepository.findOne({ where: { Id_Calidad_Agua }})
        if(!CalidadAgua) { throw new NotFoundException(`Archivo con id ${Id_Calidad_Agua} no encontrado`); }
        return CalidadAgua;
    }

    async CreateCalidadAgua(dto: CreateCalidadAguaDto, file?: Express.Multer.File)
    {
        if (!file) {
            throw new Error('Debe subir un archivo para la calidad de agua');
        }

        const tituloToUpperCase = dto.Titulo.toUpperCase();

        // Subir archivo a Dropbox
        const fileRes = await this.dropboxFilesService.uploadFile(file, 'Calidad-de-Agua', tituloToUpperCase);

        const now = new Date();
        now.setSeconds(0, 0);

        // Crear objeto entidad
        const calidadAgua = this.calidadAguaRepository.create({
            Titulo: dto.Titulo,
            Url_Archivo: fileRes.url,
        });

        // Guardar en BD
        return await this.calidadAguaRepository.save(calidadAgua);
    }

    async updateCalidadAgua(Id_Calidad_Agua: number, dto: UpdateCalidadAguaDto, file?: Express.Multer.File)
    {
        const CalidadAgua = await this.calidadAguaRepository.findOne({ where: { Id_Calidad_Agua } });
        if (!CalidadAgua) {
            throw new NotFoundException(`Registro con ID ${Id_Calidad_Agua} no encontrado`);
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
}