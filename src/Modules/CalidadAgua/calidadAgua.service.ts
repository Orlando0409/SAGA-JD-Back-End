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
export class CalidadAguaService {
    constructor
        (
            @InjectRepository(CalidadAgua)
            private readonly calidadAguaRepository: Repository<CalidadAgua>,

        @InjectRepository(EstadoCalidadAgua)
        private readonly estadoCalidadAguaRepository: Repository<EstadoCalidadAgua>,

            private readonly dropboxFilesService: DropboxFilesService,

            private readonly auditoriaService: AuditoriaService,

            private readonly usuariosService: UsuariosService,
        ) { }

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

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario }, relations: ['Rol'] });
        if (!usuario) throw new BadRequestException('Usuario no encontrado');

        // Normalizar antes de procesar
        dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase();
        dto.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase();

        const calidadAguaTitulo = await this.calidadAguaRepository.findOne({ where: { Titulo: dto.Titulo } });
        if (calidadAguaTitulo) throw new BadRequestException('El título ya existe');

        // Subir archivo a Dropbox
        const fileRes = await this.dropboxFilesService.uploadFile(file, 'Calidad-de-Agua', dto.Titulo);

        // Crear objeto entidad
        const calidadAgua = this.calidadAguaRepository.create({
            Titulo: dto.Titulo,
            Descripcion: dto.Descripcion,
            Url_Archivo: fileRes.url,
            Estado: estadoInicial
        });

        return await this.calidadAguaRepository.save(calidadAgua);
    }

    async updateCalidadAgua(Id_Calidad_Agua: number, dto: UpdateCalidadAguaDto, idUsuario: number, file?: Express.Multer.File) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
        if (!usuario) throw new BadRequestException('El usuario no existe.');

        const CalidadAgua = await this.calidadAguaRepository.findOne({ where: { Id_Calidad_Agua } });
        if (!CalidadAgua) throw new NotFoundException(`Registro con ID ${Id_Calidad_Agua} no encontrado`);

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Titulo: CalidadAgua.Titulo,
            Descripcion: CalidadAgua.Descripcion,
            Url_Archivo: CalidadAgua.Url_Archivo,
            Visible: CalidadAgua.Visible
        };

        if (dto.Titulo) {
            CalidadAgua.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase();
        }

        if (dto.Descripcion) {
            CalidadAgua.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase();
        }

        // Si llega un archivo, subimos uno nuevo
        if (file) {
            try {
                const fileRes = await this.dropboxFilesService.uploadFile(file, 'Calidad-de-Agua', dto.Titulo || CalidadAgua.Titulo);
                CalidadAgua.Url_Archivo = fileRes.url;
            } catch (err) {
                console.error('Error al subir el archivo a Dropbox:', err);
            }
        }

        // Si solo cambia el título, mover el archivo
        else if (dto.Titulo && dto.Titulo !== CalidadAgua.Titulo) {
            try {
                // Extraer el nombre viejo del archivo de la URL (sin usar toda la ruta pública)
                const oldFileName = CalidadAgua.Url_Archivo.split('/').pop()?.split('?')[0];
                const oldPath = `/Calidad-de-Agua/${oldFileName}`;
                const newPath = `/Calidad-de-Agua/${dto.Titulo}${oldFileName?.includes('.') ? oldFileName.slice(oldFileName.lastIndexOf('.')) : ''}`;

                await this.dropboxFilesService.updateFile(oldPath, newPath);

                // Actualizar URL pública
                const newUrl = await this.dropboxFilesService.getPublicUrl(newPath);
                CalidadAgua.Url_Archivo = newUrl;
            } catch (err) {
                console.error('Error al mover el archivo en Dropbox:', err);
            }
        }

        const calidadAguaActualizada = await this.calidadAguaRepository.save(CalidadAgua);

        // Registrar en auditoría
        try {
            await this.auditoriaService.logActualizacion('Calidad de Agua', idUsuario, Id_Calidad_Agua, datosAnteriores, {
                Titulo: calidadAguaActualizada.Titulo,
                Descripcion: calidadAguaActualizada.Descripcion,
                Url_Archivo: calidadAguaActualizada.Url_Archivo,
                Visible: calidadAguaActualizada.Visible
            });
        } catch (error) {
            console.error('Error al registrar auditoría de actualización de calidad de agua:', error);
        }

        return calidadAguaActualizada;
    }

    async updateEstadoCalidadAgua(Id_Calidad_Agua: number, Id_Estado_Calidad_Agua: number) {
        const calidadAgua = await this.calidadAguaRepository.findOne({ where: { Id_Calidad_Agua } });
        if (!calidadAgua) throw new NotFoundException(`Registro con ID ${Id_Calidad_Agua} no encontrado`);

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario }, relations: ['Rol'] });
        if (!usuario) throw new BadRequestException('Usuario no encontrado');

        // Guardar datos anteriores para auditoría
        const datosAnteriores = {
            Titulo: calidadAgua.Titulo,
            Descripcion: calidadAgua.Descripcion,
            Url_Archivo: calidadAgua.Url_Archivo,
            Visible: calidadAgua.Visible
        };

        const estado = await this.estadoCalidadAguaRepository.findOne({ where: { Id_Estado_Calidad_Agua } });
        if (!estado) { throw new NotFoundException(`Estado con ID ${Id_Estado_Calidad_Agua} no encontrado`); }

        calidadAgua.Estado = estado;
        return this.calidadAguaRepository.save(calidadAgua);
    }
}