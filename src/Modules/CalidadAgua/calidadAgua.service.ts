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

@Injectable()
export class CalidadAguaService
{
    constructor
    (
        @InjectRepository(CalidadAgua)
        private readonly calidadAguaRepository: Repository<CalidadAgua>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly auditoriaService: AuditoriaService,
    ) {}

    @Public()
    async getCalidadAguaVisibles()
    {
        const calidadAgua = await this.calidadAguaRepository.createQueryBuilder('calidadAgua')
            .leftJoinAndSelect('calidadAgua.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .where('calidadAgua.Visible = :visible', { visible: true })
            .getMany();

        return calidadAgua.map(calidadAgua => ({
            ...calidadAgua,
            Usuario_Creador: calidadAgua.Usuario_Creador ? {
                Id_Usuario: calidadAgua.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: calidadAgua.Usuario_Creador.Nombre_Usuario,
                Id_Rol: calidadAgua.Usuario_Creador.Id_Rol,
                Nombre_Rol: calidadAgua.Usuario_Creador.Rol.Nombre_Rol
            } : null
        }));
    }

    async getCalidadAgua()
    {
        const calidadAgua = await this.calidadAguaRepository.createQueryBuilder('calidadAgua')
            .leftJoinAndSelect('calidadAgua.Usuario_Creador', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .getMany();

        return calidadAgua.map(calidadAgua => ({
            ...calidadAgua,
            Usuario_Creador: calidadAgua.Usuario_Creador ? {
                Id_Usuario: calidadAgua.Usuario_Creador.Id_Usuario,
                Nombre_Usuario: calidadAgua.Usuario_Creador.Nombre_Usuario,
                Id_Rol: calidadAgua.Usuario_Creador.Id_Rol,
                Nombre_Rol: calidadAgua.Usuario_Creador.Rol.Nombre_Rol
            } : null
        }));
    }

    async CreateCalidadAgua(dto: CreateCalidadAguaDto, idUsuarioCreador: number, file?: Express.Multer.File)
    {
        if (!file) { throw new BadRequestException('Debe subir un archivo para la calidad de agua'); }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuarioCreador }, relations: ['Rol'] });
        if (!usuario) { throw new BadRequestException('Usuario no encontrado'); }

        // Normalizar antes de procesar
        dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase();
        dto.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase();

        const calidadAguaTitulo = await this.calidadAguaRepository.findOne({ where: { Titulo: dto.Titulo } });
        if (calidadAguaTitulo) { throw new BadRequestException('El título ya existe'); }

        // Subir archivo a Dropbox
        const fileRes = await this.dropboxFilesService.uploadFile(file, 'Calidad-de-Agua', dto.Titulo);

        // Crear objeto entidad
        const calidadAgua = this.calidadAguaRepository.create({
            Titulo: dto.Titulo,
            Descripcion: dto.Descripcion,
            Url_Archivo: fileRes.url,
            Visible: false,
            Usuario_Creador: usuario
        });

        await this.auditoriaService.createAuditoria('Calidad de Agua', 'Insert', calidadAgua.Id_Calidad_Agua, idUsuarioCreador);
        await this.calidadAguaRepository.save(calidadAgua);

        return {
            ...calidadAgua,
            Usuario_Creador: {
                Id_Usuario: usuario.Id_Usuario,
                Nombre_Usuario: usuario.Nombre_Usuario,
                Id_Rol: usuario.Id_Rol,
                Nombre_Rol: usuario.Rol.Nombre_Rol
            }
        }
    }

    async updateCalidadAgua(Id_Calidad_Agua: number, dto: UpdateCalidadAguaDto, file?: Express.Multer.File)
    {
        const CalidadAgua = await this.calidadAguaRepository.findOne({ where: { Id_Calidad_Agua } });
        if (!CalidadAgua) { throw new NotFoundException(`Registro con ID ${Id_Calidad_Agua} no encontrado`); }

        if( dto.Titulo ) {
            dto.Titulo = dto.Titulo.trim()[0].toUpperCase() + dto.Titulo.trim().slice(1).toLowerCase();
        }

        if ( dto.Descripcion ) {
            dto.Descripcion = dto.Descripcion.trim()[0].toUpperCase() + dto.Descripcion.trim().slice(1).toLowerCase();
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

    async updateVisibilidadCalidadAgua(Id_Calidad_Agua: number) {
        const calidadAgua = await this.calidadAguaRepository.findOne({ where: { Id_Calidad_Agua } });
        if (!calidadAgua) { throw new NotFoundException(`Registro con ID ${Id_Calidad_Agua} no encontrado`); }

        calidadAgua.Visible = !calidadAgua.Visible;
        return this.calidadAguaRepository.save(calidadAgua);
    }
}