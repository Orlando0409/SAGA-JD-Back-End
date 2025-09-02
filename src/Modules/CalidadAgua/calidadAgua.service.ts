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
        return this.calidadAguaRepository.find
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

        // Subir archivo a Dropbox
        const fileRes = await this.dropboxFilesService.uploadFile(file, 'Calidad-de-Agua');

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

    async updateCalidadAgua(Id_Calidad_Agua: number, dto: UpdateCalidadAguaDto)
    {
        const CalidadAgua = await this.calidadAguaRepository.findOne({ where: { Id_Calidad_Agua } });
        if(!CalidadAgua)
        {
            throw new NotFoundException(`Archivo de calidad de agua con id ${Id_Calidad_Agua} no encontrado`);
        }

        Object.assign(CalidadAgua, dto);
        return this.calidadAguaRepository.save(CalidadAgua);
    }
}