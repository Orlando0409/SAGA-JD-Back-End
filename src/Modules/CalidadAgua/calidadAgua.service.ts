import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CalidadAgua } from "./CalidadAguaEntities/CalidadAgua.Entity";
import { CreateCalidadAguaDto } from "./CalidadAguaDTO's/CreateCalidadAgua.dto";
import { UpdateCalidadAguaDto } from "./CalidadAguaDTO's/UpdateCalidadAgua.dto";
import { Public } from "../auth/Decorator/Public.decorator";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { AuditoriaService } from "../Auditoria/auditoria.service";
import { UsuariosService } from "../Usuarios/Services/usuarios.service";

@Injectable()
export class CalidadAguaService {
    constructor
        (
            @InjectRepository(CalidadAgua)
            private readonly calidadAguaRepository: Repository<CalidadAgua>,

            @InjectRepository(Usuario)
            private readonly usuarioRepository: Repository<Usuario>,

            private readonly dropboxFilesService: DropboxFilesService,

            private readonly auditoriaService: AuditoriaService,

            private readonly usuariosService: UsuariosService,
        ) { }

    @Public()
    async getCalidadAguaVisibles() {
        const calidadAgua = await this.calidadAguaRepository.createQueryBuilder('calidadAgua')
            .leftJoinAndSelect('calidadAgua.Usuario', 'usuario')
            .where('calidadAgua.Visible = :visible', { visible: true })
            .getMany();

        return Promise.all(calidadAgua.map(async calidadAgua => ({
            ...calidadAgua,
            Usuario: calidadAgua.Usuario ?
                await this.usuariosService.FormatearUsuarioResponse(calidadAgua.Usuario) : null
        })));
    }

    async getCalidadAgua() {
        const calidadAgua = await this.calidadAguaRepository.createQueryBuilder('calidadAgua')
            .leftJoinAndSelect('calidadAgua.Usuario', 'usuario')
            .getMany();

        return Promise.all(calidadAgua.map(async calidadAgua => ({
            ...calidadAgua,
            Usuario: calidadAgua.Usuario ?
                await this.usuariosService.FormatearUsuarioResponse(calidadAgua.Usuario) : null
        })));
    }

    async CreateCalidadAgua(dto: CreateCalidadAguaDto, idUsuario: number, file?: Express.Multer.File) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

        if (!file) throw new BadRequestException('Debe subir un archivo para la calidad de agua');

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
            Visible: false,
            Usuario: usuario
        });

        const calidadAguaGuardada = await this.calidadAguaRepository.save(calidadAgua);

        // Registrar en auditoría después de guardar
        try {
            await this.auditoriaService.logCreacion('Calidad de Agua', idUsuario, calidadAguaGuardada.Id_Calidad_Agua, {
                Titulo: calidadAguaGuardada.Titulo,
                Descripcion: calidadAguaGuardada.Descripcion,
                Url_Archivo: calidadAguaGuardada.Url_Archivo,
                Visible: calidadAguaGuardada.Visible
            });
        } catch (error) {
            console.error('Error al registrar auditoría de creación de calidad de agua:', error);
        }

        return {
            ...calidadAguaGuardada,
            Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
        }
    }

    async updateCalidadAgua(Id_Calidad_Agua: number, dto: UpdateCalidadAguaDto, idUsuario: number, file?: Express.Multer.File) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

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

    async updateVisibilidadCalidadAgua(Id_Calidad_Agua: number, idUsuario: number) {
        if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

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

        calidadAgua.Visible = !calidadAgua.Visible;
        const calidadAguaActualizada = await this.calidadAguaRepository.save(calidadAgua);

        try {
            await this.auditoriaService.logActualizacion('Calidad de Agua', idUsuario, Id_Calidad_Agua, datosAnteriores, {
                Titulo: calidadAguaActualizada.Titulo,
                Descripcion: calidadAguaActualizada.Descripcion,
                Url_Archivo: calidadAguaActualizada.Url_Archivo,
                Visible: calidadAguaActualizada.Visible
            });
        } catch (error) {
            console.error('Error al registrar auditoría de cambio de visibilidad de calidad de agua:', error);
        }

        return calidadAguaActualizada;
    }
}