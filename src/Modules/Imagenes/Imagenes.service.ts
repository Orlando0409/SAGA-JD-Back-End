import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImagenEntity } from './ImagenesEntity/ImagenEntity';
import { CreateImagenDto } from "./ImagenesDTO's/CreateImagen.dto";
import { UpdateImagenDto } from "./ImagenesDTO's/UpdateImagen.dto";
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';

@Injectable()
export class ImagenesService {
  constructor(
    @InjectRepository(ImagenEntity)
    private imagenRepository: Repository<ImagenEntity>,
    private dropboxService: DropboxFilesService,
  ) { }

  async findAll(): Promise<ImagenEntity[]> {
    return await this.imagenRepository.find({
      order: {
        Fecha_Creacion: 'DESC'
      }
    });
  }

  async findOne(id: number): Promise<ImagenEntity> {
    const imagen = await this.imagenRepository.findOne({
      where: { Id_Imagen: id }
    });

    if (!imagen) {
      throw new NotFoundException(`Imagen con ID ${id} no encontrada`);
    }

    return imagen;
  }

  async create(createImagenDto: CreateImagenDto, file: Express.Multer.File): Promise<ImagenEntity> {
    if (!file) {
      throw new BadRequestException('El archivo de imagen es requerido');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)');
    }

    const imagenExistente = await this.imagenRepository.findOne({ where: { Nombre_Imagen: createImagenDto.Nombre_Imagen } });
    if (imagenExistente) {
      throw new BadRequestException('Ya existe una imagen con ese nombre. Por favor elige otro nombre.');
    }

    try {
      const uploadRes = await this.dropboxService.uploadFileDownloadOnly(file, 'Imagenes', undefined, undefined, createImagenDto.Nombre_Imagen);
      const dropboxUrl = uploadRes.url;
      
      const nuevaImagen = this.imagenRepository.create({
        Nombre_Imagen: createImagenDto.Nombre_Imagen,
        Imagen: dropboxUrl,
        Fecha_Creacion: new Date(),
        Fecha_Actualizacion: new Date()
      });

      return await this.imagenRepository.save(nuevaImagen);
    } catch (error: any) {
      throw new Error(`Error al crear imagen: ${error?.message ?? String(error)}`);
    }
  }

  async update(id: number,updateImagenDto: UpdateImagenDto,file?: Express.Multer.File): Promise<ImagenEntity> {
    const imagen = await this.findOne(id);
    const carpetaAnterior = imagen.Nombre_Imagen;

    try {
    
      if (file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          throw new BadRequestException('Tipo de archivo no válido. Solo se permiten imágenes.');
        }
       
        const uploadRes = await this.dropboxService.uploadFile(file, 'Imagenes', undefined, undefined, updateImagenDto.Nombre_Imagen ?? imagen.Nombre_Imagen);
        imagen.Imagen = uploadRes.url;
      }

      if (updateImagenDto.Nombre_Imagen) {
        imagen.Nombre_Imagen = updateImagenDto.Nombre_Imagen;
      }
      imagen.Fecha_Actualizacion = new Date();

      const imagenActualizada = await this.imagenRepository.save(imagen);

      if (updateImagenDto.Nombre_Imagen && carpetaAnterior !== imagen.Nombre_Imagen) {
        try {
          await this.dropboxService.deletePath('Imagenes', undefined, undefined, carpetaAnterior);
          console.log(`Carpeta anterior eliminada: ${carpetaAnterior}`);
        } catch (deleteError) {
          console.warn(`No se pudo eliminar la carpeta anterior: ${carpetaAnterior}`, deleteError);
        }
      }

      return imagenActualizada;
    } catch (error: any) {
      throw new Error(`Error al actualizar imagen: ${error?.message ?? String(error)}`);
    }
  }

  async remove(id: number): Promise<void> {
    const imagen = await this.findOne(id);

    try {
      await this.dropboxService.deletePath('Imagenes', undefined, undefined, imagen.Nombre_Imagen);

      await this.imagenRepository.remove(imagen);
    } catch (error: any) {
      throw new Error(`Error al eliminar imagen: ${error?.message ?? String(error)}`);
    }
  }
}