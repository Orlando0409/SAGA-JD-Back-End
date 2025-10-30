import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';
import { EmailService } from '../Emails/email.service';
import { EstadoSugerencia } from './SugerenciaEntities/EstadoSugerencia';
import { Sugerencia } from './SugerenciaEntities/Sugerencia.Entity';
import { CreateSugerenciaDto } from './SugerenciaDTO\'s/CreateSugerencia.dto';
import { ResponderSugerenciaDto } from './SugerenciaDTO\'s/ResponderSugerencia.dto';

interface SugerenciaFiles {
  Adjunto?: Express.Multer.File[];
}

@Injectable()
export class SugerenciaService {
  private readonly logger = new Logger(SugerenciaService.name);
  
  constructor(
    @InjectRepository(Sugerencia)
    private readonly sugerenciaRepository: Repository<Sugerencia>,

    @InjectRepository(EstadoSugerencia)
    private readonly estadoRepository: Repository<EstadoSugerencia>,

    private readonly dropboxFilesService: DropboxFilesService,
    private readonly emailService: EmailService,
  ) {}

  async getAll() {
    return this.sugerenciaRepository.find({ relations: ['Estado'] });
  }

  async getOne(id: number) {
    const repo = await this.sugerenciaRepository.findOne({ where: { Id_Sugerencia: id }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Sugerencia con id ${id} no encontrada`);
    return repo;
  }

  async create(dto: CreateSugerenciaDto, files?: SugerenciaFiles) {
    const estado = await this.estadoRepository.findOne({ where: { Id_Estado_Sugerencia: 1 } });
    if (!estado) throw new BadRequestException('Estado por defecto no encontrado');

    const fecha = new Date();
    const sugerenciaData = {
      Mensaje: dto.Mensaje,
      Correo: dto.Correo,
      Fecha_Sugerencia: fecha,
      Estado: estado,
    };
    
    const saved = await this.sugerenciaRepository.save(sugerenciaData);

    const adjuntoUrls: string[] = [];
    if (files?.Adjunto) {
      const archivos = Array.isArray(files.Adjunto) ? files.Adjunto : [files.Adjunto];
      const folderName = `sugerencia_${saved.Id_Sugerencia}`;
      for (const file of archivos) {
        const res = await this.dropboxFilesService.uploadFile(file, 'Contacto', 'Sugerencias', undefined, folderName);
        if (res?.url) adjuntoUrls.push(res.url);
      }

      saved.Adjunto = adjuntoUrls;
      await this.sugerenciaRepository.save(saved);
    }

    if (dto.Correo) {
      setImmediate(async () => {
        try {
          await this.emailService.enviarEmailSugerencia({
            Correo: dto.Correo,
            Mensaje: dto.Mensaje,
            adjuntos: adjuntoUrls,
          });
        } catch (error) {
          this.logger.error('Error al enviar email de sugerencia:', error);
        }
      });
    }

    return saved;
  }

  async updateEstado(id: number, nuevoEstadoId: number) {
    const repo = await this.sugerenciaRepository.findOne({ where: { Id_Sugerencia: id }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Sugerencia con id ${id} no encontrada`);

    const nuevoEstado = await this.estadoRepository.findOne({ where: { Id_Estado_Sugerencia: nuevoEstadoId } });
    if (!nuevoEstado) throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);

    repo.Estado = nuevoEstado;
    return this.sugerenciaRepository.save(repo);
  }

  async responderSugerencia(id: number, dto: ResponderSugerenciaDto) {
    const repo = await this.sugerenciaRepository.findOne({ 
      where: { Id_Sugerencia: id }, 
      relations: ['Estado'] 
    });
    if (!repo) throw new BadRequestException(`Sugerencia con id ${id} no encontrada`);

    repo.RespuestasSugerencia = dto.Respuesta;
    const estadoContestada = await this.estadoRepository.findOne({ where: { Id_Estado_Sugerencia: 2 } });
    if (!estadoContestada) throw new BadRequestException('Estado contestada no encontrado');

    repo.Estado = estadoContestada;
    const updatedSugerencia = await this.sugerenciaRepository.save(repo);

    const correoDestino = repo.Correo;
    if (correoDestino) {
      setImmediate(async () => {
        try {
          await this.emailService.enviarEmailRespuestaSugerencia({
            Correo: correoDestino,
            Mensaje: repo.Mensaje,
            respuesta: dto.Respuesta,
          });
        } catch (error) {
          this.logger.error('Error al enviar email de respuesta de sugerencia:', error);
        }
      });
    } else {
      this.logger.warn(`No se puede enviar email de respuesta de sugerencia: correo no disponible para ID ${id}`);
    }

    return updatedSugerencia;
  }
}