import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SugerenciaEntity } from './Entity/SugerenciaEntity';
import { Estado_Sugerencia } from './Entity/EstadoSugerencia';
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';
import { EmailService } from '../Emails/email.service';
import { CreateSugerenciaDto } from './Dto/CreateSugerencia.dto';

@Injectable()
export class SugerenciaService {
  private readonly logger = new Logger(SugerenciaService.name);
  
  constructor(
    @InjectRepository(SugerenciaEntity)
    private readonly sugerenciaRepository: Repository<SugerenciaEntity>,

    @InjectRepository(Estado_Sugerencia)
    private readonly estadoRepository: Repository<Estado_Sugerencia>,

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

  async create(dto: CreateSugerenciaDto, files?: any) {
    this.logger.log(`🔍 [CREATE] DTO recibido:`, JSON.stringify(dto, null, 2));
    
    const estado = await this.estadoRepository.findOne({ where: { Id_EstadoSugerencia: 1 } });
    if (!estado) throw new BadRequestException('Estado por defecto no encontrado');

    const fecha = new Date();
    const sugerenciaData = {
      Mensaje: dto.Mensaje,
      Correo: dto.Correo,
      Fecha_Sugerencia: fecha,
      Estado: estado,
    };
    
    this.logger.log(`📝 [CREATE] Datos de sugerencia a guardar:`, JSON.stringify(sugerenciaData, null, 2));

    const saved = await this.sugerenciaRepository.save(sugerenciaData as any);

    this.logger.log(`💾 [CREATE] Sugerencia guardada:`, JSON.stringify(saved, null, 2));

    const adjuntoUrls: string[] = [];
    if (files?.Adjunto) {
      const archivos = Array.isArray(files.Adjunto) ? files.Adjunto : [files.Adjunto];
      const folderName = `sugerencia_${(saved as any).Id_Sugerencia}`;
      for (const file of archivos) {
        const res = await this.dropboxFilesService.uploadFile(file, 'Contacto', 'Sugerencias', undefined, folderName);
        if (res?.url) adjuntoUrls.push(res.url);
      }

      (saved as any).Adjunto = adjuntoUrls;
      await this.sugerenciaRepository.save(saved as any);
    }

    // Enviar email de confirmación de sugerencia (sin bloquear)
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

    const nuevoEstado = await this.estadoRepository.findOne({ where: { Id_EstadoSugerencia: nuevoEstadoId } });
    if (!nuevoEstado) throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);

    repo.Estado = nuevoEstado;
    return this.sugerenciaRepository.save(repo);
  }

  async responderSugerencia(id: number, respuesta: string) {
    const repo = await this.sugerenciaRepository.findOne({ 
      where: { Id_Sugerencia: id }, 
      relations: ['Estado'] 
    });
    if (!repo) throw new BadRequestException(`Sugerencia con id ${id} no encontrada`);
    
    this.logger.log(`📋 [RESPONDER] Sugerencia encontrada:`, JSON.stringify(repo, null, 2));

    repo.RespuestasSugerencia = respuesta;
    const estadoContestada = await this.estadoRepository.findOne({ where: { Id_EstadoSugerencia: 2 } });
    if (!estadoContestada) throw new BadRequestException('Estado contestada no encontrado');

    repo.Estado = estadoContestada;
    const updatedSugerencia = await this.sugerenciaRepository.save(repo);

    // Enviar email de respuesta de sugerencia (sin bloquear)
    const correoDestino = repo.Correo;
    this.logger.log(`Intentando enviar email de respuesta de sugerencia a: ${correoDestino}`);
    
    if (correoDestino) {
      setImmediate(async () => {
        try {
          this.logger.log(`Iniciando envío de email de respuesta de sugerencia para ID: ${id}`);
          await this.emailService.enviarEmailRespuestaSugerencia({
            Correo: correoDestino,
            Mensaje: repo.Mensaje,
            respuesta: respuesta,
          });
          this.logger.log(`Email de respuesta de sugerencia enviado exitosamente a: ${correoDestino}`);
        } catch (error) {
          this.logger.error('Error al enviar email de respuesta de sugerencia:', error);
        }
      });
    } else {
      this.logger.warn(`No se puede enviar email de respuesta de sugerencia: correo no disponible para ID ${id}`);
    }

    return updatedSugerencia;
  }

  async remove(id: number) {
    const repo = await this.sugerenciaRepository.findOne({ where: { Id_Sugerencia: id } });
    if (!repo) throw new BadRequestException(`Sugerencia con id ${id} no encontrada`);

    try {
      const folderName = `sugerencia_${id}`;
      await this.dropboxFilesService.deletePath('Contacto', 'Sugerencias', undefined, folderName);
    } catch (err) {
      console.warn(`No se pudo eliminar carpeta en Dropbox para sugerencia ${id}: ${err}`);
    }

    return this.sugerenciaRepository.remove(repo);
  }
}
