import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportesEntity } from './ReportesEntity/ReportesEntity';
import { EstadoReporte } from './ReportesEntity/EstadoReporte';
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';
import { EmailService } from '../Emails/email.service';
import { CreateReporteDto } from './ReportesDto/CreateReporte.dto';
import { ResponderReporteDto } from './ReportesDto/ResponderReporte.dto';

interface ReporteFiles {
  Adjunto?: Express.Multer.File[];
}

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);
  
  constructor(
    @InjectRepository(ReportesEntity)
    private readonly reportesRepository: Repository<ReportesEntity>,

    @InjectRepository(EstadoReporte)
    private readonly estadoReporteRepository: Repository<EstadoReporte>,

    private readonly dropboxFilesService: DropboxFilesService,
    private readonly emailService: EmailService,
  ) {}

  async getAll() {
    return this.reportesRepository.find({ relations: ['Estado'] });
  }

  async getOne(id: number) {
    const repo = await this.reportesRepository.findOne({ where: { IdReporte: id }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Reporte con id ${id} no encontrado`);
    return repo;
  }

  async create(dto: CreateReporteDto, files?: ReporteFiles) {
    const estado = await this.estadoReporteRepository.findOne({ where: { IdEstadoReporte: 1 } });
    if (!estado) throw new BadRequestException('Estado por defecto no encontrado');

    const fecha = new Date();
    const nombre = dto.name?.toString().trim();
    const primerApellido = dto.Papellido?.toString().trim();
    const segundoApellido = dto.Sapellido?.toString().trim();
    const rawFolder = [nombre, primerApellido, segundoApellido].filter(Boolean).join(' ');
    const folderName = rawFolder.replace(/[\\/\:\*\?"<>\|]/g, '').replace(/\s+/g, ' ').trim();

    const reporteData = {
      ...dto,
      Fecha_Reporte: fecha,
      Estado: estado,
    };
    
    const saved = await this.reportesRepository.save(reporteData);

    const adjuntoUrls: string[] = [];
    if (files?.Adjunto) {
      const archivos = Array.isArray(files.Adjunto) ? files.Adjunto : [files.Adjunto];
      for (const file of archivos) {
        const res = await this.dropboxFilesService.uploadFile(file, 'Contacto', 'Reportes', undefined, folderName);
        if (res?.url) adjuntoUrls.push(res.url);
      }

      saved.Adjunto = adjuntoUrls;
      await this.reportesRepository.save(saved);
    }

    if (dto.Correo) {
      setImmediate(async () => {
        try {
          await this.emailService.enviarEmailReporte({
            name: dto.name,
            Papellido: dto.Papellido,
            Sapellido: dto.Sapellido,
            Correo: dto.Correo,
            ubicacion: dto.ubicacion,
            descripcion: dto.descripcion,
            adjuntos: adjuntoUrls,
          });
        } catch (error) {
          this.logger.error('Error al enviar email de reporte:', error);
        }
      });
    }

    return saved;
  }

  async remove(id: number) {
    const repo = await this.reportesRepository.findOne({ where: { IdReporte: id } });
    if (!repo) throw new BadRequestException(`Reporte con id ${id} no encontrado`);

    try {
      const nombre = repo.name?.toString().trim();
      const primerApellido = repo.Papellido?.toString().trim();
      const segundoApellido = repo.Sapellido?.toString().trim();
      const rawFolder = [nombre, primerApellido, segundoApellido].filter(Boolean).join(' ');
      const folderName = rawFolder.replace(/[\\/\:\*\?"<>\|]/g, '').replace(/\s+/g, ' ').trim();
      await this.dropboxFilesService.deletePath('Contacto', 'Reportes', undefined, folderName);
    } catch (err) {
      console.warn(`No se pudo eliminar carpeta en Dropbox para reporte ${id}: ${err}`);
    }

    return this.reportesRepository.remove(repo);
  }

  async updateEstado(id: number, nuevoEstadoId: number) {
    const repo = await this.reportesRepository.findOne({ where: { IdReporte: id }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Reporte con id ${id} no encontrado`);

    const nuevoEstado = await this.estadoReporteRepository.findOne({ where: { IdEstadoReporte: nuevoEstadoId } });
    if (!nuevoEstado) throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);

    repo.Estado = nuevoEstado;
    return this.reportesRepository.save(repo);
  }

  async responderReporte(id: number, dto: ResponderReporteDto) {
    const repo = await this.reportesRepository.findOne({ 
      where: { IdReporte: id }, 
      relations: ['Estado'] 
    });
    if (!repo) throw new BadRequestException(`Reporte con id ${id} no encontrado`);

    repo.RespuestasReporte = dto.Respuesta;
    const estadoContestada = await this.estadoReporteRepository.findOne({ where: { IdEstadoReporte: 2 } });
    if (!estadoContestada) throw new BadRequestException('Estado contestada no encontrado');

    repo.Estado = estadoContestada;
    const updatedReporte = await this.reportesRepository.save(repo);

    const correoDestino = repo.Correo;
    if (correoDestino) {
      setImmediate(async () => {
        try {
          await this.emailService.enviarEmailRespuestaReporte({
            name: repo.name,
            Papellido: repo.Papellido,
            Sapellido: repo.Sapellido,
            Correo: correoDestino,
            ubicacion: repo.ubicacion,
            descripcion: repo.descripcion,
            respuesta: dto.Respuesta,
          });
        } catch (error) {
          this.logger.error('Error al enviar email de respuesta de reporte:', error);
        }
      });
    } else {
      this.logger.warn(`No se puede enviar email de respuesta de reporte: correo no disponible para ID ${id}`);
    }

    return updatedReporte;
  }
}
