import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Acta } from "./ActaEntities/Actas.Entity";
import { Repository } from "typeorm";
import { CreateActaDto } from "./ActaDTO's/CreateActa.dto";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { UpdateActaDto } from "./ActaDTO's/UpdateActa.dto";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";

@Injectable()
export class ActasService {
    constructor(
        @InjectRepository(Acta)
        private readonly actaRepository: Repository<Acta>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        private readonly dropboxFilesService: DropboxFilesService,
    ) {}

    async getAllActas(): Promise<Acta[]> {
        return this.actaRepository.find();
    }

    async createActa(dto: CreateActaDto, idUsuarioCreador: number, files: Express.Multer.File[]) {
        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuarioCreador } });
        if (!usuario) { throw new BadRequestException('El usuario creador no existe.'); }

        // Normalizar título antes de procesar
        dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase();
        dto.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase();

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
        if (!actaExistente) { throw new BadRequestException('El acta que intenta modificar no existe.'); }

        // Normalizar datos antes de procesar
        if (dto.Titulo) {
            dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase();
        }

        if (dto.Descripcion) {
            dto.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase();
        }

        if (dto.Titulo) {
            const actaConMismoTitulo = await this.actaRepository.findOne({ where: { Titulo: dto.Titulo } });
            if (actaConMismoTitulo && actaConMismoTitulo.Id_Acta !== id) {
                throw new BadRequestException(`Ya existe un acta con el título "${dto.Titulo}".`);
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

    async deleteActa(id: number) {
        const actaExistente = await this.actaRepository.findOne({ where: { Id_Acta: id } });
        if (!actaExistente) { throw new BadRequestException(`El acta que intenta eliminar con ID ${id} no existe.`); }

        this.dropboxFilesService.deletePath(`Actas/${actaExistente.Titulo}`);
        await this.actaRepository.remove(actaExistente);
        return { message: 'Acta eliminada exitosamente' };
    }
}
