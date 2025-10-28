import {BadRequestException,Injectable,NotFoundException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManualEntity } from './ManualEntity/manual.entity';
import { CreateManualDto } from './ManualDTO\'s/createManual.dto';
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';

@Injectable()
export class ManualService {
  constructor(
    @InjectRepository(ManualEntity)
    private readonly manualRepository: Repository<ManualEntity>,

    private readonly dropboxFilesService: DropboxFilesService,
  ) {}

  async getManuales() {
    return await this.manualRepository.find();
  }

  async createManual(dto: CreateManualDto, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'Debe subir un archivo PDF para el manual de usuario.',
      );
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('El archivo debe ser un PDF.');
    }

    dto.Nombre_Manual =
      dto.Nombre_Manual.trim()[0].toUpperCase() +
      dto.Nombre_Manual.trim().slice(1).toLowerCase();

    const manualExistente = await this.manualRepository.findOne({
      where: { Nombre_Manual: dto.Nombre_Manual },
    });
    if (manualExistente) {
      throw new BadRequestException('El nombre del manual ya existe.');
    }

    const fileRes = await this.dropboxFilesService.uploadFile(
      file,
      'Manual-de-Usuario',
      dto.Nombre_Manual,
    );

    const manual = this.manualRepository.create({
      Nombre_Manual: dto.Nombre_Manual,
      PDF_Manual: fileRes.url,
    });

    return await this.manualRepository.save(manual);
  }

  async deleteManual(Id_Manual: number) {
    const manual = await this.manualRepository.findOne({
      where: { Id_Manual },
    });

    if (!manual) {
      throw new NotFoundException(`Manual con ID ${Id_Manual} no encontrado.`);
    }

    // Eliminar archivo en Dropbox si existe
    if (manual.Nombre_Manual) {
      await this.dropboxFilesService.deletePath('Manual-de-Usuario', manual.Nombre_Manual);
    }

    await this.manualRepository.remove(manual);
    return { message: 'Manual eliminado exitosamente.' };
  }
}
