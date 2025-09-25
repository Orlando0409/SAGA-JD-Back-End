import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Acta } from "./ActaEntities/Actas.Entity";
import { Repository } from "typeorm";
import { CreateActaDto } from "./ActaDTO's/CreateActa.dto";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { UpdateActaDto } from "./ActaDTO's/UpdateActa.dto";

@Injectable()
export class ActasService {
    constructor(
        @InjectRepository(Acta)
        private readonly actaRepository: Repository<Acta>,

        private readonly dropboxFilesService: DropboxFilesService,
    ) {}

    async getAllActas(): Promise<Acta[]> {
        return this.actaRepository.find();
    }

    async createActa(dto: CreateActaDto, files: Express.Multer.File[]) {

        const ArchivosSubidos = await Promise.all(
            files.map(async (file) => {
                const uploadedFile = await this.dropboxFilesService.uploadFile(file, 'Actas', dto.Titulo)
                return { Url_Archivo: uploadedFile.url };
            })
        );

        const nuevaActa = this.actaRepository.create({
            ...dto,
            Archivos: ArchivosSubidos
        });

        return this.actaRepository.save(nuevaActa);
    }

    async UpdateActa(id: number, dto: UpdateActaDto, files: Express.Multer.File[]) {
        const actaExistente = await this.actaRepository.findOne({ where: { Id_Acta: id } });
        if (!actaExistente) {
            throw new BadRequestException('El acta que intenta modificar no existe.');
        }

        const ArchivosSubidos = await Promise.all(
            files.map(async (file) => {
                const uploadedFile = await this.dropboxFilesService.uploadFile(file, 'Actas', dto.Titulo)
                return { Url_Archivo: uploadedFile.url };
            })
        );

        const actaActualizada = this.actaRepository.create({
            ...actaExistente,
            ...dto,
            Archivos: ArchivosSubidos.length ? ArchivosSubidos : actaExistente.Archivos
        });

        return this.actaRepository.save(actaActualizada);
    }
}