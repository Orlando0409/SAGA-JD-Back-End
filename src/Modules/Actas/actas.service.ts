import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Acta } from "./ActaEntities/Acta.Entity";
import { Repository } from "typeorm";
import { CreateActaDto } from "./ActaDTO's/CreateActa.dto";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { UpdateActaDto } from "./ActaDTO's/UpdateActa.dto";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { UsuariosService } from "../Usuarios/Services/usuarios.service";

@Injectable()
export class ActasService {
    constructor(
        @InjectRepository(Acta)
        private readonly actaRepository: Repository<Acta>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        private readonly dropboxFilesService: DropboxFilesService,
        private readonly usuariosService: UsuariosService,
    ) {}

    async getAllActas(): Promise<Acta[]> {
        return this.actaRepository.find();
    }

    async createActa(dto: CreateActaDto, idUsuario: number, files: Express.Multer.File[]) {
        if (!idUsuario) { throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción'); }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
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
            Archivos: ArchivosSubidos,
            Usuario: usuario
        });

        await this.actaRepository.save(nuevaActa);
        return {
            ...nuevaActa,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
        }
    }

    async UpdateActa(idActa: number, dto: UpdateActaDto, idUsuario: number, files: Express.Multer.File[]) {
        if (!idUsuario) { throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción'); }

        const actaExistente = await this.actaRepository.findOne({ where: { Id_Acta: idActa } });
        if (!actaExistente) { throw new BadRequestException('El acta que intenta modificar no existe.'); }

        if (dto.Descripcion) {
            dto.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase();
        }

        if (dto.Titulo) {
            dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase();
            const actaConMismoTitulo = await this.actaRepository.findOne({ where: { Titulo: dto.Titulo } });
            if (actaConMismoTitulo && actaConMismoTitulo.Id_Acta !== idActa) {
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

    async deleteActa(idActa: number, idUsuario: number) {
        if (!idUsuario) { throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción'); }

        const actaExistente = await this.actaRepository.findOne({ where: { Id_Acta: idActa } });
        if (!actaExistente) { throw new BadRequestException(`El acta que intenta eliminar con ID ${idActa} no existe.`); }

        this.dropboxFilesService.deletePath(`Actas/${actaExistente.Titulo}`);
        await this.actaRepository.remove(actaExistente);
        return { message: 'Acta eliminada exitosamente' };
    }
}
