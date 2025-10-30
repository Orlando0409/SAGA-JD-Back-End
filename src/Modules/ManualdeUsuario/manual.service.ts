import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';
import { AuditoriaService } from '../Auditoria/auditoria.service';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { ManualEntity } from './ManualEntities/Manual.Entity';
import { UsuariosService } from '../Usuarios/Services/usuarios.service';
import { CreateManualDto } from './ManualDTO\'s/CreateManual.dto';

@Injectable()
export class ManualService {
  constructor(
    @InjectRepository(ManualEntity)
    private readonly manualRepository: Repository<ManualEntity>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly dropboxFilesService: DropboxFilesService,

    private readonly usuariosService: UsuariosService,

    private readonly auditoriaService: AuditoriaService,
  ) { }

  async getManuales() {
    return await this.manualRepository.find();
  }

  async createManual(dto: CreateManualDto, idUsuario: number, file?: Express.Multer.File) {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new BadRequestException('El usuario proporcionado no existe.');

    if (!file) throw new BadRequestException('Debe subir un archivo PDF para el manual de usuario');
    if (file.mimetype !== 'application/pdf') throw new BadRequestException('El archivo debe ser un PDF.');

    dto.Nombre_Manual = dto.Nombre_Manual.trim()[0].toUpperCase() + dto.Nombre_Manual.trim().slice(1).toLowerCase();

    const manualExistente = await this.manualRepository.findOne({where: { Nombre_Manual: dto.Nombre_Manual }});
    if (manualExistente) throw new BadRequestException('El nombre del manual ya existe.');

    const fileRes = await this.dropboxFilesService.uploadFile(file, 'Manual-de-Usuario', dto.Nombre_Manual);

    const manual = this.manualRepository.create({
      Nombre_Manual: dto.Nombre_Manual,
      PDF_Manual: fileRes.url,
      Usuario: usuario,
    });

    await this.manualRepository.save(manual);

    try {
      await this.auditoriaService.logCreacion('Manuales de Usuario', idUsuario, manual.Id_Manual, {
        Nombre_Manual: manual.Nombre_Manual,
        PDF_Manual: manual.PDF_Manual,
      });
    } catch (error) {
      console.error('Error al registrar auditoría de creación de manual de usuario:', error);
    }

    return {
      ...manual,
      Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario),
    }
  }

  async deleteManual(idManual: number, idUsuario: number) {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepository.findOne({where: { Id_Usuario: idUsuario }});
    if (!usuario) throw new NotFoundException(`Usuario con ID ${idUsuario} no encontrado.`);

    const manual = await this.manualRepository.findOne({where: { Id_Manual: idManual }});
    if (!manual) throw new NotFoundException(`Manual con ID ${idManual} no encontrado.`);

    const datosEliminados = {
      Nombre_Manual: manual.Nombre_Manual,
      PDF_Manual: manual.PDF_Manual,
    };

    // Eliminar archivo en Dropbox si existe
    if (manual.Nombre_Manual) await this.dropboxFilesService.deletePath('Manual-de-Usuario', manual.Nombre_Manual);

    await this.manualRepository.remove(manual);

    try {
      await this.auditoriaService.logEliminacion('Manuales de Usuario', idUsuario, idManual, datosEliminados);
    } catch (error) {
      console.error('Error al registrar auditoría de eliminación de manual de usuario:', error);
    }

    return {
      message: `Manual con ID ${idManual} eliminado correctamente.`,
      ...manual,
      Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario),
    }
  }
}
