import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CreateActaDto } from "./ActaDTO's/CreateActa.dto";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { UpdateActaDto } from "./ActaDTO's/UpdateActa.dto";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { UsuariosService } from "../Usuarios/Services/usuarios.service";
import { AuditoriaService } from "../Auditoria/auditoria.service";
import { Acta } from "./ActaEntities/Actas.Entity";
import { ArchivoActa } from "./ActaEntities/ArchivoActa.Entity";

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

        @InjectRepository(ArchivoActa)
        private readonly archivoActaRepository: Repository<ArchivoActa>
    ) { }

    async getAllActas() {
        const actas = await this.actaRepository.createQueryBuilder('acta')
            .leftJoinAndSelect('acta.Usuario', 'usuario')
            .leftJoinAndSelect('acta.Archivos', 'archivos')
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
                return { Url_Archivo: uploadedFile.url, Delete_file: uploadedFile.path };
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

        const actaExistente = await this.actaRepository.findOne({
            where: { Id_Acta: idActa },
            relations: ['Archivos'],
        });
        if (!actaExistente) throw new NotFoundException('El acta que intenta modificar no existe.');

        const datosAnteriores = {
            Titulo: actaExistente.Titulo,
            Descripcion: actaExistente.Descripcion,
            Fecha_Creacion: actaExistente.Fecha_Creacion,
            Archivos: actaExistente.Archivos,
        };

        if (dto.Descripcion) dto.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase();

        const tituloFinal = dto.Titulo ?? actaExistente.Titulo;
        if (dto.Titulo) {
            dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase();
            const actaConMismoTitulo = await this.actaRepository.findOne({ where: { Titulo: dto.Titulo } });
            if (actaConMismoTitulo && actaConMismoTitulo.Id_Acta !== idActa) {
                throw new BadRequestException(`Ya existe un acta con el título "${dto.Titulo}".`);
            }
        }

        if (dto.ArchivosAEliminar && dto.ArchivosAEliminar.length > 0) {
            const archivosABorrar = await this.archivoActaRepository.find({
                where: { Id_Archivo_Acta: In(dto.ArchivosAEliminar) },
            });
            for (const archivo of archivosABorrar) {
                if (archivo.Delete_file) {
                    await this.dropboxFilesService.deleteFile(archivo.Delete_file);
                }
                await this.archivoActaRepository.remove(archivo);
            }
        }

        // Los archivos nuevos se acomulan con los que ya existen
        const archivosNuevos: Partial<ArchivoActa>[] = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const uploadedFile = await this.dropboxFilesService.uploadFile(file, 'Actas', tituloFinal);
                archivosNuevos.push({
                    Url_Archivo: uploadedFile.url,
                    Delete_file: uploadedFile.path,
                });
            }
        }

        await this.actaRepository.update(idActa, {
            Titulo: dto.Titulo ?? actaExistente.Titulo,
            Descripcion: dto.Descripcion ?? actaExistente.Descripcion,
        });

        if (archivosNuevos.length > 0) {
            const entidades = archivosNuevos.map(a =>
                this.archivoActaRepository.create({ ...a, Acta: { Id_Acta: idActa } as Acta })
            );
            await this.archivoActaRepository.save(entidades);
        }

        const actaActualizada = await this.actaRepository.findOne({
            where: { Id_Acta: idActa },
            relations: ['Archivos', 'Usuario'],
        });
        if (!actaActualizada) throw new NotFoundException('No se encontró el acta luego de actualizarla.');

        try {
            await this.auditoriaService.logActualizacion('Actas', idUsuario, idActa, datosAnteriores, {
                Titulo: actaActualizada.Titulo,
                Descripcion: actaActualizada.Descripcion,
                Fecha_Creacion: actaActualizada.Fecha_Creacion,
                Archivos: actaActualizada.Archivos,
            });
        } catch (error) {
            console.error('Error al registrar auditoría de actualización de acta:', error);
        }

        return {
            ...actaActualizada,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario),
        };
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

    async eliminarArchivoDeActa(idActa: number, idArchivo: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const acta = await this.actaRepository.findOne({ where: { Id_Acta: idActa } });
        if (!acta) throw new NotFoundException(`El acta con ID ${idActa} no existe.`);

        const archivo = await this.archivoActaRepository.findOne({
            where: { Id_Archivo_Acta: idArchivo },
            relations: ['Acta'],
        });
        if (!archivo) throw new NotFoundException(`El archivo con ID ${idArchivo} no existe.`);
        if (archivo.Acta?.Id_Acta !== idActa) throw new BadRequestException('El archivo no pertenece al acta indicada.');

        if (archivo.Delete_file) {
            await this.dropboxFilesService.deleteFile(archivo.Delete_file);
        }
        await this.archivoActaRepository.remove(archivo);

        try {
            await this.auditoriaService.logEliminacion('Actas-Archivo', idUsuario, idArchivo, {
                Url_Archivo: archivo.Url_Archivo,
                Acta: idActa,
            });
        } catch (error) {
            console.error('Error al registrar auditoría de eliminación de archivo:', error);
        }

        return { message: 'Archivo eliminado exitosamente del acta.' };
    }
}