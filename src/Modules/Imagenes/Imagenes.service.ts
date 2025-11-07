import { Usuario } from './../Usuarios/UsuarioEntities/Usuario.Entity';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImagenEntity } from './ImagenesEntity/Imagen.Entity';
import { CreateImagenDto } from "./ImagenesDTO's/CreateImagen.dto";
import { UpdateImagenDto } from "./ImagenesDTO's/UpdateImagen.dto";
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';
import { AuditoriaService } from '../Auditoria/auditoria.service';
import { UsuariosService } from '../Usuarios/Services/usuarios.service';

@Injectable()
export class ImagenesService {
  constructor(
    @InjectRepository(ImagenEntity)
    private readonly imagenRepository: Repository<ImagenEntity>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly usuariosService: UsuariosService,

    private readonly dropboxService: DropboxFilesService,

    private readonly auditoriaService: AuditoriaService
  ) { }

  async findAll() {
    return await this.imagenRepository.find({
      order: {
        Fecha_Creacion: 'DESC'
      }
    });
  }

  async findOne(id: number) {
    const imagen = await this.imagenRepository.findOne({ where: { Id_Imagen: id } });
    if (!imagen) throw new NotFoundException(`Imagen con ID ${id} no encontrada`);

    return imagen;
  }

  async create(createImagenDto: CreateImagenDto, idUsuario: number, file: Express.Multer.File) {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new BadRequestException('El usuario proporcionado no existe.');

    if (!file) throw new BadRequestException('El archivo de imagen es requerido');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) throw new BadRequestException('Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)');

    const imagenExistente = await this.imagenRepository.findOne({ where: { Nombre_Imagen: createImagenDto.Nombre_Imagen } });
    if (imagenExistente) throw new BadRequestException('Ya existe una imagen con ese nombre. Por favor elige otro nombre.');

    try {
      const uploadRes = await this.dropboxService.uploadFileDownloadOnly(file, 'Imagenes', createImagenDto.Nombre_Imagen);
      const dropboxUrl = uploadRes.url;

      const nuevaImagen = this.imagenRepository.create({
        Nombre_Imagen: createImagenDto.Nombre_Imagen,
        Imagen: dropboxUrl,
        Usuario: usuario,
      });

      const saved = await this.imagenRepository.save(nuevaImagen);

      try {
        await this.auditoriaService.logCreacion('Edicion de imagenes', idUsuario, nuevaImagen.Id_Imagen, {
          Nombre_Imagen: nuevaImagen.Nombre_Imagen,
          Imagen: nuevaImagen.Imagen,
        });
      } catch (error) {
        console.error('Error al registrar auditoría de creación de imagen:', error);
      }

      return {
        ...saved,
        Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario),
      }
    } catch (error: any) {
      throw new Error(`Error al crear imagen: ${error?.message ?? String(error)}`);
    }
  }

  async update(idImagen: number, updateImagenDto: UpdateImagenDto, idUsuario: number, file?: Express.Multer.File) {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new BadRequestException('El usuario proporcionado no existe.');

    const imagen = await this.findOne(idImagen);
    const carpetaAnterior = imagen.Nombre_Imagen;

    const datosAnteriores = {
      Id_Imagen: imagen.Id_Imagen,
      Nombre_Imagen: imagen.Nombre_Imagen,
      Imagen: imagen.Imagen
    }

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) throw new BadRequestException('Tipo de archivo no válido. Solo se permiten imágenes.');

      const uploadRes = await this.dropboxService.uploadFileDownloadOnly(file, 'Imagenes', updateImagenDto.Nombre_Imagen ?? imagen.Nombre_Imagen);
      imagen.Imagen = uploadRes.url;
    }

    if (updateImagenDto.Nombre_Imagen) imagen.Nombre_Imagen = updateImagenDto.Nombre_Imagen;

    const imagenActualizada = await this.imagenRepository.save(imagen);

    if (updateImagenDto.Nombre_Imagen && carpetaAnterior !== imagen.Nombre_Imagen) {
      try {
        await this.dropboxService.deletePath('Imagenes', undefined, undefined, carpetaAnterior);
        console.log(`Carpeta anterior eliminada: ${carpetaAnterior}`);
      } catch (deleteError) {
        console.warn(`No se pudo eliminar la carpeta anterior: ${carpetaAnterior}`, deleteError);
      }
    }

    try {
      await this.auditoriaService.logActualizacion('Edicion de imagenes', idUsuario, imagenActualizada.Id_Imagen, datosAnteriores, {
        Nombre_Imagen: imagenActualizada.Nombre_Imagen,
        Imagen: imagenActualizada.Imagen,
      });
    } catch (error) {
      console.error('Error al registrar auditoría de actualización de imagen:', error);
    }

    return {
      ...imagenActualizada,
      Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario),
    }
  }

  async remove(id: number, idUsuario: number) {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new BadRequestException('El usuario proporcionado no existe.');

    const imagen = await this.findOne(id);

    const datosEliminados = {
      Id_Imagen: imagen.Id_Imagen,
      Nombre_Imagen: imagen.Nombre_Imagen,
      Imagen: imagen.Imagen,
    }

    try {
      await this.auditoriaService.logEliminacion('Edicion de imagenes', idUsuario, imagen.Id_Imagen, datosEliminados);

      await this.dropboxService.deletePath('Imagenes', imagen.Nombre_Imagen);
    } catch (error: any) {
      throw new Error(`Error al eliminar imagen: ${error?.message ?? String(error)}`);
    }

    return await this.imagenRepository.remove(imagen);
  }
}