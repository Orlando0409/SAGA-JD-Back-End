import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateActaDto } from "./ActaDTO's/CreateActa.dto";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { UpdateActaDto } from "./ActaDTO's/UpdateActa.dto";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { UsuariosService } from "../Usuarios/Services/usuarios.service";
import { AuditoriaService } from "../Auditoria/auditoria.service";
import { Acta } from "./ActaEntities/Actas.Entity";

@Injectable()
export class ActasService {
    constructor(
        @InjectRepository(Acta)
        private readonly actaRepository: Repository<Acta>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly usuariosService: UsuariosService,

        private readonly auditoriaService: AuditoriaService,
    ) {}

    async getAllActas() {
        const actas = await this.actaRepository.createQueryBuilder('acta')
            .leftJoinAndSelect('acta.Usuario', 'usuario')
            .getMany();

        return Promise.all(actas.map(async acta => ({
            ...acta,
            Usuario: acta.Usuario ?
                await this.usuariosService.FormatearUsuarioResponse(acta.Usuario) : null
        })));
    }

    async createActa(dto: CreateActaDto, idUsuario: number, files: Express.Multer.File[]) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario creador no existe.');

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

        const actaGuardada = await this.actaRepository.save(nuevaActa);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logCreacion('Actas', idUsuario, actaGuardada.Id_Acta, {
                Titulo: actaGuardada.Titulo,
                Descripcion: actaGuardada.Descripcion,
                Fecha_Creacion: actaGuardada.Fecha_Creacion,
                Archivos: actaGuardada.Archivos
            });
        } catch (error) {
            console.error('Error al registrar auditoría de creación de acta:', error);
        }

        return {
            ...actaGuardada,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
        }
    }

    async UpdateActa(idActa: number, dto: UpdateActaDto, idUsuario: number, files: Express.Multer.File[]) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario no existe.');

        const actaExistente = await this.actaRepository.findOne({ where: { Id_Acta: idActa } });
        if (!actaExistente) throw new NotFoundException('El acta que intenta modificar no existe.');

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Titulo: actaExistente.Titulo,
            Descripcion: actaExistente.Descripcion,
            Fecha_Creacion: actaExistente.Fecha_Creacion,
            Archivos: actaExistente.Archivos
        };

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
                Archivos: ArchivosSubidos.length ? ArchivosSubidos : actaExistente.Archivos,
            });

            const actaGuardada = await this.actaRepository.save(actaActualizada);

            // Registrar en auditoría
            try {
                await this.auditoriaService.logActualizacion('Actas', idUsuario, idActa, datosAnteriores, {
                    Titulo: actaGuardada.Titulo,
                    Descripcion: actaGuardada.Descripcion,
                    Fecha_Creacion: actaGuardada.Fecha_Creacion,
                    Archivos: actaGuardada.Archivos
                });
            } catch (error) {
                console.error('Error al registrar auditoría de actualización de acta:', error);
            }

            return actaGuardada;
        }   
    }   

    async deleteActa(idActa: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario no existe.');

        const actaExistente = await this.actaRepository.findOne({ where: { Id_Acta: idActa } });
        if (!actaExistente) throw new NotFoundException(`El acta que intenta eliminar con ID ${idActa} no existe.`);

        // Guardar datos antes de eliminar para auditoría
        const datosEliminados = {
            Titulo: actaExistente.Titulo,
            Descripcion: actaExistente.Descripcion,
            Fecha_Creacion: actaExistente.Fecha_Creacion,
            Archivos: actaExistente.Archivos
        };

        this.dropboxFilesService.deletePath(`Actas/${actaExistente.Titulo}`);
        await this.actaRepository.remove(actaExistente);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logEliminacion('Actas', idUsuario, idActa, datosEliminados);
        } catch (error) {
            console.error('Error al registrar auditoría de eliminación de acta:', error);
        }

        return { message: 'Acta eliminada exitosamente' };
    }
}